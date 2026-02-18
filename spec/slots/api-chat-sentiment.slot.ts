import type { SentimentLabel } from "../../src/shared/types/chat";

interface SentimentResult {
  emoji: string;
  label: SentimentLabel;
  score: number;
  keywords: string[];
}

// 캐시: messageId → SentimentResult
const cache = new Map<string, SentimentResult>();

const KEYWORDS: Record<string, string[]> = {
  positive: ["좋아", "감사", "고마워", "최고", "훌륭", "잘했", "기쁘", "행복", "사랑", "완벽", "굿", "good", "great", "thanks", "awesome", "love", "nice", "👍", "😊", "❤️", "🎉", "ㅎㅎ", "ㅋㅋ", "헤헤"],
  negative: ["싫어", "별로", "최악", "나쁘", "힘들", "어렵", "실망", "못", "안돼", "bad", "hate", "worst", "awful", "terrible", "😞", "😔"],
  humor: ["ㅋㅋ", "ㅋㅋㅋ", "ㅎㅎ", "ㅎㅎㅎ", "lol", "lmao", "😂", "🤣", "웃겨", "재밌", "ㅋ", "크크"],
  angry: ["화나", "짜증", "열받", "빡쳐", "싫다", "최악", "꺼져", "angry", "mad", "frustrated", "😠", "😤", "🤬", "!!"],
  surprise: ["와", "헐", "대박", "진짜", "설마", "wow", "omg", "really", "seriously", "😮", "😲", "🤯", "!!"],
  sad: ["슬퍼", "울고", "힘들", "외로", "그리워", "sad", "cry", "miss", "lonely", "😢", "😭", "💔"],
};

function analyzeSentiment(text: string): SentimentResult {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = { positive: 0, negative: 0, humor: 0, angry: 0, surprise: 0, sad: 0 };
  const foundKeywords: string[] = [];

  for (const [label, words] of Object.entries(KEYWORDS)) {
    for (const word of words) {
      if (lower.includes(word)) {
        scores[label] = (scores[label] ?? 0) + 1;
        if (!foundKeywords.includes(word)) foundKeywords.push(word);
      }
    }
  }

  const maxLabel = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  const total = Object.values(scores).reduce((s, v) => s + v, 0);

  if (total === 0 || maxLabel[1] === 0) {
    return { emoji: "😐", label: "neutral", score: 0, keywords: [] };
  }

  const label = maxLabel[0] as SentimentLabel;
  const emojiMap: Record<string, string> = {
    positive: "😊", negative: "😔", humor: "😂", angry: "😠", surprise: "😮", sad: "😢", neutral: "😐",
  };
  const scoreMap: Record<string, number> = {
    positive: 0.8, negative: -0.6, humor: 0.5, angry: -0.8, surprise: 0.3, sad: -0.5, neutral: 0,
  };

  return {
    emoji: emojiMap[label] ?? "😐",
    label,
    score: scoreMap[label] ?? 0,
    keywords: foundKeywords.slice(0, 5),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const messageId = url.searchParams.get("messageId") ?? "";
  if (!messageId) {
    return Response.json({ error: "messageId 필수" }, { status: 400 });
  }
  const cached = cache.get(messageId);
  if (cached) return Response.json(cached);
  return Response.json({ error: "분석 결과 없음 (POST로 먼저 분석 필요)" }, { status: 404 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { text?: string; messageId?: string };
  const { text, messageId } = body;

  if (!text) {
    return Response.json({ error: "text 필수" }, { status: 400 });
  }

  const result = analyzeSentiment(text);
  if (messageId) cache.set(messageId, result);
  return Response.json(result);
}

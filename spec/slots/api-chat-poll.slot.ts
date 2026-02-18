interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  roomId: string;
  question: string;
  options: PollOption[];
  anonymous: boolean;
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
  // 중복 참여 방지용 (익명이어도 투표 여부만 기록)
  _voters: Set<string>;
}

const polls = new Map<string, Poll>(); // pollId → Poll
let pollCounter = 0;

function getActivePolls(roomId: string): Poll[] {
  const now = new Date();
  return Array.from(polls.values()).filter(
    (p) => p.roomId === roomId && (!p.expiresAt || new Date(p.expiresAt) > now)
  );
}

export default async function handler(req: Request) {
  const method = req.method;
  const url = new URL(req.url);

  if (method === "GET") {
    const roomId = url.searchParams.get("roomId") ?? "";
    const activePolls = getActivePolls(roomId).map(({ _voters, ...poll }) => poll);
    return Response.json({ polls: activePolls });
  }

  const body = await req.json().catch(() => ({}));

  if (method === "POST") {
    const { roomId, question, options, anonymous = true, createdBy, expiresInMinutes } = body;
    if (!roomId || !question || !options?.length) {
      return Response.json({ error: "필수 파라미터 누락" }, { status: 400 });
    }
    const id = `poll_${++pollCounter}_${Date.now()}`;
    const poll: Poll = {
      id,
      roomId,
      question,
      options: options.map((text: string) => ({ text, votes: 0 })),
      anonymous,
      createdAt: new Date().toISOString(),
      createdBy,
      expiresAt: expiresInMinutes
        ? new Date(Date.now() + expiresInMinutes * 60000).toISOString()
        : undefined,
      _voters: new Set(),
    };
    polls.set(id, poll);
    const { _voters, ...result } = poll;
    return Response.json(result, { status: 201 });
  }

  if (method === "PUT") {
    const { pollId, optionIndex, userId } = body;
    const poll = polls.get(pollId);
    if (!poll) return Response.json({ error: "투표를 찾을 수 없습니다" }, { status: 404 });
    if (poll._voters.has(userId)) {
      return Response.json({ error: "이미 투표했습니다" }, { status: 409 });
    }
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return Response.json({ error: "잘못된 옵션 인덱스" }, { status: 400 });
    }
    poll.options[optionIndex].votes++;
    poll._voters.add(userId);
    const { _voters, ...result } = poll;
    return Response.json({ success: true, poll: result });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}

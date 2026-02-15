"use client";

import { wrapComponent } from "@mandujs/core/client";
import HomePageClient from "./page.client";

// NOTE: Mandu FS Routes는 *.island.tsx 를 hydration clientModule 로 인식합니다.
// 이 파일이 존재해야 `mandu build`가 client bundle을 생성하고, dev server가 hydration script를 주입합니다.
export default wrapComponent(HomePageClient);

import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // 본 프로젝트 디렉토리를 trace root로 못박기. 한글 경로 환경에서 lockfile
  // 자동 검색이 상위 디렉토리(C:\Users\user)를 root로 잘못 잡는 것을 방지.
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;

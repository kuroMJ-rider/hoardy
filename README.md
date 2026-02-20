깃허브 저장소의 얼굴이 될 README.md 파일을 작성해 드립니다. 사용자님의 기획 의도와 기술적 성취, 그리고 **'나를 연구하는 작은 인류학'**이라는 독특한 철학을 마크다운 형식으로 정교하게 정리했습니다.

🦖 Hoardy (호디) - 나를 연구하는 작은 인류학
"지식은 쌓아둘 때가 아니라, 필요할 때 바로 꺼낼 수 있을 때 비로소 내 것이 됩니다."

**Hoardy(호디)**는 무분별하게 정보만을 수집하는 '호더(Hoarder)'에서 벗어나, 나만의 지식 자산을 구축하고 스스로를 탐구하는 프라이빗 세컨드 브레인(Second Brain) 서비스입니다. 흩어진 링크를 호디에게 던져주세요. 호디가 맛있게 소화하여 당신의 지적 자산으로 만들어 드립니다.

✨ 핵심 컨셉 및 기능
🧠 1. 지식 소화 엔진 (AI Digest)
단순한 북마크를 넘어섭니다. 링크를 입력하면 호디의 소화 파이프라인이 작동합니다.

Smart Scraping: Cheerio 기반의 고성능 스크래퍼가 웹사이트의 메타데이터를 정밀하게 추출합니다.

AI Summarization: Google Gemini AI가 방대한 내용을 3줄로 핵심 요약하고, 맥락에 맞는 서랍(카테고리)으로 자동 분류합니다.

📊 2. 주간 인류학 리포트 (Private Anthropology)
내가 수집한 지식의 궤적은 곧 나 자신을 보여주는 가장 정교한 데이터셋입니다.

인류학적 통찰: 한 주간 쌓인 데이터를 분석하여 당신의 관심사 변화를 리포트로 제공합니다.

개인화 멘트: 데이터 분석가, 예술가, 철학자 등 당신의 수집 패턴에 최적화된 호디의 위트 있는 분석 멘트를 만나보세요.

🛡️ 3. 지식의 자산화 (Zero Social Policy)
호디는 타인에게 보여주기 위한 전시용 공간이 아닙니다.

완벽한 비공개: 공유 기능이 없는 '지식 안전가옥'에서 오직 미래의 나를 위한 투자를 이어가세요.

세컨드 브레인: 뇌는 기억하는 곳이 아니라 아이디어를 만드는 곳입니다. 기억은 호디에게 맡기고, 당신은 통찰에만 집중하세요.

🛠 Tech Stack
Frontend & Framework
Next.js (App Router): 최신 프레임워크를 통한 고성능 SSR 및 최적화된 사용자 경험.

Tailwind CSS: 다크 모드 기반의 세련되고 직관적인 UI 디자인.

Framer Motion: 호디의 생동감 넘치는 반응형 애니메이션 구현.

Backend & Infrastructure
Supabase: 인증(Auth) 및 실시간 데이터베이스(PostgreSQL) 연동.

Vercel: Edge Functions를 활용한 안정적인 서버리스 배포.

Intelligence & Utilities
Google Gemini 1.5 Pro/Flash API: 지능형 요약 및 서랍 자동 분류 로직.

Cheerio: 서버 사이드 웹 데이터 파싱 및 메타데이터 추출.

Lucide React: 직관적인 벡터 아이콘 시스템.

🚀 시작하기
환경 변수 설정
프로젝트 루트에 .env.local 파일을 생성하고 아래 변수들을 설정해야 합니다.

코드 스니펫
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI 설정
GEMINI_API_KEY=your_google_gemini_api_key
설치 및 실행
Bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev
📂 프로젝트 철학
우리는 매일 엄청난 양의 정보를 소비하지만, 그중 우리에게 남는 것은 얼마나 될까요?
호디는 데이터 분석과 인문학적 성찰을 결합하여, 유저가 수집한 지식이 휘발되지 않고 삶의 자산으로 정착할 수 있도록 돕습니다.

내가 무엇을 읽었는지가 내가 누구인지를 말해줍니다. 지금 바로 호디와 함께 당신만의 작은 인류학을 시작해보세요.

Hoardy - Digested by Hoardy, Grown by You. 👾🚀

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

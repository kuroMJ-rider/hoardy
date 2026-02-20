/** DB에서 서랍을 가져올 수 없을 때 사용하는 기본 칩 (개발/폴백용) */
export type Drawer = {
  id: string;
  name: string;
  icon: string | null;
  instruction: string | null;
};

/** 신규 유저 온보딩용 기본 서랍 (DB bulk insert 템플릿) */
export const DEFAULT_DRAWERS: Drawer[] = [
  { id: "template-general", name: "일반", icon: "📁", instruction: "분류되지 않은 일반적인 링크" },
  { id: "template-learning", name: "학습", icon: "📖", instruction: "학습, 교육, 튜토리얼 관련" },
  { id: "template-work", name: "업무", icon: "📋", instruction: "업무, 생산성, 업계 뉴스" },
  { id: "template-interest", name: "관심사", icon: "★", instruction: "개인 관심사, 취미, 트렌드" },
];

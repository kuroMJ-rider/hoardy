type PersonaType = 'ANTHROPOLOGIST' | 'OBSERVER' | 'ARTIST' | 'HUSTLER';

interface ReportMessage {
  text: string;
  subText: string;
}

const REPORT_MESSAGES: Record<PersonaType, ReportMessage[]> = {
  ANTHROPOLOGIST: [
    {
      text: "이번 주 당신의 궤적은 '데이터 인류학' 그 자체였어.",
      subText: "데이터 윤리를 고민하며 기술보다 인간을 먼저 보려는 따뜻한 시선이 느껴져. 숫자의 배열 사이에서 당신만의 진실을 읽어낸 한 주였네."
    },
    {
      text: "코호트 분석보다 더 깊은 인간의 숨결을 읽었구나?",
      subText: "Target 임신 예측 케이스처럼 데이터가 삶을 앞지르는 시대에, 당신은 인간의 존엄을 지키는 분석을 하고 있어. 아주 훌륭한 탐구였어."
    }
  ],
  OBSERVER: [
    {
      text: "금강경의 '일체유위법'을 씹으며 양자역학을 고민한 한 주였네.",
      subText: "세상 모든 것이 꿈과 같고 이슬과 같다지만, 호디의 서랍에 담긴 이 지식만큼은 당신의 깨달음을 증명하고 있어. 아주 우아한 관찰이었어."
    },
    {
      text: "'무주상보시'의 마음으로 지식을 수집하고 있구나?",
      subText: "'삼심불가득'이라 하여 마음은 머무는 곳 없이 흐르지만, 기록은 내가 붙잡아둘게. 당신의 마음이 지식의 '선정'에 머문 한 주였어."
    }
  ],
  ARTIST: [
    {
      text: "예술과 삶 사이의 틈(Gap)에서 아주 멋지게 일했어.",
      subText: "라우센버그처럼 당신도 지식의 파편들을 모아 당신만의 '콤바인'을 완성해가고 있구나. 'Joy of Serendipity'가 가득한 멋진 전시회 같은 한 주였어."
    },
    {
      text: "계획되지 않은 우연한 발견이 당신만의 지도를 만들었어.",
      subText: "일상의 사물이 예술이 되듯, 당신이 수집한 평범한 링크들도 이제 당신만의 독특한 취향이라는 예술 작품이 되었네."
    }
  ],
  HUSTLER: [
    {
      text: "이번 주는 완전히 'Arize AI'와 비즈니스 모델에 몰입했네!",
      subText: "코스모스의 질서만큼이나 정교한 비즈니스 로직을 탐구하는 모습이 인상적이야. 매트릭스 속 가상 현실일지라도 당신의 성장은 실제적인 데이터지."
    },
    {
      text: "데이터 허슬러의 기운이 느껴져. 생산성이 폭발했는걸?",
      subText: "AARRR 지표를 챙기며 비즈니스의 생존을 고민하는 치열함이 돋보였어. 당신의 분석력을 먹고 나도 이만큼 자랐어. 이제 좀 쉬어도 돼!"
    }
  ]
};

const FALLBACK_MESSAGE: ReportMessage = {
  text: "이번 주는 조용했어. 새로운 링크를 던져주면 호디가 씹어볼게!",
  subText: "서랍이 비어 있어도 괜찮아. 관심 가는 링크를 하나 저장하면 다음 주 리포트가 더 풍성해질 거야."
};

export function getRandomReport(topDrawerName: string | null): ReportMessage {
  if (!topDrawerName) return FALLBACK_MESSAGE;

  let persona: PersonaType = 'ANTHROPOLOGIST';

  switch (topDrawerName) {
    case '학습':
      persona = 'ANTHROPOLOGIST';
      break;
    case '관심사':
      persona = Math.random() > 0.5 ? 'OBSERVER' : 'ARTIST';
      break;
    case '업무':
      persona = 'HUSTLER';
      break;
    default:
      persona = 'ANTHROPOLOGIST';
  }

  const messages = REPORT_MESSAGES[persona];
  return messages[Math.floor(Math.random() * messages.length)];
}

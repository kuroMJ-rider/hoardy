# 호디 캐릭터 에셋 가이드라인 v3.0

## 1. 배경 (Background)

| 용도 | 설정 | 비고 |
|------|------|------|
| **메인 페이지** | 그라데이션 배경 | 앱에서 직접 구현 |
| **캐릭터 PNG** | **투명 (Alpha)** | PNG 필수 |

⚠️ **중요**:
- 캐릭터 이미지는 **투명 배경 PNG** 사용
- 배경은 앱/웹에서 직접 그라데이션으로 구현
- 이미지는 오직 **캐릭터만** 포함

## 2. 브랜드 색상 (Brand Colors)

| 이름 | HEX | 용도 |
|------|-----|------|
| `--hoardy-mint` | `#98FF98` | 민트 그린 (메인) |
| `--hoardy-pink` | `#FF69B4` | 핑크 (서브) |
| `--hoardy-magenta` | `#C71585` | 마젠타 (강조) |

## 3. 배경 그라데이션 (코드로 구현)

```css
/* CSS */
background: linear-gradient(180deg,
  rgba(26, 47, 26, 1) 0%,    /* 상단: 어두운 녹색 #1a2f1a */
  rgba(42, 26, 47, 1) 100%   /* 하단: 어두운 자주색 #2a1a2f */
);
```

```jsx
// React Native
<LinearGradient
  colors={['#1a2f1a', '#2a1a2f']}
  style={styles.background}
>
  {/* 캐릭터 컴포넌트 */}
</LinearGradient>
```

## 4. 파일 규격

| 항목 | 규격 |
|------|------|
| **형식** | PNG (투명 배경 필수) |
| **해상도** | 1024×1024 px |
| **비율** | 1:1 정사각형 |
| **배경** | 완전 투명 (Alpha channel) |
| **압축** | 적절히 최적화 (100~500KB 권장) |

## 5. 파일 목록 및 용도

| 파일명 | 용도 |
|--------|------|
| `hoardy_idle_transparent.png` | 대기 (기본) |
| `hoardy_eating_transparent.png` | 먹는 중 |
| `hoardy_hungry_transparent.png` | 배고픔 |
| `hoardy_digesting_transparent.png` | 소화 중 |
| `hoardy_vomiting_transparent.png` | 실패/에러 |
| `link_icon_transparent.png` | 링크 드롭 애니메이션 아이콘 |

## 6. 디자인 규칙

- **비율 고정**: 리사이즈 시 1:1 비율 유지 (왜곡 금지)
- **상태 전환**: 크로스페이드 없이 즉시 교체
- **일관성**: 모든 상태 이미지의 캐릭터 위치·크기·스타일 유지
- **배경 통일**: 완전 투명 (Alpha) — 앱 그라데이션과 자연스럽게 합성

## 7. Quick Reference

```
배경:       투명 (Alpha)
그라데이션: #1a2f1a → #2a1a2f
민트:       #98FF98
핑크:       #FF69B4
크기:       1024×1024 px
형식:       PNG
```

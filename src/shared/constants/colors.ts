/**
 * 🎨 공통 색상 상수 (Color Constants)
 * 
 * 🎯 목적:
 * - 전체 앱에서 일관된 색상 사용을 위한 중앙 집중식 색상 팔레트
 * - Apple 스타일 색상 시스템을 기반으로 현대적이고 접근성 높은 색상 선택
 * - TypeScript의 as const를 사용하여 타입 안전성 보장
 * 
 * 🎭 색상 역할:
 * - blue: 주요 액션, 링크, 선택 상태 (#0071e3)
 * - red: 에러, 경고, 삭제 액션 (#ff3b30)  
 * - green: 성공, 완료, 정상 상태 (#34c759)
 * - orange: 경고, 대기, 진행 중 (#ff9500)
 * - purple: 분석, 고급 기능 (#af52de)
 * - gray: 보조 텍스트, 비활성 상태 (#86868b)
 * - dark: 주 텍스트, 제목 (#1d1d1f)
 * - border: 경계선, 구분선 (#e5e5e7)
 * - bg: 배경색, 카드 배경 (#f5f5f7)
 * 
 * 💡 사용 방법:
 * ```tsx
 * import { C } from '../../shared/constants/colors';
 * 
 * <Box sx={{ color: C.dark, bgcolor: C.bg, border: `1px solid ${C.border}` }}>
 *   <Typography sx={{ color: C.blue }}>링크 텍스트</Typography>
 * </Box>
 * ```
 * 
 * 🔒 타입 안전성:
 * - as const로 리터럴 타입 보장
 * - ColorKey 타입으로 유효한 색상 키만 허용
 */

export const C = {
  blue: '#0071e3',        // 🔵 주요 액션 (버튼, 링크)
  red: '#ff3b30',         // 🔴 에러, 위험 (오류, 삭제)  
  green: '#34c759',       // 🟢 성공, 완료 (검증 통과)
  orange: '#ff9500',      // 🟠 경고, 대기 (처리 중)
  purple: '#af52de',      // 🟣 분석, 고급 (데이터 분석)
  gray: '#86868b',        // ⚫ 보조 텍스트 (설명, 라벨)
  dark: '#1d1d1f',        // ⚫ 주 텍스트 (제목, 내용)
  border: '#e5e5e7',      // ➖ 경계선 (테두리, 구분선)
  bg: '#f5f5f7',          // ⬜ 배경색 (카드, 페이지)
} as const;

// 🏷️ 색상 키 타입 정의 (TypeScript 타입 안전성)
export type ColorKey = keyof typeof C;

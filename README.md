# 견적서 분석 시스템 (Cost Analysis Demo)

현대모비스 견적서 분석 시스템 UX 데모 프로젝트입니다.

## 기술 스택

- **React 18** + **TypeScript**
- **MUI (Material UI) v5** — 현대모비스 CI 디자인 시스템 적용
- **React Router v6** — 페이지 라우팅
- **Recharts** — 차트 시각화
- **React Hook Form** — 폼 관리
- **Redux Toolkit** — 상태 관리

## 프로젝트 구조

```
src/
├── App.tsx                        # 라우터 및 테마 설정
├── index.tsx                      # 앱 엔트리포인트
├── contexts/
│   └── AuthContext.tsx            # 인증 컨텍스트 (로그인/로그아웃)
├── layouts/
│   ├── MainLayout.tsx             # 공통 레이아웃 (앱바 + 사이드바)
│   └── Sidebar.tsx                # 좌측 네비게이션 사이드바
├── pages/
│   ├── Login.tsx                  # 로그인 페이지
│   ├── Dashboard.tsx              # 대시보드 (메인 홈)
│   ├── Parsing.tsx                # ① 파싱/업로드 페이지
│   ├── ParsedDataReview.tsx       # ② 검증 페이지
│   ├── Analysis.tsx               # ③ 분석 페이지 (4탭 구조)
│   ├── QuotationComparison.tsx    # ④ 견적서 비교 페이지
│   ├── Insight.tsx                # 인사이트 스튜디오 (AI 채팅)
│   ├── ModelManagement.tsx        # 원가 모델 관리
│   ├── History.tsx                # 이력/알림
│   └── Settings.tsx               # 설정
└── components/
    ├── ReportDialog.tsx           # 검증 리포트 다이얼로그
    └── EnhancedRelationView.tsx   # 드래그앤드롭 관계도 뷰
```

## 시작하기

```bash
# 패키지 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm start

# 프로덕션 빌드
npm run build
```

## 로그인 정보 (데모)

- **사번**: 임의 입력 (예: `EMP001`)
- **비밀번호**: 임의 입력 (예: `password`)

## 페이지 플로우

```
로그인 → 대시보드 → 파싱(업로드) → 검증 → 분석 → 견적서 비교
                                              ↓
                                    인사이트 스튜디오 / 모델관리 / 이력
```

## 배포

GitHub Pages로 자동 배포됩니다.
👉 https://navynam.github.io/cost-analysis-demo/

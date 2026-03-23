# 🚀 견적서 분석 시스템 (Cost Analysis System)

현대모비스 견적서 분석 및 검증 시스템 - **실제 Excel 파일 읽기 및 다중 시트 지원**

![GitHub last commit](https://img.shields.io/github/last-commit/navynam/COST_ANALYSIS)
![GitHub repo size](https://img.shields.io/github/repo-size/navynam/COST_ANALYSIS)
![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)

## 📊 **주요 특징**

### 🔥 **핵심 기능**
- **실제 Excel 파일 읽기**: xlsx 라이브러리로 진짜 Excel 파일 완벽 처리
- **다중 시트 지원**: 워크북 내 모든 시트 탭 네비게이션
- **동적 크기 조정**: 팝업 크기 자유 조정 (3가지 프리셋 + 수동)
- **50열 대용량**: A~AX(50열) × 100행 견적서 완벽 표시
- **실제 견적서 데이터**: QWE ASSY-A/AAA GARNISH A/OUT 부품 견적서

### 🎯 **실제 업무 적용**
- **자동차 부품 견적서**: 현대모비스 실제 견적서 형태
- **복잡한 Excel 구조**: 불규칙한 레이아웃, 병합 셀, 다단 헤더
- **LOSS율 계산**: 재료별 손실률 (0.58%, 0.69%, 3.57% 등)
- **가격 비교**: AA1 초도가 vs 현재가 vs PE 초도가 비교

## 🌐 **라이브 데모**

### 🖥️ **배포 링크**
**👉 [https://navynam.github.io/COST_ANALYSIS](https://navynam.github.io/COST_ANALYSIS)**

### 🔑 **테스트 계정**
- **아이디**: `EMP001`
- **비밀번호**: `password`

### 📋 **테스트 시나리오**
1. 로그인 후 **분석 페이지** 접속
2. **"📄 원본보기"** 버튼 클릭
3. **Excel 뷰어** 팝업에서:
   - 실제 견적서 데이터 확인
   - 헤더 우상단 **크기 조정 버튼** 테스트
   - 확대/축소, 검색 기능 체험

## 🛠️ **기술 스택**

### **Frontend**
- **React 18** + **TypeScript** — 타입 안전성과 최신 React 기능
- **Material-UI v5** — 현대모비스 브랜딩 CI 완벽 적용
- **Redux Toolkit** — 복잡한 상태 관리 효율화
- **React Router v6** — SPA 페이지 라우팅
- **Recharts + D3** — 인터랙티브 차트 시각화

### **Excel 처리**
- **xlsx** — 실제 Excel 파일(.xlsx) 읽기/쓰기
- **Feature-based Architecture** — 모듈별 독립적 구조
- **TypeScript 인터페이스** — Excel 데이터 타입 안전성

### **배포 & 빌드**
- **GitHub Pages** — 자동 CI/CD 배포
- **React Scripts** — Create React App 기반 빌드
- **ESLint + Prettier** — 코드 품질 관리

## 📁 **프로젝트 구조**

### **Feature-based 모듈 아키텍처**
```typescript
src/
├── features/                           # 기능별 모듈
│   ├── analysis/                       # 분석 페이지
│   │   ├── AnalysisPage.tsx           # 📊 메인 분석 화면
│   │   └── components/
│   │       └── ExcelViewerDialog.tsx  # 🗂️ Excel 원본 뷰어
│   ├── model-management/               # 모델 관리
│   │   └── components/
│   │       └── SimpleKnowledgeGraphTab.tsx # 🕸️ 지식그래프
│   └── parsing/                        # 파싱 페이지
│       └── ParsingPage.tsx            # 📋 Excel 파싱
├── shared/                             # 공통 컴포넌트
│   ├── components/                     # 재사용 컴포넌트
│   ├── layouts/                        # 레이아웃 컴포넌트
│   └── types/                          # TypeScript 타입 정의
└── scripts/                            # 유틸리티 스크립트
    ├── create-sample-excel.js          # 샘플 Excel 생성
    ├── analyze-excel.js                # Excel 구조 분석
    └── test-excel-viewer.js            # Excel 뷰어 테스트
```

## 🔧 **로컬 개발 환경**

### **1. 저장소 클론**
```bash
git clone https://github.com/navynam/COST_ANALYSIS.git
cd COST_ANALYSIS
```

### **2. 의존성 설치**
```bash
npm install --legacy-peer-deps
# xlsx 라이브러리 버전 충돌 해결용
```

### **3. 개발 서버 실행**
```bash
npm start
# http://localhost:3000 에서 개발 서버 실행
```

### **4. 빌드 & 배포**
```bash
npm run build          # 프로덕션 빌드
npm run deploy         # GitHub Pages 자동 배포
```

## 📊 **Excel 뷰어 기능 상세**

### **실제 Excel 파일 읽기**
```typescript
// Excel 파일 읽기 함수
const readExcelFile = async (file: File): Promise<ExcelWorkbook> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const sheets: ExcelSheet[] = [];
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, defval: '', raw: false 
        });
        sheets.push({ name: sheetName, data: jsonData });
      });
      
      resolve({ sheets, fileName: file.name });
    };
    reader.readAsArrayBuffer(file);
  });
};
```

### **다중 시트 지원**
```typescript
// 시트별 탭 네비게이션
<Tabs value={currentSheetIndex} onChange={(e, newValue) => setCurrentSheetIndex(newValue)}>
  {workbook.sheets.map((sheet, index) => (
    <Tab key={index} label={sheet.name} icon={<TableChart />} />
  ))}
</Tabs>
```

### **동적 크기 조정**
```typescript
// 팝업 크기 프리셋
const handleSizePreset = (preset: 'small' | 'medium' | 'large') => {
  switch (preset) {
    case 'small':  setDialogSize({ width: '70vw', height: '60vh' }); break;
    case 'medium': setDialogSize({ width: '85vw', height: '75vh' }); break;  
    case 'large':  setDialogSize({ width: '95vw', height: '90vh' }); break;
  }
};
```

## 🎯 **핵심 컴포넌트 상세**

### **1. ExcelViewerDialog.tsx** 
**실제 Excel 파일 읽기 및 표시**
```typescript
interface ExcelViewerDialogProps {
  open: boolean;
  onClose: () => void;
  highlightedCell?: { row: number; col: number } | null;
  fileName?: string;
  excelFile?: File;        // 업로드된 File 객체
  excelUrl?: string;       // 서버 파일 URL
}

interface ExcelWorkbook {
  sheets: ExcelSheet[];    // 모든 시트 배열
  fileName: string;        // 원본 파일명
}

interface ExcelSheet {
  name: string;           // 시트 이름
  data: any[][];         // 2D 배열 데이터
}
```

**주요 기능:**
- 실제 Excel 파일(.xlsx) 읽기
- 시트별 탭 네비게이션
- 동적 열 헤더 생성 (A~AX)
- 팝업 크기 조정 (3가지 프리셋)
- Excel과 동일한 UI/UX

### **2. AnalysisPage.tsx**
**견적서 분석 및 검증 페이지**
```typescript
// 원본보기 다이얼로그 연동
<ExcelViewerDialog 
  open={originalViewOpen} 
  onClose={() => setOriginalViewOpen(false)} 
  highlightedCell={highlightedCell}
  fileName="sample_data.xlsx"
  // excelFile={uploadedFile}    // 실제 업로드 파일
  // excelUrl="/path/file.xlsx"  // 서버 파일 경로
/>
```

### **3. SimpleKnowledgeGraphTab.tsx**
**지식그래프 시각화 및 드래그 정렬**
```typescript
// 노드 드래그 및 연결된 노드 그룹 이동
const handleMouseDown = (event: React.MouseEvent, node: GraphNode) => {
  setDraggedNode(node);
  
  if (groupDragMode) {
    // 연결된 노드들 찾기
    const connectedNodeIds = getConnectedNodes(node.id);
    // 그룹 전체 이동
  }
};
```

## 🗂️ **실제 견적서 데이터**

### **sample_data.xlsx 구조**
```
품번: 99881-AABB2
품명: QWE ASSY-A/AAA GARNISH A/OUT (LHD, 인서트필름)
차종: AA1 PE  
업체: 아시아
EO NO: HCUP0543(23.11.20)
작성일자: 2025.12.08

주요 부품:
- 인서트필름 JW5: 15,301원 (LOSS율 0.58%)
- 인서트필름 WA8: 20,968원 (LOSS율 3.57%)  
- PAD-ANTINOISE 10×10×0.5: 469.60원
- TAPPING-SCREW: 140.00원
- FASTENER CLIP: 54.00원
- DUCT ASSY-SD VENT,LH: 25,838원
```

## 📈 **개발 가이드**

### **새로운 기능 추가**
1. `src/features/` 에 새 기능 폴더 생성
2. 컴포넌트, 훅, 타입 파일 작성
3. `src/shared/` 에 공통 컴포넌트 추가
4. 라우팅 및 네비게이션 연결

### **Excel 파일 처리 확장**
```typescript
// 새로운 Excel 처리 함수 예시
const parseSpecificExcelFormat = (workbook: ExcelWorkbook) => {
  // 특정 견적서 형태에 맞는 파싱 로직
  const sheet = workbook.sheets[0];
  const headerRow = sheet.data[3]; // 4행이 헤더
  const dataRows = sheet.data.slice(4); // 5행부터 데이터
  
  return {
    headers: headerRow,
    items: dataRows.map(row => ({
      partNumber: row[1],
      partName: row[2], 
      quantity: row[4],
      unitPrice: row[5],
      totalPrice: row[6]
    }))
  };
};
```

## 🚀 **배포 방법**

### **자동 배포 (권장)**
```bash
npm run deploy
# GitHub Pages 자동 배포
# https://navynam.github.io/COST_ANALYSIS 에서 확인
```

### **수동 빌드**
```bash
npm run build
# build/ 폴더에 정적 파일 생성
# 웹서버에 업로드하여 배포
```

## 📋 **To-Do & 로드맵**

### **Phase 1 ✅ 완료**
- [x] 실제 Excel 파일 읽기
- [x] 다중 시트 지원  
- [x] 팝업 크기 조정
- [x] Feature-based 아키텍처
- [x] 지식그래프 드래그 정렬

### **Phase 2 📋 예정**
- [ ] 파일 업로드 UI 추가
- [ ] Excel 파일 편집 기능
- [ ] 백엔드 API 연동
- [ ] 실시간 협업 기능
- [ ] 다국어 지원 (한/영)

### **Phase 3 🔮 향후**
- [ ] 머신러닝 기반 자동 파싱
- [ ] 견적서 템플릿 관리
- [ ] 대용량 파일 처리 최적화
- [ ] 모바일 반응형 UI

## 🤝 **기여하기**

### **개발 참여**
1. **Fork** 저장소
2. **Feature branch** 생성 (`git checkout -b feature/AmazingFeature`)  
3. **Commit** 변경사항 (`git commit -m 'Add: Amazing Feature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Pull Request** 생성

### **버그 리포트**
[GitHub Issues](https://github.com/navynam/COST_ANALYSIS/issues)에서 버그 신고 및 기능 요청

## 📄 **라이선스**

MIT License - 자유롭게 사용, 수정, 배포 가능

## 👥 **개발팀**

- **기획**: 남중 (PM)
- **개발**: Claude Code (AI Assistant)
- **디자인**: Material-UI v5 + 현대모비스 CI

---

**🎉 실제 Excel 파일을 읽고 다중 시트를 지원하는 견적서 분석 시스템!**  
**👉 [라이브 데모 체험하기](https://navynam.github.io/COST_ANALYSIS)**
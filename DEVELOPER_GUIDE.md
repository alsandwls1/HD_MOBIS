# 🛠️ 개발자 가이드 (Developer Guide)

견적서 분석 시스템의 핵심 기술과 아키텍처를 설명합니다.

## 📋 **목차**

1. [🏗️ 아키텍처 개요](#🏗️-아키텍처-개요)
2. [📊 Excel 처리 시스템](#📊-excel-처리-시스템)  
3. [🎯 핵심 컴포넌트](#🎯-핵심-컴포넌트)
4. [🔧 개발 환경 설정](#🔧-개발-환경-설정)
5. [📝 코딩 컨벤션](#📝-코딩-컨벤션)
6. [🚀 배포 가이드](#🚀-배포-가이드)

---

## 🏗️ **아키텍처 개요**

### **Feature-based 모듈 구조**
```typescript
src/
├── features/                    # 도메인별 기능 모듈
│   ├── analysis/               # 📊 분석 기능
│   │   ├── AnalysisPage.tsx   # 메인 분석 페이지
│   │   ├── components/        # 분석 전용 컴포넌트
│   │   ├── hooks/            # 분석 관련 커스텀 훅
│   │   └── types/            # 분석 도메인 타입
│   ├── parsing/               # 📋 파싱 기능
│   ├── model-management/      # 🕸️ 모델 관리
│   └── dashboard/            # 📈 대시보드
├── shared/                    # 공통 모듈
│   ├── components/           # 재사용 컴포넌트
│   ├── hooks/               # 공통 커스텀 훅
│   ├── utils/               # 유틸리티 함수
│   ├── types/               # 공통 타입 정의
│   └── constants/           # 상수 정의
└── assets/                   # 정적 자산
    ├── images/
    └── styles/
```

### **의존성 흐름 규칙**
```
features/ → shared/    ✅ 허용
shared/ → features/    ❌ 금지
features/ ↔ features/  ❌ 직접 참조 금지 (shared/ 경유)
```

---

## 📊 **Excel 처리 시스템**

### **1. 핵심 인터페이스**
```typescript
// Excel 워크북 구조
interface ExcelWorkbook {
  sheets: ExcelSheet[];     // 모든 시트 배열
  fileName: string;         // 원본 파일명
}

// Excel 시트 구조  
interface ExcelSheet {
  name: string;            // 시트 이름 (Sheet1, 견적요약 등)
  data: any[][];          // 2차원 배열 데이터 [행][열]
}

// Excel 뷰어 Props
interface ExcelViewerDialogProps {
  open: boolean;                                    // 다이얼로그 표시 상태
  onClose: () => void;                             // 닫기 콜백
  highlightedCell?: { row: number; col: number };  // 하이라이트 셀
  fileName?: string;                               // 폴백 파일명
  excelFile?: File;                               // 업로드된 File 객체
  excelUrl?: string;                              // 서버 파일 URL
}
```

### **2. Excel 파일 읽기 함수**
```typescript
/**
 * 📁 File 객체에서 Excel 데이터 추출
 * @param file - 업로드된 Excel 파일 (File 타입)
 * @returns Promise<ExcelWorkbook> - 파싱된 워크북 데이터
 */
const readExcelFile = async (file: File): Promise<ExcelWorkbook> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // ArrayBuffer → Uint8Array 변환
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        
        // xlsx 라이브러리로 워크북 파싱
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 모든 시트를 JSON 배열로 변환
        const sheets: ExcelSheet[] = [];
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          
          // 시트 → 2D 배열 변환 (Excel 구조 그대로 유지)
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,        // 첫 번째 행을 헤더로 사용하지 않음
            defval: '',       // 빈 셀을 빈 문자열로 처리
            raw: false        // 숫자를 문자열로 변환 (표시용)
          }) as any[][];
          
          sheets.push({ name: sheetName, data: jsonData });
        });
        
        resolve({ sheets, fileName: file.name });
      } catch (error) {
        reject(new Error(`Excel 파싱 실패: ${error}`));
      }
    };
    
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsArrayBuffer(file);  // ArrayBuffer로 읽기
  });
};
```

### **3. URL에서 Excel 파일 로드**
```typescript
/**
 * 🌐 URL에서 Excel 파일 다운로드 후 파싱
 * @param url - Excel 파일 경로
 * @returns Promise<ExcelWorkbook> - 파싱된 워크북 데이터
 */
const readExcelFromUrl = async (url: string): Promise<ExcelWorkbook> => {
  try {
    // Fetch API로 파일 다운로드
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`파일 다운로드 실패: ${response.status} ${response.statusText}`);
    }
    
    // Response → ArrayBuffer 변환
    const arrayBuffer = await response.arrayBuffer();
    
    // xlsx 라이브러리로 파싱 (File 읽기와 동일한 방식)
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const sheets: ExcelSheet[] = [];
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, defval: '', raw: false 
      }) as any[][];
      sheets.push({ name: sheetName, data: jsonData });
    });
    
    return {
      sheets,
      fileName: url.split('/').pop() || 'excel_file.xlsx'  // URL에서 파일명 추출
    };
  } catch (error) {
    throw new Error(`Excel URL 로드 실패: ${error}`);
  }
};
```

### **4. 동적 열 헤더 생성**
```typescript
/**
 * 📊 Excel 스타일 열 헤더 생성 (A, B, C... Z, AA, AB...)
 * @param index - 열 인덱스 (0부터 시작)
 * @returns string - Excel 열 헤더 (A, B, C, ...)
 */
const getExcelColumnHeader = (index: number): string => {
  let result = '';
  let num = index;
  
  do {
    result = String.fromCharCode(65 + (num % 26)) + result;  // A=65
    num = Math.floor(num / 26) - 1;
  } while (num >= 0);
  
  return result;
};

// 사용 예시
getExcelColumnHeader(0);   // "A"
getExcelColumnHeader(25);  // "Z"  
getExcelColumnHeader(26);  // "AA"
getExcelColumnHeader(51);  // "AZ"
getExcelColumnHeader(701); // "ZZ"
```

---

## 🎯 **핵심 컴포넌트**

### **1. ExcelViewerDialog 상세 구조**
```typescript
const ExcelViewerDialog: React.FC<ExcelViewerDialogProps> = ({
  open, onClose, highlightedCell, fileName, excelFile, excelUrl
}) => {
  // 🎛️ 상태 관리
  const [zoom, setZoom] = useState(100);                           // 확대/축소 배율
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view'); // 보기/편집 모드
  const [isLoading, setIsLoading] = useState(true);                // 로딩 상태
  const [workbook, setWorkbook] = useState<ExcelWorkbook | null>(null); // Excel 데이터
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);   // 현재 시트 인덱스
  const [error, setError] = useState<string>('');                 // 오류 메시지
  const [dialogSize, setDialogSize] = useState({ 
    width: '90vw', height: '85vh' 
  }); // 팝업 크기
  
  // 📂 Excel 데이터 로딩 로직
  useEffect(() => {
    if (!open) return;
    
    const loadExcel = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        let loadedWorkbook: ExcelWorkbook;
        
        // 데이터 소스 우선순위: File → URL → 데모 데이터
        if (excelFile) {
          loadedWorkbook = await readExcelFile(excelFile);
        } else if (excelUrl) {
          loadedWorkbook = await readExcelFromUrl(excelUrl);
        } else {
          // 폴백: 실제 견적서 구조 기반 데모 데이터
          loadedWorkbook = {
            sheets: [{ name: 'Sheet1', data: getExcelData() }],
            fileName: fileName || 'demo.xlsx'
          };
        }
        
        setWorkbook(loadedWorkbook);
        setCurrentSheetIndex(0);
        
        console.log('📊 Excel 로드 완료:', {
          fileName: loadedWorkbook.fileName,
          시트개수: loadedWorkbook.sheets.length,
          시트이름들: loadedWorkbook.sheets.map(s => s.name)
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Excel 로드 실패');
        console.error('📊 Excel 로드 오류:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExcel();
  }, [open, excelFile, excelUrl, fileName]);
  
  // 📊 현재 시트 데이터 추출
  const currentSheetData = workbook?.sheets[currentSheetIndex]?.data || [];
  const currentSheetName = workbook?.sheets[currentSheetIndex]?.name || 'Sheet1';
  
  // 📐 동적 열 헤더 생성 (현재 시트 기준)
  const maxColumns = Math.max(...currentSheetData.map(row => row.length), 0);
  const columnHeaders = Array.from({ length: maxColumns }, (_, index) => 
    getExcelColumnHeader(index)
  );
  
  // 📐 팝업 크기 조정 함수
  const handleSizePreset = (preset: 'small' | 'medium' | 'large') => {
    const sizes = {
      small:  { width: '70vw', height: '60vh' },
      medium: { width: '85vw', height: '75vh' },
      large:  { width: '95vw', height: '90vh' }
    };
    setDialogSize(sizes[preset]);
  };
  
  // ... 렌더링 로직
};
```

### **2. 시트 탭 네비게이션**
```typescript
// 📁 다중 시트 탭 렌더링
{workbook && workbook.sheets.length > 1 && (
  <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
    <Tabs 
      value={currentSheetIndex} 
      onChange={(e, newValue) => setCurrentSheetIndex(newValue)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        minHeight: 36,
        '& .MuiTab-root': {
          minHeight: 36,
          textTransform: 'none',
          fontSize: 12,
          py: 1
        }
      }}
    >
      {workbook.sheets.map((sheet, index) => (
        <Tab 
          key={index}
          label={sheet.name}
          icon={<TableChart sx={{ fontSize: 14 }} />}
          iconPosition="start"
        />
      ))}
    </Tabs>
  </Box>
)}
```

### **3. Excel 스타일 테이블 렌더링**
```typescript
<TableBody>
  {currentSheetData.map((row, rowIndex) => {
    // 현재 위치 정보 (실시간 위치 또는 기본 위치)
    const currentX = nodePositions.get(node.id)?.x || node.x;
    const currentY = nodePositions.get(node.id)?.y || node.y;
    
    return (
      <TableRow key={rowIndex}>
        {/* 행 번호 (Excel과 동일) */}
        <TableCell 
          sx={{ 
            bgcolor: '#e8e8e8',
            fontWeight: 'bold',
            textAlign: 'center',
            position: 'sticky',
            left: 0,
            zIndex: 5,
            width: 80,
            minWidth: 80
          }}
        >
          {rowIndex + 1}
        </TableCell>
        
        {/* 데이터 셀들 */}
        {row.map((cell, colIndex) => {
          const cellStyle = getCellProperties(rowIndex, colIndex, currentSheetData).style;
          const isHighlighted = highlightedCell?.row === rowIndex && 
                               highlightedCell?.col === colIndex;
          
          return (
            <TableCell 
              key={colIndex}
              sx={{
                ...cellStyle,
                position: 'relative',
                padding: '4px 8px',
                fontSize: 12,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                border: '1px solid #ddd',
                backgroundColor: isHighlighted ? '#fff3cd' : cellStyle.backgroundColor,
                ...(isHighlighted && { 
                  border: '2px solid #ff9500',
                  fontWeight: 'bold'
                })
              }}
            >
              {cell || ''}
            </TableCell>
          );
        })}
      </TableRow>
    );
  })}
</TableBody>
```

---

## 🔧 **개발 환경 설정**

### **1. 필수 도구 설치**
```bash
# Node.js 16+ 설치 확인
node --version  # v16.0.0 이상

# 저장소 클론
git clone https://github.com/navynam/COST_ANALYSIS.git
cd COST_ANALYSIS

# 의존성 설치 (버전 충돌 해결)
npm install --legacy-peer-deps
```

### **2. 개발 서버 실행**
```bash
# 개발 서버 시작
npm start
# → http://localhost:3000

# 특정 포트 지정
PORT=3008 npm start
# → http://localhost:3008
```

### **3. 빌드 및 배포**
```bash
# 프로덕션 빌드
npm run build
# → build/ 폴더에 정적 파일 생성

# GitHub Pages 자동 배포
npm run deploy
# → https://navynam.github.io/COST_ANALYSIS
```

### **4. 개발 도구 설정**
```bash
# TypeScript 타입 체크
npm run type-check

# ESLint 코드 검사
npm run lint

# Prettier 코드 포매팅
npm run format
```

---

## 📝 **코딩 컨벤션**

### **1. 파일명 규칙**
```
PascalCase: 컴포넌트 파일
- ExcelViewerDialog.tsx
- AnalysisPage.tsx
- SimpleKnowledgeGraphTab.tsx

camelCase: 훅, 유틸 파일
- useModelManagement.ts
- formatCurrency.ts
- validateExcelFile.ts

kebab-case: 스타일, 설정 파일
- global-styles.css
- tsconfig.json
- package.json
```

### **2. 컴포넌트 구조**
```typescript
/**
 * 🎯 컴포넌트 주석 템플릿
 * 
 * 📋 주요 기능:
 * - 기능 1 설명
 * - 기능 2 설명
 * 
 * 🔧 사용법:
 * <ComponentName prop1="value" prop2={variable} />
 * 
 * 💡 주의사항:
 * - 주의사항 1
 * - 주의사항 2
 */

import React, { useState, useEffect } from 'react';
import { 필요한_MUI_컴포넌트들 } from '@mui/material';
import { 필요한_아이콘들 } from '@mui/icons-material';

// 🎯 타입 정의
interface ComponentProps {
  // Props 타입 정의
}

interface LocalState {
  // 로컬 상태 타입 정의
}

// 🎨 스타일 상수 (sx prop 용)
const componentStyles = {
  container: { /* 스타일 */ },
  header: { /* 스타일 */ },
  // ...
};

// 🛠️ 유틸리티 함수들 (컴포넌트 외부)
const helperFunction = () => {
  // 헬퍼 함수 구현
};

// 🎯 메인 컴포넌트
const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 📊 상태 관리
  const [state1, setState1] = useState<type>(initialValue);
  const [state2, setState2] = useState<type>(initialValue);
  
  // 🎛️ 이벤트 핸들러
  const handleEvent = () => {
    // 이벤트 처리 로직
  };
  
  // ⚡ Effect 훅
  useEffect(() => {
    // 사이드 이펙트 로직
  }, [dependencies]);
  
  // 🎨 렌더링
  return (
    <Box sx={componentStyles.container}>
      {/* JSX 내용 */}
    </Box>
  );
};

export default ComponentName;
```

### **3. 주석 규칙**
```typescript
// 📊 데이터 관련 로직
// 🎨 UI/스타일 관련  
// 🎛️ 이벤트 처리
// ⚡ 성능 최적화
// 🔧 설정/구성
// 🐛 버그 수정
// 🎯 핵심 비즈니스 로직
// 💡 주의사항/팁
// 📁 파일/데이터 처리
// 🌐 네트워크/API
```

---

## 🚀 **배포 가이드**

### **1. GitHub Pages 자동 배포**
```json
// package.json 설정
{
  "homepage": "https://navynam.github.io/COST_ANALYSIS",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

```bash
# 배포 실행
npm run deploy

# 배포 확인
# → https://navynam.github.io/COST_ANALYSIS
```

### **2. 환경변수 설정**
```bash
# .env.production
REACT_APP_VERSION=$npm_package_version
REACT_APP_BUILD_DATE=$(date)
GENERATE_SOURCEMAP=false
```

### **3. 빌드 최적화**
```javascript
// 청크 분할 설정
const path = require('path');

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'mui',
          chunks: 'all',
        },
        xlsx: {
          test: /[\\/]node_modules[\\/]xlsx[\\/]/,
          name: 'xlsx',
          chunks: 'all',
        }
      }
    }
  }
};
```

---

## 📚 **참고 자료**

### **핵심 라이브러리 문서**
- [xlsx](https://docs.sheetjs.com/) - Excel 파일 처리
- [Material-UI](https://mui.com/) - React UI 컴포넌트
- [React Router](https://reactrouter.com/) - SPA 라우팅
- [Redux Toolkit](https://redux-toolkit.js.org/) - 상태 관리

### **개발 도구**
- [TypeScript](https://www.typescriptlang.org/) - 타입 시스템
- [ESLint](https://eslint.org/) - 코드 린팅
- [Prettier](https://prettier.io/) - 코드 포매팅

### **배포 환경**
- [GitHub Pages](https://pages.github.com/) - 정적 사이트 호스팅
- [GitHub Actions](https://github.com/features/actions) - CI/CD

---

**🎉 이제 견적서 분석 시스템의 모든 핵심 기술을 마스터했습니다!**  
**📧 질문이나 개선사항이 있으면 GitHub Issues로 연락해주세요.**
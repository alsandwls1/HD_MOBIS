/**
 * 📊 샘플 Excel 파일 생성기
 * 다중 시트가 포함된 HEAD_LINING 견적서 Excel 파일을 생성합니다.
 */

const XLSX = require('xlsx');
const path = require('path');

// 📋 시트1: 견적 요약
const summaryData = [
  ['HEAD LINING 견적서', '', '', '', ''],
  ['현대모비스', '2024-03-19', '', '', ''],
  ['', '', '', '', ''],
  ['구분', '항목', '수량', '단가', '금액'],
  ['재료비', '플라스틱 원료', '1,500', '850', '1,275,000'],
  ['재료비', '직물 소재', '500', '1,200', '600,000'],
  ['가공비', '사출성형', '1', '380,000', '380,000'],
  ['가공비', '재단/봉제', '1', '150,000', '150,000'],
  ['제경비', '품질검사', '1', '50,000', '50,000'],
  ['제경비', '포장/운송', '1', '30,000', '30,000'],
  ['', '', '', '', ''],
  ['합계', '', '', '', '2,485,000']
];

// 📋 시트2: 재료비 상세
const materialData = [
  ['재료비 상세 내역', '', '', ''],
  ['', '', '', ''],
  ['품목', '사양', '수량', '단가', '금액'],
  ['PP 수지', 'Polypropylene', '1,000kg', '750', '750,000'],
  ['PE 수지', 'Polyethylene', '500kg', '800', '400,000'],
  ['안감 직물', 'Polyester 100%', '50m', '1,500', '75,000'],
  ['표면 직물', 'Nylon 65%, Cotton 35%', '30m', '2,200', '66,000'],
  ['접착제', 'Hot Melt', '20kg', '3,500', '70,000'],
  ['', '', '', '', ''],
  ['소계', '', '', '', '1,361,000']
];

// 📋 시트3: 가공비 상세  
const processData = [
  ['가공비 상세 내역', '', ''],
  ['', '', ''],
  ['공정', '시간(h)', '시급', '금액'],
  ['사출성형 준비', '4', '15,000', '60,000'],
  ['사출성형 작업', '16', '18,000', '288,000'],
  ['후처리', '2', '12,000', '24,000'],
  ['재단 작업', '8', '14,000', '112,000'],
  ['봉제 작업', '6', '16,000', '96,000'],
  ['', '', '', ''],
  ['소계', '', '', '580,000']
];

// 📋 시트4: 제경비 상세
const overheadData = [
  ['제경비 상세 내역', ''],
  [''],
  ['항목', '금액'],
  ['설비 감가상각', '25,000'],
  ['전력비', '15,000'],
  ['품질검사비', '20,000'],
  ['포장재비', '8,000'],
  ['운송비', '12,000'],
  [''],
  ['소계', '80,000']
];

// 📊 워크북 생성
const workbook = XLSX.utils.book_new();

// 시트 추가
const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
const materialSheet = XLSX.utils.aoa_to_sheet(materialData);  
const processSheet = XLSX.utils.aoa_to_sheet(processData);
const overheadSheet = XLSX.utils.aoa_to_sheet(overheadData);

XLSX.utils.book_append_sheet(workbook, summarySheet, '견적요약');
XLSX.utils.book_append_sheet(workbook, materialSheet, '재료비상세');
XLSX.utils.book_append_sheet(workbook, processSheet, '가공비상세');
XLSX.utils.book_append_sheet(workbook, overheadSheet, '제경비상세');

// 파일 저장
const filePath = path.join(__dirname, '../public/sample_excel/HEAD_LINING_견적서.xlsx');
XLSX.writeFile(workbook, filePath);

console.log('✅ 샘플 Excel 파일 생성 완료:', filePath);
console.log('📊 포함된 시트:');
console.log('  - 견적요약 (12행)');
console.log('  - 재료비상세 (10행)'); 
console.log('  - 가공비상세 (10행)');
console.log('  - 제경비상세 (9행)');
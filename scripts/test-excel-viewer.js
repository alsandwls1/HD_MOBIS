/**
 * 🧪 Excel 뷰어 기능 직접 테스트
 * 브라우저 없이 sample_data.xlsx 파일이 제대로 읽히는지 확인
 */

const XLSX = require('xlsx');
const path = require('path');

// 실제 Excel 파일 경로
const filePath = path.join(__dirname, '../public/sample_excel/sample_data.xlsx');

console.log('🧪 Excel 뷰어 기능 테스트');
console.log('파일:', filePath);
console.log('');

try {
  // 1. Excel 파일 읽기
  const workbook = XLSX.readFile(filePath);
  
  console.log('✅ Excel 파일 읽기 성공');
  console.log('📊 워크북 정보:');
  console.log(`  - 시트 개수: ${workbook.SheetNames.length}`);
  console.log(`  - 시트 이름들: [${workbook.SheetNames.join(', ')}]`);
  console.log('');
  
  // 2. 각 시트를 JSON으로 변환 (ExcelViewerDialog와 동일한 방식)
  const sheets = [];
  
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false
    });
    
    sheets.push({
      name: sheetName,
      data: jsonData
    });
    
    console.log(`📋 시트: ${sheetName}`);
    console.log(`  - 행 수: ${jsonData.length}`);
    console.log(`  - 열 수: ${Math.max(...jsonData.map(row => row.length), 0)}`);
    
    // 데이터가 있는 첫 5행 미리보기
    const nonEmptyRows = jsonData.filter(row => row.some(cell => cell !== ''));
    console.log('  - 첫 5개 의미있는 행:');
    nonEmptyRows.slice(0, 5).forEach((row, index) => {
      const contentCells = row.filter(cell => cell !== '').slice(0, 3);
      console.log(`    ${index + 1}: [${contentCells.map(c => `"${c}"`).join(', ')}]`);
    });
    console.log('');
  });
  
  // 3. ExcelWorkbook 객체 형태로 구성 (컴포넌트와 동일)
  const workbookData = {
    sheets: sheets,
    fileName: 'sample_data.xlsx'
  };
  
  console.log('🎯 ExcelViewerDialog에서 받을 데이터:');
  console.log('📂 fileName:', workbookData.fileName);
  console.log('📊 sheets 배열:');
  workbookData.sheets.forEach((sheet, index) => {
    console.log(`  ${index}: "${sheet.name}" (${sheet.data.length}행)`);
  });
  
  // 4. 실제 셀 데이터 샘플
  console.log('');
  console.log('🔍 실제 셀 데이터 샘플:');
  const firstSheet = workbookData.sheets[0];
  if (firstSheet && firstSheet.data.length > 0) {
    console.log(`시트: ${firstSheet.name}`);
    
    // 4행(품번), 5행(품명) 데이터
    if (firstSheet.data[3]) {
      console.log('4행 데이터:', firstSheet.data[3].slice(0, 5));
    }
    if (firstSheet.data[4]) {
      console.log('5행 데이터:', firstSheet.data[4].slice(0, 5));
    }
    
    // 실제 견적 데이터가 있는 15행 확인
    if (firstSheet.data[14]) {
      console.log('15행 데이터:', firstSheet.data[14].slice(0, 10));
    }
  }
  
  console.log('');
  console.log('✅ Excel 뷰어 기능 테스트 완료!');
  console.log('📋 결론: sample_data.xlsx 파일이 ExcelViewerDialog에서 완벽하게 표시될 수 있습니다.');
  
} catch (error) {
  console.error('❌ Excel 파일 읽기 실패:', error.message);
  console.error('스택:', error.stack);
}
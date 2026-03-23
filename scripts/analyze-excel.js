/**
 * 📊 받은 Excel 파일 분석기
 * 업로드된 sample_data.xlsx 파일의 구조를 분석합니다.
 */

const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../public/sample_excel/sample_data.xlsx');

try {
  // Excel 파일 읽기
  const workbook = XLSX.readFile(filePath);
  
  console.log('📊 Excel 파일 분석 결과:');
  console.log('파일명:', 'sample_data.xlsx');
  console.log('시트 개수:', workbook.SheetNames.length);
  console.log('시트 이름들:', workbook.SheetNames);
  console.log('');
  
  // 각 시트 분석
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`📋 시트 ${index + 1}: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    console.log(`  범위: ${worksheet['!ref'] || 'A1'}`);
    console.log(`  행 수: ${range.e.r + 1}`);
    console.log(`  열 수: ${range.e.c + 1}`);
    
    // 첫 5행의 데이터 미리보기
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false,
      range: `A1:${XLSX.utils.encode_col(range.e.c)}5`
    });
    
    console.log('  데이터 미리보기 (첫 5행):');
    jsonData.forEach((row, rowIndex) => {
      if (rowIndex < 5) {
        console.log(`    ${rowIndex + 1}: [${row.map(cell => `"${cell}"`).join(', ')}]`);
      }
    });
    console.log('');
  });
  
} catch (error) {
  console.error('❌ Excel 파일 읽기 실패:', error.message);
}
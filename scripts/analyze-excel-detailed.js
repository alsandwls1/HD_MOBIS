/**
 * 📊 상세 Excel 파일 분석기
 * 실제 견적서 데이터의 구조와 내용을 상세히 분석합니다.
 */

const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../public/sample_excel/sample_data.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets['Sheet1'];
  
  // 전체 데이터를 JSON으로 변환
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    defval: '',
    raw: false
  });
  
  console.log('📊 상세 Excel 분석:');
  console.log(`총 ${jsonData.length}행 데이터`);
  console.log('');
  
  // 비어있지 않은 행들만 추출
  const nonEmptyRows = jsonData
    .map((row, index) => ({ rowIndex: index + 1, row, hasContent: row.some(cell => cell !== '') }))
    .filter(item => item.hasContent);
    
  console.log('📋 의미있는 데이터가 있는 행들:');
  nonEmptyRows.slice(0, 20).forEach(({ rowIndex, row }) => {
    const contentCells = row.filter(cell => cell !== '');
    if (contentCells.length > 0) {
      console.log(`행 ${rowIndex}: [${contentCells.join(', ')}]`);
    }
  });
  
  console.log('');
  console.log('📈 데이터 패턴 분석:');
  
  // 숫자가 포함된 셀들 찾기
  const numberCells = [];
  jsonData.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (typeof cell === 'string' && cell.match(/[\d,]+/)) {
        numberCells.push({
          row: rowIndex + 1,
          col: String.fromCharCode(65 + colIndex),
          value: cell
        });
      }
    });
  });
  
  if (numberCells.length > 0) {
    console.log('💰 숫자/금액으로 보이는 셀들:');
    numberCells.slice(0, 15).forEach(cell => {
      console.log(`  ${cell.col}${cell.row}: ${cell.value}`);
    });
  }
  
  console.log('');
  console.log('📍 주요 키워드 검색:');
  
  const keywords = ['품번', '품명', '단가', '금액', '수량', '재료비', '가공비', '제경비', 'ASSY', '업체'];
  keywords.forEach(keyword => {
    const found = [];
    jsonData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (typeof cell === 'string' && cell.includes(keyword)) {
          found.push({
            position: `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`,
            content: cell
          });
        }
      });
    });
    
    if (found.length > 0) {
      console.log(`  "${keyword}" 발견: ${found.length}개`);
      found.slice(0, 3).forEach(item => {
        console.log(`    ${item.position}: ${item.content}`);
      });
    }
  });
  
} catch (error) {
  console.error('❌ Excel 파일 읽기 실패:', error.message);
}
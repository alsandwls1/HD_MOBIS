import { CostItem, CostGroup } from '../types';

export const getDemoItems = (): CostItem[] => [
  // 재료비
  {
    id: '1', category: '재료비', sheetName: ' 55648-98655',
    구분: { value: '소재', cell: 'B15', originalValue: '소재' },
    품명: { value: '인서트필름', cell: 'C15', originalValue: '인서트필름' },
    규격: { value: '100x50x0.5', cell: 'D15', originalValue: '100x50x0.5' },
    단위: { value: 'EA', cell: 'E15', originalValue: 'EA' },
    수량: { value: 10, cell: 'F15', originalValue: 10 },
    단가: { value: 12.05, cell: 'G15', originalValue: 12.05 },
    금액: { value: 120.5, cell: 'H15', originalValue: 120.5 }
  },
  {
    id: '2', category: '재료비', sheetName: ' 55648-98655',
    구분: { value: '부품', cell: 'B16', originalValue: '부품' },
    품명: { value: 'PAD-ANTINOISE', cell: 'C16', originalValue: 'PAD-ANTINOISE' },
    규격: { value: '80x40x2', cell: 'D16', originalValue: '80x40x2' },
    단위: { value: 'EA', cell: 'E16', originalValue: 'EA' },
    수량: { value: 5, cell: 'F16', originalValue: 5 },
    단가: { value: 17.0, cell: 'G16', originalValue: 17.0 },
    금액: { value: 85.0, cell: 'H16', originalValue: 85.0 }
  },
  {
    id: '3', category: '재료비', sheetName: ' 55648-98655',
    구분: { value: '체결재', cell: 'B17', originalValue: '체결재' },
    품명: { value: 'TAPPING-SCREW', cell: 'C17', originalValue: 'TAPPING-SCREW' },
    규격: { value: 'M5x20', cell: 'D17', originalValue: 'M5x20' },
    단위: { value: 'EA', cell: 'E17', originalValue: 'EA' },
    수량: { value: 8, cell: 'F17', originalValue: 8 },
    단가: { value: 5.65, cell: 'G17', originalValue: 5.65 },
    금액: { value: 45.2, cell: 'H17', originalValue: 45.2 }
  },
  {
    id: '4', category: '재료비', sheetName: ' 55648-98655',
    구분: { value: '체결재', cell: 'B18', originalValue: '체결재' },
    품명: { value: 'FASTENER CLIP', cell: 'C18', originalValue: 'FASTENER CLIP' },
    규격: { value: 'TYPE-A', cell: 'D18', originalValue: 'TYPE-A' },
    단위: { value: 'EA', cell: 'E18', originalValue: 'EA' },
    수량: { value: 4, cell: 'F18', originalValue: 4 },
    단가: { value: 8.2, cell: 'G18', originalValue: 8.2 },
    금액: { value: 32.8, cell: 'H18', originalValue: 32.8 }
  },
  // 가공비
  {
    id: '5', category: '가공비', sheetName: '55648-98855',
    공정: { value: 'P01', cell: 'B20', originalValue: 'P01' },
    공정명: { value: '사출성형', cell: 'C20', originalValue: '사출성형' },
    인원: { value: 2, cell: 'D20', originalValue: 2 },
    적용CT: { value: 45, cell: 'E20', originalValue: 45 },
    임율: { value: 55.56, cell: 'F20', originalValue: 55.56 },
    금액: { value: 2500, cell: 'G20', originalValue: 2500 }
  },
  {
    id: '6', category: '가공비', sheetName: '55648-98855',
    공정: { value: 'P02', cell: 'B21', originalValue: 'P02' },
    공정명: { value: '조립', cell: 'C21', originalValue: '조립' },
    인원: { value: 1, cell: 'D21', originalValue: 1 },
    적용CT: { value: 30, cell: 'E21', originalValue: 30 },
    임율: { value: 40.0, cell: 'F21', originalValue: 40.0 },
    금액: { value: 1200, cell: 'G21', originalValue: 1200 }
  },
  {
    id: '7', category: '가공비', sheetName: '55648-98855',
    공정: { value: 'P03', cell: 'B22', originalValue: 'P03' },
    공정명: { value: '검사', cell: 'C22', originalValue: '검사' },
    인원: { value: 1, cell: 'D22', originalValue: 1 },
    적용CT: { value: 20, cell: 'E22', originalValue: 20 },
    임율: { value: 40.0, cell: 'F22', originalValue: 40.0 },
    금액: { value: 800, cell: 'G22', originalValue: 800 }
  },
  // 경비
  {
    id: '8', category: '경비', sheetName: '55648-98855',
    기종: { value: 'HEAD_LINING', cell: 'B25', originalValue: 'HEAD_LINING' },
    CT: { value: 45, cell: 'C25', originalValue: 45 },
    경비: { value: 333.33, cell: 'D25', originalValue: 333.33 },
    금액: { value: 15000, cell: 'E25', originalValue: 15000 }
  },
  {
    id: '9', category: '경비', sheetName: '55648-98855',
    기종: { value: 'HEAD_LINING', cell: 'B26', originalValue: 'HEAD_LINING' },
    CT: { value: 30, cell: 'C26', originalValue: 30 },
    경비: { value: 283.33, cell: 'D26', originalValue: 283.33 },
    금액: { value: 8500, cell: 'E26', originalValue: 8500 }
  }
];

export const createCostGroups = (items: CostItem[]): CostGroup[] => {
  const groups: CostGroup[] = [
    { category: '재료비', items: items.filter(i => i.category === '재료비'), total: 0, color: '#2196f3' },
    { category: '가공비', items: items.filter(i => i.category === '가공비'), total: 0, color: '#ff9800' },
    { category: '경비', items: items.filter(i => i.category === '경비'), total: 0, color: '#4caf50' },
  ];
  groups.forEach(g => {
    g.total = g.items.reduce((sum, item) => sum + Number(item.금액.value), 0);
  });
  return groups;
};

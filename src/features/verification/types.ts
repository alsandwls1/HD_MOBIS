// ✅ 셀 데이터 타입 (수정 기능 포함)
export interface CellData {
  value: string | number;
  cell: string;
  originalValue?: string | number;
  isModified?: boolean;
  modifiedBy?: string;
  modifiedAt?: string;
}

// ✅ 재료비 항목 타입
export interface MaterialCostItem {
  id: string;
  category: '재료비';
  sheetName?: string;
  구분: CellData;
  품명: CellData;
  규격: CellData;
  단위: CellData;
  수량: CellData;
  단가: CellData;
  금액: CellData;
}

// ✅ 가공비 항목 타입
export interface ProcessCostItem {
  id: string;
  category: '가공비';
  sheetName?: string;
  공정: CellData;
  공정명: CellData;
  인원: CellData;
  적용CT: CellData;
  임율: CellData;
  금액: CellData;
}

// ✅ 경비 항목 타입
export interface OverheadCostItem {
  id: string;
  category: '경비';
  sheetName?: string;
  기종: CellData;
  CT: CellData;
  경비: CellData;
  금액: CellData;
}

// ✅ 통합 타입
export type CostItem = MaterialCostItem | ProcessCostItem | OverheadCostItem;

export interface CostGroup {
  category: '재료비' | '가공비' | '경비';
  items: CostItem[];
  total: number;
  color: string;
}

/**
 * ✅ 파싱 데이터 검증 페이지 - 견적서 처리 2단계
 * 
 * 🎯 핵심 기능:
 * 1. 왼쪽: 파싱된 데이터 (analysis 페이지와 동일한 3가지 뷰)
 * 2. 오른쪽: 실제 Excel 원본
 * 3. 클릭 매핑: 왼쪽 데이터 클릭 시 오른쪽 Excel 셀 하이라이트
 * 4. 리사이즈 가능한 분할 화면 (중간 바 드래그)
 * 5. 시각적 검증: 파싱 정확도를 한 눈에 확인
 * 
 * 📊 2가지 뷰 모드:
 * - 표준뷰: 카테고리별 계층 구조
 * - 리스트뷰: 평면 테이블 형태
 * 
 * 🔍 검증 특화 기능:
 * - Excel 셀 매핑: 클릭 시 원본 위치 하이라이트
 * - 신뢰도 표시: 파싱 정확도별 색상 코딩
 * - 실시간 비교: 좌우 화면에서 동시 확인
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  ClickAwayListener,
  Popover
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Fullscreen as FullscreenIcon,
  InsertDriveFile as ExcelIcon
} from '@mui/icons-material';
import ExcelViewerDialog from '../analysis/components/ExcelViewerDialog';

// ✅ 재료비 항목 타입 (컬럼별 Excel 위치)
interface MaterialCostItem {
  id: string;
  category: '재료비';
  구분: { value: string; cell: string };
  품명: { value: string; cell: string };
  규격: { value: string; cell: string };
  단위: { value: string; cell: string };
  수량: { value: number; cell: string };
  단가: { value: number; cell: string };
  금액: { value: number; cell: string };
}

// ✅ 가공비 항목 타입 (컬럼별 Excel 위치)
interface ProcessCostItem {
  id: string;
  category: '가공비';
  공정: { value: string; cell: string };
  공정명: { value: string; cell: string };
  인원: { value: number; cell: string };
  적용CT: { value: number; cell: string };
  임율: { value: number; cell: string };
  금액: { value: number; cell: string };
}

// ✅ 경비 항목 타입 (컬럼별 Excel 위치)
interface OverheadCostItem {
  id: string;
  category: '경비';
  기종: { value: string; cell: string };
  CT: { value: number; cell: string };
  경비: { value: number; cell: string };
  금액: { value: number; cell: string };
}

// ✅ 통합 타입
type CostItem = MaterialCostItem | ProcessCostItem | OverheadCostItem;

interface CostGroup {
  category: '재료비' | '가공비' | '경비';
  items: CostItem[];
  total: number;
  color: string;
}

// ✅ 메인 컴포넌트
const ParsedDataReviewPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<CostItem | null>(null);
  const [highlightedCell, setHighlightedCell] = useState<string>('');
  const [excelViewerOpen, setExcelViewerOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50); // 왼쪽 패널 너비 (%)
  const [isResizing, setIsResizing] = useState(false);
  const [costGroups, setCostGroups] = useState<CostGroup[]>([]);
  const [listData, setListData] = useState<CostItem[]>([]);


  // 리사이징 관련 ref
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ 데모 데이터 로드 (Analysis와 동일한 구조)
  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = () => {
    // 실제 견적서 항목들 (컬럼별 Excel 위치)
    const demoItems: CostItem[] = [
      // 재료비
      {
        id: '1', category: '재료비',
        구분: { value: '소재', cell: 'B15' },
        품명: { value: '인서트필름', cell: 'C15' },
        규격: { value: '100x50x0.5', cell: 'D15' },
        단위: { value: 'EA', cell: 'E15' },
        수량: { value: 10, cell: 'F15' },
        단가: { value: 12.05, cell: 'G15' },
        금액: { value: 120.5, cell: 'H15' }
      },
      {
        id: '2', category: '재료비',
        구분: { value: '부품', cell: 'B16' },
        품명: { value: 'PAD-ANTINOISE', cell: 'C16' },
        규격: { value: '80x40x2', cell: 'D16' },
        단위: { value: 'EA', cell: 'E16' },
        수량: { value: 5, cell: 'F16' },
        단가: { value: 17.0, cell: 'G16' },
        금액: { value: 85.0, cell: 'H16' }
      },
      {
        id: '3', category: '재료비',
        구분: { value: '체결재', cell: 'B17' },
        품명: { value: 'TAPPING-SCREW', cell: 'C17' },
        규격: { value: 'M5x20', cell: 'D17' },
        단위: { value: 'EA', cell: 'E17' },
        수량: { value: 8, cell: 'F17' },
        단가: { value: 5.65, cell: 'G17' },
        금액: { value: 45.2, cell: 'H17' }
      },
      {
        id: '4', category: '재료비',
        구분: { value: '체결재', cell: 'B18' },
        품명: { value: 'FASTENER CLIP', cell: 'C18' },
        규격: { value: 'TYPE-A', cell: 'D18' },
        단위: { value: 'EA', cell: 'E18' },
        수량: { value: 4, cell: 'F18' },
        단가: { value: 8.2, cell: 'G18' },
        금액: { value: 32.8, cell: 'H18' }
      },
      // 가공비
      {
        id: '5', category: '가공비',
        공정: { value: 'P01', cell: 'B20' },
        공정명: { value: '사출성형', cell: 'C20' },
        인원: { value: 2, cell: 'D20' },
        적용CT: { value: 45, cell: 'E20' },
        임율: { value: 55.56, cell: 'F20' },
        금액: { value: 2500, cell: 'G20' }
      },
      {
        id: '6', category: '가공비',
        공정: { value: 'P02', cell: 'B21' },
        공정명: { value: '조립', cell: 'C21' },
        인원: { value: 1, cell: 'D21' },
        적용CT: { value: 30, cell: 'E21' },
        임율: { value: 40.0, cell: 'F21' },
        금액: { value: 1200, cell: 'G21' }
      },
      {
        id: '7', category: '가공비',
        공정: { value: 'P03', cell: 'B22' },
        공정명: { value: '검사', cell: 'C22' },
        인원: { value: 1, cell: 'D22' },
        적용CT: { value: 20, cell: 'E22' },
        임율: { value: 40.0, cell: 'F22' },
        금액: { value: 800, cell: 'G22' }
      },
      // 경비
      {
        id: '8', category: '경비',
        기종: { value: 'HEAD_LINING', cell: 'B25' },
        CT: { value: 45, cell: 'C25' },
        경비: { value: 333.33, cell: 'D25' },
        금액: { value: 15000, cell: 'E25' }
      },
      {
        id: '9', category: '경비',
        기종: { value: 'HEAD_LINING', cell: 'B26' },
        CT: { value: 30, cell: 'C26' },
        경비: { value: 283.33, cell: 'D26' },
        금액: { value: 8500, cell: 'E26' }
      }
    ] as CostItem[];

    setListData(demoItems);

    // 카테고리별 그룹화
    const groups: CostGroup[] = [
      {
        category: '재료비',
        items: demoItems.filter(item => item.category === '재료비'),
        total: 0,
        color: '#2196f3'
      },
      {
        category: '가공비', 
        items: demoItems.filter(item => item.category === '가공비'),
        total: 0,
        color: '#ff9800'
      },
      {
        category: '경비',
        items: demoItems.filter(item => item.category === '경비'),
        total: 0,
        color: '#4caf50'
      }
    ];

    // 총합 계산
    groups.forEach(group => {
      group.total = group.items.reduce((sum, item) => sum + item.금액.value, 0);
    });

    setCostGroups(groups);
  };

  // ✅ 셀 클릭 핸들러
  const handleCellClick = (item: CostItem, cell: string, value: string | number) => {
    setSelectedItem(item);
    setHighlightedCell(cell);
    
    console.log(`🎯 Excel 셀 ${cell} 하이라이트 - 값: ${value}`);
  };

  // ✅ 리사이징 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // 20%~80% 범위로 제한
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // 리사이징 이벤트 리스너
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);



  // ✅ 표준뷰 렌더링 (카테고리별 테이블)
  const StandardView = () => (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: 'text.primary' }}>
        📊 카테고리별 원가 분석
      </Typography>
      
      {costGroups.map((group) => (
        <Paper key={group.category} sx={{ mb: 3, overflow: 'hidden' }}>
          {/* 카테고리 헤더 */}
          <Box sx={{ 
            bgcolor: group.color, 
            color: 'white', 
            p: 2,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography variant="h6" fontWeight={600}>
              {group.category}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {group.total.toLocaleString()}원
            </Typography>
          </Box>
          
          {/* 카테고리별 테이블 */}
          <Box sx={{ p: 0 }}>
            {group.category === '재료비' && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>구분</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>품명</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>규격</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>단위</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>수량</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>단가</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>금액</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.items.map((item) => {
                      const materialItem = item as MaterialCostItem;
                      return (
                        <TableRow key={item.id} hover>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: highlightedCell === materialItem.구분.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, materialItem.구분.cell, materialItem.구분.value)}
                          >
                            {materialItem.구분.value}
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              fontWeight: 500,
                              backgroundColor: highlightedCell === materialItem.품명.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, materialItem.품명.cell, materialItem.품명.value)}
                          >
                            {materialItem.품명.value}
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: highlightedCell === materialItem.규격.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, materialItem.규격.cell, materialItem.규격.value)}
                          >
                            {materialItem.규격.value}
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: highlightedCell === materialItem.단위.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, materialItem.단위.cell, materialItem.단위.value)}
                          >
                            {materialItem.단위.value}
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: highlightedCell === materialItem.수량.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, materialItem.수량.cell, materialItem.수량.value)}
                          >
                            {materialItem.수량.value.toLocaleString()}
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: highlightedCell === materialItem.단가.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, materialItem.단가.cell, materialItem.단가.value)}
                          >
                            {materialItem.단가.value.toLocaleString()}원
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              fontWeight: 600,
                              backgroundColor: highlightedCell === materialItem.금액.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, materialItem.금액.cell, materialItem.금액.value)}
                          >
                            {materialItem.금액.value.toLocaleString()}원
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {group.category === '가공비' && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>공정</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>공정명</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>인원</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>적용C/T</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>임율</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>금액</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.items.map((item) => {
                      const processItem = item as ProcessCostItem;
                      return (
                        <TableRow key={item.id} hover>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: highlightedCell === processItem.공정.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, processItem.공정.cell, processItem.공정.value)}
                          >
                            {processItem.공정.value}
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              fontWeight: 500,
                              backgroundColor: highlightedCell === processItem.공정명.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, processItem.공정명.cell, processItem.공정명.value)}
                          >
                            {processItem.공정명.value}
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: highlightedCell === processItem.인원.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, processItem.인원.cell, processItem.인원.value)}
                          >
                            {processItem.인원.value}명
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: highlightedCell === processItem.적용CT.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, processItem.적용CT.cell, processItem.적용CT.value)}
                          >
                            {processItem.적용CT.value}초
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: highlightedCell === processItem.임율.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, processItem.임율.cell, processItem.임율.value)}
                          >
                            {processItem.임율.value.toLocaleString()}원/시간
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              fontWeight: 600,
                              backgroundColor: highlightedCell === processItem.금액.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, processItem.금액.cell, processItem.금액.value)}
                          >
                            {processItem.금액.value.toLocaleString()}원
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {group.category === '경비' && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>기종</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>C/T</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>경비</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>금액</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.items.map((item) => {
                      const overheadItem = item as OverheadCostItem;
                      return (
                        <TableRow key={item.id} hover>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              fontWeight: 500,
                              backgroundColor: highlightedCell === overheadItem.기종.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, overheadItem.기종.cell, overheadItem.기종.value)}
                          >
                            {overheadItem.기종.value}
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: highlightedCell === overheadItem.CT.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, overheadItem.CT.cell, overheadItem.CT.value)}
                          >
                            {overheadItem.CT.value}초
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: highlightedCell === overheadItem.경비.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, overheadItem.경비.cell, overheadItem.경비.value)}
                          >
                            {overheadItem.경비.value.toLocaleString()}원/시간
                          </TableCell>
                          <TableCell
                            sx={{
                              cursor: 'pointer',
                              fontWeight: 600,
                              backgroundColor: highlightedCell === overheadItem.금액.cell ? 'primary.light' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleCellClick(item, overheadItem.금액.cell, overheadItem.금액.value)}
                          >
                            {overheadItem.금액.value.toLocaleString()}원
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );

  // ✅ 리스트뷰 렌더링 (통합 테이블 - 단순화)
  const ListView = () => (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        📋 전체 항목 리스트
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell sx={{ fontWeight: 600 }}>카테고리</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>구분/공정/기종</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>품명/공정명</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>규격/인원/C/T</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>수량/임율/경비</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>단가</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>금액</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listData.map((item) => {
              let 구분값 = '';
              let 품명값 = '';
              let 규격값 = '';
              let 수량값 = '';
              let 단가값 = '';

              if (item.category === '재료비') {
                const materialItem = item as MaterialCostItem;
                구분값 = materialItem.구분.value;
                품명값 = materialItem.품명.value;
                규격값 = materialItem.규격.value;
                수량값 = `${materialItem.수량.value} ${materialItem.단위.value}`;
                단가값 = `${materialItem.단가.value.toLocaleString()}원`;
              } else if (item.category === '가공비') {
                const processItem = item as ProcessCostItem;
                구분값 = processItem.공정.value;
                품명값 = processItem.공정명.value;
                규격값 = `${processItem.인원.value}명`;
                수량값 = `${processItem.임율.value.toLocaleString()}원/시간`;
                단가값 = `${processItem.적용CT.value}초`;
              } else if (item.category === '경비') {
                const overheadItem = item as OverheadCostItem;
                구분값 = overheadItem.기종.value;
                품명값 = '-';
                규격값 = `${overheadItem.CT.value}초`;
                수량값 = `${overheadItem.경비.value.toLocaleString()}원/시간`;
                단가값 = '-';
              }

              return (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={item.category} 
                      color={
                        item.category === '재료비' ? 'primary' :
                        item.category === '가공비' ? 'secondary' : 'success'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  
                  {/* 구분/공정/기종 - 클릭 가능 */}
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      cursor: 'pointer',
                      backgroundColor: item.category === '재료비' && highlightedCell === (item as MaterialCostItem).구분.cell ? 'primary.light' :
                                       item.category === '가공비' && highlightedCell === (item as ProcessCostItem).공정.cell ? 'primary.light' :
                                       item.category === '경비' && highlightedCell === (item as OverheadCostItem).기종.cell ? 'primary.light' : 'inherit',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => {
                      if (item.category === '재료비') {
                        const materialItem = item as MaterialCostItem;
                        handleCellClick(item, materialItem.구분.cell, materialItem.구분.value);
                      } else if (item.category === '가공비') {
                        const processItem = item as ProcessCostItem;
                        handleCellClick(item, processItem.공정.cell, processItem.공정.value);
                      } else if (item.category === '경비') {
                        const overheadItem = item as OverheadCostItem;
                        handleCellClick(item, overheadItem.기종.cell, overheadItem.기종.value);
                      }
                    }}
                  >
                    {구분값}
                  </TableCell>

                  {/* 품명/공정명 - 클릭 가능 */}
                  <TableCell
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: item.category === '재료비' && highlightedCell === (item as MaterialCostItem).품명.cell ? 'primary.light' :
                                       item.category === '가공비' && highlightedCell === (item as ProcessCostItem).공정명.cell ? 'primary.light' : 'inherit',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => {
                      if (item.category === '재료비') {
                        const materialItem = item as MaterialCostItem;
                        handleCellClick(item, materialItem.품명.cell, materialItem.품명.value);
                      } else if (item.category === '가공비') {
                        const processItem = item as ProcessCostItem;
                        handleCellClick(item, processItem.공정명.cell, processItem.공정명.value);
                      }
                    }}
                  >
                    {품명값}
                  </TableCell>

                  {/* 규격/인원/C/T - 클릭 가능 */}
                  <TableCell
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: item.category === '재료비' && highlightedCell === (item as MaterialCostItem).규격.cell ? 'primary.light' :
                                       item.category === '가공비' && highlightedCell === (item as ProcessCostItem).인원.cell ? 'primary.light' :
                                       item.category === '경비' && highlightedCell === (item as OverheadCostItem).CT.cell ? 'primary.light' : 'inherit',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => {
                      if (item.category === '재료비') {
                        const materialItem = item as MaterialCostItem;
                        handleCellClick(item, materialItem.규격.cell, materialItem.규격.value);
                      } else if (item.category === '가공비') {
                        const processItem = item as ProcessCostItem;
                        handleCellClick(item, processItem.인원.cell, processItem.인원.value);
                      } else if (item.category === '경비') {
                        const overheadItem = item as OverheadCostItem;
                        handleCellClick(item, overheadItem.CT.cell, overheadItem.CT.value);
                      }
                    }}
                  >
                    {규격값}
                  </TableCell>

                  {/* 수량/임율/경비 - 클릭 가능 */}
                  <TableCell
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: item.category === '재료비' && highlightedCell === (item as MaterialCostItem).수량.cell ? 'primary.light' :
                                       item.category === '가공비' && highlightedCell === (item as ProcessCostItem).임율.cell ? 'primary.light' :
                                       item.category === '경비' && highlightedCell === (item as OverheadCostItem).경비.cell ? 'primary.light' : 'inherit',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => {
                      if (item.category === '재료비') {
                        const materialItem = item as MaterialCostItem;
                        handleCellClick(item, materialItem.수량.cell, materialItem.수량.value);
                      } else if (item.category === '가공비') {
                        const processItem = item as ProcessCostItem;
                        handleCellClick(item, processItem.임율.cell, processItem.임율.value);
                      } else if (item.category === '경비') {
                        const overheadItem = item as OverheadCostItem;
                        handleCellClick(item, overheadItem.경비.cell, overheadItem.경비.value);
                      }
                    }}
                  >
                    {수량값}
                  </TableCell>

                  {/* 단가 - 클릭 가능 (재료비, 가공비만) */}
                  <TableCell
                    sx={{
                      cursor: item.category !== '경비' ? 'pointer' : 'default',
                      backgroundColor: item.category === '재료비' && highlightedCell === (item as MaterialCostItem).단가.cell ? 'primary.light' :
                                       item.category === '가공비' && highlightedCell === (item as ProcessCostItem).적용CT.cell ? 'primary.light' : 'inherit',
                      '&:hover': item.category !== '경비' ? { backgroundColor: 'action.hover' } : {}
                    }}
                    onClick={() => {
                      if (item.category === '재료비') {
                        const materialItem = item as MaterialCostItem;
                        handleCellClick(item, materialItem.단가.cell, materialItem.단가.value);
                      } else if (item.category === '가공비') {
                        const processItem = item as ProcessCostItem;
                        handleCellClick(item, processItem.적용CT.cell, processItem.적용CT.value);
                      }
                    }}
                  >
                    {단가값}
                  </TableCell>

                  {/* 금액 - 클릭 가능 */}
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: highlightedCell === item.금액.cell ? 'primary.light' : 'inherit',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => handleCellClick(item, item.금액.cell, item.금액.value)}
                  >
                    {item.금액.value.toLocaleString()}원
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );



  // ✅ 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (selectedTab) {
      case 0: return <StandardView />;
      case 1: return <ListView />;
      default: return <StandardView />;
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 🎯 상단 헤더 */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
          🔍 파싱 데이터 검증
        </Typography>
        <Typography variant="body1" color="text.secondary">
          왼쪽에서 각 컬럼을 클릭하면 오른쪽 Excel 원본의 해당 셀이 하이라이트됩니다.
        </Typography>
      </Box>

      {/* 🔄 메인 컨텐츠 (리사이즈 가능한 2분할) */}
      <Box 
        ref={containerRef}
        sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}
      >
        
        {/* 👈 왼쪽: 파싱된 데이터 (Analysis와 동일) */}
        <Box sx={{ 
          width: `${leftWidth}%`, 
          display: 'flex', 
          flexDirection: 'column',
          borderRight: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          {/* 탭 헤더 */}
          <Box sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <Tabs 
              value={selectedTab} 
              onChange={(e, newValue) => setSelectedTab(newValue)}
              sx={{ px: 2 }}
            >
              <Tab label="표준" />
              <Tab label="리스트" />
            </Tabs>
          </Box>
          
          {/* 탭 컨텐츠 */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            {renderTabContent()}
          </Box>
        </Box>

        {/* 🔄 리사이저 바 */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            width: 4,
            bgcolor: isResizing ? 'primary.main' : 'divider',
            cursor: 'col-resize',
            transition: 'background-color 0.2s ease',
            '&:hover': { bgcolor: 'primary.main' }
          }}
        />

        {/* 👉 오른쪽: Excel 원본 */}
        <Box sx={{ 
          width: `${100 - leftWidth}%`, 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: 'grey.50'
        }}>
          {/* Excel 뷰어 헤더 */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.1)', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ExcelIcon color="success" />
                <Typography variant="h6" fontWeight={600}>
                  Excel 원본
                </Typography>
                {highlightedCell && (
                  <Chip 
                    size="small" 
                    label={`${highlightedCell} 하이라이트`} 
                    color="primary"
                  />
                )}
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FullscreenIcon />}
                onClick={() => setExcelViewerOpen(true)}
              >
                전체화면
              </Button>
            </Box>
            
            {highlightedCell && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Excel <strong>{highlightedCell}</strong> 셀이 선택되었습니다.
                  오른쪽 Excel 뷰어에서 해당 위치를 확인하세요.
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Excel 임베디드 뷰어 */}
          <Box sx={{ flex: 1, p: 2 }}>
            <Paper sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'white',
              border: selectedItem 
                ? '2px solid #0094FF' 
                : '2px dashed rgba(0, 0, 0, 0.1)'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <ExcelIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Excel 미리보기
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {highlightedCell ? (
                    <>
                      <strong>{highlightedCell}</strong> 셀이 하이라이트될 예정
                      <br />
                      실제 Excel 파일에서 위치를 확인하세요
                    </>
                  ) : (
                    <>
                      왼쪽에서 컬럼을 클릭하면
                      <br />
                      해당 Excel 셀이 하이라이트됩니다
                    </>
                  )}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<ViewIcon />}
                  onClick={() => setExcelViewerOpen(true)}
                >
                  Excel 뷰어 열기
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* 🔗 Excel 뷰어 다이얼로그 */}
      <ExcelViewerDialog
        open={excelViewerOpen}
        onClose={() => setExcelViewerOpen(false)}
        highlightedCell={highlightedCell}
        title={highlightedCell ? `Excel 원본 - ${highlightedCell} 셀` : 'Excel 원본'}
      />


    </Box>
  );
};

export default ParsedDataReviewPage;
/**
 * ✅ 파싱 데이터 검증 페이지 - 견적서 처리 2단계
 *
 * 🎯 핵심 기능:
 * 1. 왼쪽: 파싱된 데이터 (analysis 페이지와 동일한 3가지 뷰)
 * 2. 오른쪽: 실제 Excel 원본
 * 3. 클릭 매핑: 왼쪽 데이터 클릭 시 오른쪽 Excel 셀 하이라이트
 * 4. 리사이즈 가능한 분할 화면 (중간 바 드래그)
 * 5. 시각적 검증: 파싱 정확도를 한 눈에 확인
 */

import React from 'react';
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
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  InsertDriveFile as ExcelIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  NavigateBefore,
  NoteAdd as NoteAddIcon,
  Send as SendIcon,
  AutoAwesome as AIIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import ExcelViewerDialog from '../analysis/components/ExcelViewerDialog';
import { useParsedDataReview } from './hooks/useParsedDataReview';
import { MaterialCostItem, ProcessCostItem, OverheadCostItem, CostItem, CellData } from './types';

// 🎨 편집 가능한 셀 컴포넌트
const EditableCell: React.FC<{
  cellData: CellData;
  item: CostItem;
  fieldName: string;
  className?: string;
  isNumeric?: boolean;
  // hook에서 전달받는 핸들러/상태
  editingCell: { itemId: string; fieldName: string; value: string | number } | null;
  editValue: string;
  setEditValue: (v: string) => void;
  highlightedCell: string;
  isRemappingMode: boolean;
  handleCellClick: (item: CostItem, cell: string, value: string | number) => void;
  handleCellDoubleClick: (item: CostItem, fieldName: string, cellData: CellData) => void;
  handleEditSave: () => void;
  handleEditCancel: () => void;
  getFieldWidth: (fieldName: string) => string;
  getFieldMaxWidth: (fieldName: string) => string;
}> = ({
  cellData, item, fieldName, className = '', isNumeric = false,
  editingCell, editValue, setEditValue, highlightedCell, isRemappingMode,
  handleCellClick, handleCellDoubleClick, handleEditSave, handleEditCancel,
  getFieldWidth, getFieldMaxWidth
}) => {
  const isEditing = editingCell?.itemId === item.id && editingCell.fieldName === fieldName;
  const isModified = cellData.isModified;

  if (isEditing) {
    return (
      <TableCell
        className={className}
        sx={{
          position: 'relative',
          minWidth: 'fit-content',
          backgroundColor: 'primary.light',
          border: '2px solid',
          borderColor: 'primary.main',
          boxShadow: 2,
          py: 0.25,
          px: 0.5
        }}
      >
        <ClickAwayListener onClickAway={() => {
          if (isRemappingMode) return;
          handleEditCancel();
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 'max-content', p: 0.5 }}>
            <TextField
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSave();
                else if (e.key === 'Escape') handleEditCancel();
              }}
              size="small"
              type={isNumeric ? 'number' : 'text'}
              autoFocus
              variant="outlined"
              sx={{
                minWidth: getFieldWidth(fieldName),
                maxWidth: getFieldMaxWidth(fieldName),
                width: 'auto',
                '& .MuiInputBase-input': {
                  padding: '4px 6px',
                  fontSize: '13px',
                  textAlign: isNumeric ? 'right' : 'left'
                },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '&.Mui-focused': { backgroundColor: 'primary.light' }
                }
              }}
            />
            <Box sx={{ fontSize: '10px', color: 'text.disabled', textAlign: 'center', fontFamily: 'monospace', lineHeight: 0.9, opacity: 0.7, mt: -0.1 }}>
              ↵저장 ⎋취소
            </Box>
          </Box>
        </ClickAwayListener>
      </TableCell>
    );
  }

  return (
    <TableCell
      className={className}
      sx={{
        cursor: 'pointer',
        backgroundColor: highlightedCell === cellData.cell ? 'primary.light' :
                        isModified ? 'warning.light' : 'inherit',
        color: isModified ? 'warning.dark' : 'inherit',
        fontWeight: isModified ? 600 : 'inherit',
        position: 'relative',
        userSelect: 'none',
        '&:hover': {
          backgroundColor: 'action.hover',
          '&::before': {
            content: '"더블클릭으로 편집"',
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '10px', color: 'primary.main',
            bgcolor: 'rgba(255,255,255,0.9)',
            px: 0.5, py: 0.25, borderRadius: 0.5,
            border: '1px solid', borderColor: 'primary.main',
            zIndex: 10, whiteSpace: 'nowrap'
          }
        }
      }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCellClick(item, cellData.cell, cellData.value); }}
      onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCellDoubleClick(item, fieldName, cellData); }}
    >
      <span>
        {isNumeric ?
          (typeof cellData.value === 'number' ? cellData.value.toLocaleString() : cellData.value) +
          (fieldName === '단가' || fieldName === '금액' || fieldName === '임율' || fieldName === '경비' ? '원' :
           fieldName === 'CT' || fieldName === '적용CT' ? '초' :
           fieldName === '인원' ? '명' : '') :
          cellData.value
        }
        {isModified && (
          <Chip size="small" label="수정됨" color="warning"
            sx={{ ml: 0.5, height: 16, fontSize: '10px', '& .MuiChip-label': { px: 0.5 } }}
          />
        )}
      </span>
      {isModified && (
        <Tooltip title={`원본: ${cellData.originalValue} → 수정: ${cellData.value}`} arrow>
          <Box sx={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main' }} />
        </Tooltip>
      )}
    </TableCell>
  );
};

// ✅ 메인 컴포넌트
const ParsedDataReviewPage: React.FC = () => {
  const hook = useParsedDataReview();

  // EditableCell에 전달할 공통 props
  const cellProps = {
    editingCell: hook.editingCell,
    editValue: hook.editValue,
    setEditValue: hook.setEditValue,
    highlightedCell: hook.highlightedCell,
    isRemappingMode: hook.isRemappingMode,
    handleCellClick: hook.handleCellClick,
    handleCellDoubleClick: hook.handleCellDoubleClick,
    handleEditSave: hook.handleEditSave,
    handleEditCancel: hook.handleEditCancel,
    getFieldWidth: hook.getFieldWidth,
    getFieldMaxWidth: hook.getFieldMaxWidth,
  };

  // ✅ 표준뷰 렌더링
  const StandardView = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
          📊 카테고리별 원가 분석
        </Typography>
      </Box>

      {hook.costGroups.map((group) => (
        <Paper key={group.category} sx={{ mb: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              bgcolor: group.color, color: 'white', p: 1.5,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: `${group.color}dd`, transform: 'scale(1.005)', transition: 'all 0.2s ease' }
            }}
            onClick={() => hook.toggleCategory(group.category)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {hook.expandedCategories[group.category] ?
                <ExpandLessIcon sx={{ fontSize: '20px' }} /> :
                <ExpandMoreIcon sx={{ fontSize: '20px' }} />
              }
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '18px' }}>
                {group.category}
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '18px' }}>
              {group.total.toLocaleString()}원
            </Typography>
          </Box>

          <Collapse in={hook.expandedCategories[group.category]}>
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
                      const m = item as MaterialCostItem;
                      return (
                        <TableRow key={item.id} hover>
                          <EditableCell cellData={m.구분} item={item} fieldName="구분" {...cellProps} />
                          <EditableCell cellData={m.품명} item={item} fieldName="품명" className="font-medium" {...cellProps} />
                          <EditableCell cellData={m.규격} item={item} fieldName="규격" {...cellProps} />
                          <EditableCell cellData={m.단위} item={item} fieldName="단위" {...cellProps} />
                          <EditableCell cellData={m.수량} item={item} fieldName="수량" isNumeric {...cellProps} />
                          <EditableCell cellData={m.단가} item={item} fieldName="단가" isNumeric {...cellProps} />
                          <EditableCell cellData={m.금액} item={item} fieldName="금액" isNumeric className="font-semibold" {...cellProps} />
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
                      const p = item as ProcessCostItem;
                      return (
                        <TableRow key={item.id} hover>
                          <EditableCell cellData={p.공정} item={item} fieldName="공정" {...cellProps} />
                          <EditableCell cellData={p.공정명} item={item} fieldName="공정명" className="font-medium" {...cellProps} />
                          <EditableCell cellData={p.인원} item={item} fieldName="인원" isNumeric {...cellProps} />
                          <EditableCell cellData={p.적용CT} item={item} fieldName="적용CT" isNumeric {...cellProps} />
                          <EditableCell cellData={p.임율} item={item} fieldName="임율" isNumeric {...cellProps} />
                          <EditableCell cellData={p.금액} item={item} fieldName="금액" isNumeric className="font-semibold" {...cellProps} />
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
                      const o = item as OverheadCostItem;
                      return (
                        <TableRow key={item.id} hover>
                          <EditableCell cellData={o.기종} item={item} fieldName="기종" className="font-medium" {...cellProps} />
                          <EditableCell cellData={o.CT} item={item} fieldName="CT" isNumeric {...cellProps} />
                          <EditableCell cellData={o.경비} item={item} fieldName="경비" isNumeric {...cellProps} />
                          <EditableCell cellData={o.금액} item={item} fieldName="금액" isNumeric className="font-semibold" {...cellProps} />
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            </Box>
          </Collapse>
        </Paper>
      ))}
    </Box>
  );

  // ✅ 리스트뷰 렌더링
  const ListView = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>📋 전체 항목 리스트</Typography>
      </Box>
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
            {hook.costGroups.flatMap(group => group.items).map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Chip size="small" label={item.category}
                    color={item.category === '재료비' ? 'primary' : item.category === '가공비' ? 'secondary' : 'success'}
                    variant="outlined"
                  />
                </TableCell>
                {item.category === '재료비' && <EditableCell cellData={(item as MaterialCostItem).구분} item={item} fieldName="구분" className="font-medium" {...cellProps} />}
                {item.category === '가공비' && <EditableCell cellData={(item as ProcessCostItem).공정} item={item} fieldName="공정" {...cellProps} />}
                {item.category === '경비' && <EditableCell cellData={(item as OverheadCostItem).기종} item={item} fieldName="기종" className="font-medium" {...cellProps} />}

                {item.category === '재료비' && <EditableCell cellData={(item as MaterialCostItem).품명} item={item} fieldName="품명" className="font-medium" {...cellProps} />}
                {item.category === '가공비' && <EditableCell cellData={(item as ProcessCostItem).공정명} item={item} fieldName="공정명" className="font-medium" {...cellProps} />}
                {item.category === '경비' && <TableCell>-</TableCell>}

                {item.category === '재료비' && <EditableCell cellData={(item as MaterialCostItem).규격} item={item} fieldName="규격" {...cellProps} />}
                {item.category === '가공비' && <EditableCell cellData={(item as ProcessCostItem).인원} item={item} fieldName="인원" isNumeric {...cellProps} />}
                {item.category === '경비' && <EditableCell cellData={(item as OverheadCostItem).CT} item={item} fieldName="CT" isNumeric {...cellProps} />}

                {item.category === '재료비' && <EditableCell cellData={(item as MaterialCostItem).수량} item={item} fieldName="수량" isNumeric {...cellProps} />}
                {item.category === '가공비' && <EditableCell cellData={(item as ProcessCostItem).임율} item={item} fieldName="임율" isNumeric {...cellProps} />}
                {item.category === '경비' && <EditableCell cellData={(item as OverheadCostItem).경비} item={item} fieldName="경비" isNumeric {...cellProps} />}

                {item.category === '재료비' && <EditableCell cellData={(item as MaterialCostItem).단가} item={item} fieldName="단가" isNumeric {...cellProps} />}
                {item.category === '가공비' && <EditableCell cellData={(item as ProcessCostItem).적용CT} item={item} fieldName="적용CT" isNumeric {...cellProps} />}
                {item.category === '경비' && <TableCell>-</TableCell>}

                <EditableCell cellData={item.금액} item={item} fieldName="금액" isNumeric className="font-semibold" {...cellProps} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // ✅ 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (hook.selectedTab) {
      case 0: return <StandardView />;
      case 1: return <ListView />;
      default: return <StandardView />;
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 🎯 Header bar */}
      <Box sx={{ borderBottom: '1px solid #e5e5e7', px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 13, color: '#86868b' }}>검증 &gt;</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{hook.fileName || 'HEAD_LINING_원가계산서'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<NavigateBefore />}
            onClick={() => hook.navigate('/parsing')}
            sx={{ textTransform: 'none', fontSize: 12, borderRadius: '6px', borderColor: '#e5e5e7', color: '#1d1d1f' }}>
            목록으로
          </Button>
          <Button variant="outlined" size="small" startIcon={<NoteAddIcon />}
            onClick={() => hook.setNoteDialogOpen(true)}
            sx={{ textTransform: 'none', fontSize: 12, borderRadius: '6px', borderColor: '#e5e5e7', color: '#1d1d1f' }}>
            노트작성 ({hook.savedNotes.filter((n: any) => n && n.fileId === hook.currentFileId && n.content && n.content.trim()).length})
          </Button>
          <Button variant="contained" size="small" startIcon={<SaveIcon />}
            onClick={hook.handleSaveAllChanges} disabled={hook.getModifiedItemsCount() === 0}
            sx={{ textTransform: 'none', fontSize: 12, borderRadius: '6px', bgcolor: '#0071e3', color: '#fff', '&:hover': { bgcolor: '#0077ED' } }}>
            전체 저장 ({hook.getModifiedItemsCount()}개)
          </Button>
          <Button variant="contained" size="small"
            onClick={() => hook.navigate('/analysis')}
            sx={{ textTransform: 'none', fontSize: 12, borderRadius: '6px', bgcolor: '#34c759', color: '#fff', '&:hover': { bgcolor: '#2e7d32' } }}>
            분석으로 이동 →
          </Button>
        </Box>
      </Box>

      {/* Info Cards */}
      <Box sx={{ display: 'flex', gap: 2, px: 3, py: 2, bgcolor: '#f5f5f7' }}>
        {[
          { label: 'E.O. NO.', value: hook.fileMetadata.coNumber || 'EO-2024-1201' },
          { label: '품번 / 품명', value: `${hook.fileMetadata.partNumber || 'HL-2024-001'} · ${hook.fileMetadata.partName || 'HEAD LINING'}` },
          { label: '협력사 / 담당자', value: `${hook.fileMetadata.supplier || '대한(주)'} · ${hook.fileMetadata.manager || '김철수'}` },
        ].map(c => (
          <Paper key={c.label} sx={{ flex: 1, p: 1.5, borderRadius: '8px', border: '1px solid #e5e5e7', boxShadow: 'none' }}>
            <Typography sx={{ fontSize: 10, color: '#86868b', mb: 0.25 }}>{c.label}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{c.value}</Typography>
          </Paper>
        ))}
      </Box>

      {/* 💡 안내 텍스트 */}
      <Box sx={{ px: 3, py: 0.75 }}>
        <Typography sx={{ fontSize: 12, color: '#0071e3', fontWeight: 600 }}>
          💡 왼쪽 컬럼 클릭 → 오른쪽 Excel 하이라이트 · 더블클릭으로 셀 재매핑
        </Typography>
      </Box>

      {/* 🔄 메인 컨텐츠 (리사이즈 가능한 2분할) */}
      <Box ref={hook.containerRef} sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 👈 왼쪽: 파싱된 데이터 */}
        <Box sx={{ width: `${hook.leftWidth}%`, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Box sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <Tabs value={hook.selectedTab} onChange={(e, newValue) => hook.setSelectedTab(newValue)} sx={{ px: 2 }}>
              <Tab label="표준" />
              <Tab label="리스트" />
            </Tabs>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            {renderTabContent()}
          </Box>
        </Box>

        {/* 🔄 리사이저 바 */}
        <Box onMouseDown={hook.handleMouseDown}
          sx={{ width: 4, bgcolor: hook.isResizing ? 'primary.main' : 'divider', cursor: 'col-resize', transition: 'background-color 0.2s ease', '&:hover': { bgcolor: 'primary.main' } }}
        />

        {/* 👉 오른쪽: Excel 원본 */}
        <Box sx={{ width: `${100 - hook.leftWidth}%`, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.1)', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ExcelIcon color="success" />
                <Typography variant="h6" fontWeight={600}>Excel 원본</Typography>
                {hook.highlightedCell && (
                  <Chip size="small" label={`${hook.selectedSheet} ▶ ${hook.highlightedCell} 하이라이트`} color="primary" />
                )}
              </Box>
              <Button variant="outlined" size="small" startIcon={<FullscreenIcon />}
                onClick={() => hook.setExcelViewerOpen(true)}>
                전체화면
              </Button>
            </Box>
            {hook.highlightedCell ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Excel <strong>{hook.highlightedCell}</strong> 셀이 선택되었습니다.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  카테고리별 원가 분석에서 선택한 셀을 Excel 뷰어에서 확인할 수 있습니다.
                </Typography>
              </Alert>
            )}
          </Box>

          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <ExcelViewerDialog
              embedded={true}
              open={true}
              onClose={() => {}}
              fileName={hook.fileName}
              {...(hook.filePath && { excelUrl: `${process.env.PUBLIC_URL}/${hook.filePath}/${hook.fileName}` })}
              highlightedCell={hook.highlightedCell}
              selectedSheet={hook.selectedSheet}
              isRemappingMode={hook.isRemappingMode}
              onCellSelect={(newCell: string, newValue: string | number) => {
                if (hook.editingCell) {
                  hook.handleCellRemapping(newCell, newValue);
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* 🔗 Excel 뷰어 다이얼로그 */}
      <ExcelViewerDialog
        open={hook.excelViewerOpen}
        onClose={() => {
          hook.setExcelViewerOpen(false);
          hook.setIsRemappingMode(false);
        }}
        highlightedCell={hook.highlightedCell}
        title={hook.isRemappingMode ? `🔄 셀 재매핑${hook.editingCell?.fieldName ? `: ${hook.editingCell.fieldName}` : ''}` : (hook.highlightedCell ? `Excel 원본 - ${hook.highlightedCell} 셀` : 'Excel 원본')}
        isRemappingMode={hook.isRemappingMode}
        onCellSelect={(newCell: string, newValue: string | number) => {
          if (hook.editingCell) {
            hook.handleCellRemapping(newCell, newValue);
          }
        }}
      />

      {/* 📝 노트작성 다이얼로그 */}
      <Dialog open={hook.noteDialogOpen} onClose={() => hook.setNoteDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NoteAddIcon color="primary" />
            <Typography variant="h6">📝 분석 노트 작성</Typography>
          </Box>
          <IconButton onClick={() => hook.setNoteDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>현재 분석 상태:</strong> 총 {hook.costGroups.reduce((sum, group) => sum + group.items.length, 0)}개 항목 |
              수정 {hook.getModifiedItemsCount()}개 |
              총액 {hook.costGroups.reduce((sum, g) => sum + g.total, 0).toLocaleString()}원
              {hook.highlightedCell && ` | 선택셀: ${hook.highlightedCell}`}
            </Typography>
          </Alert>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>노트 유형</InputLabel>
            <Select value={hook.noteType} label="노트 유형" onChange={(e) => hook.setNoteType(e.target.value)}>
              <MenuItem value="parsing">🔍 파싱 이슈</MenuItem>
              <MenuItem value="validation">✅ 검증 결과</MenuItem>
              <MenuItem value="improvement">💡 개선 제안</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button variant="outlined" startIcon={<AIIcon />} onClick={hook.handleAIAnalysis}
              disabled={hook.isAnalyzing} sx={{ textTransform: 'none' }}>
              {hook.isAnalyzing ? '분석중...' : 'AI 분석 제안'}
            </Button>
            <Typography variant="caption" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
              현재 분석 상태를 기반으로 개선사항을 제안합니다
            </Typography>
          </Box>

          <TextField multiline rows={12} fullWidth label="노트 내용"
            placeholder="파싱 이슈, 검증 결과, 개선 제안 등을 작성하세요..."
            value={hook.noteContent} onChange={(e) => hook.setNoteContent(e.target.value)} sx={{ mb: 2 }}
          />

          {hook.savedNotes && hook.savedNotes.length > 0 && hook.savedNotes.some((note: any) => note && note.fileId === hook.currentFileId && note.content && note.content.trim()) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  📋 노트 히스토리 ({hook.savedNotes.filter((n: any) => n && n.fileId === hook.currentFileId && n.content && n.content.trim()).length}개)
                </Typography>
                <Button size="small" variant="outlined" color="error"
                  onClick={() => {
                    const allParsingNotes = JSON.parse(localStorage.getItem('parsing-notes') || '[]');
                    const otherFileNotes = allParsingNotes.filter((note: any) => note.fileId !== hook.currentFileId);
                    localStorage.setItem('parsing-notes', JSON.stringify(otherFileNotes));
                    hook.setSavedNotes([]);
                  }}
                  sx={{ fontSize: '10px', py: 0.25, px: 1, minWidth: 'auto' }}>
                  초기화
                </Button>
              </Box>
              <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                {hook.savedNotes.filter((note: any) => note && note.fileId === hook.currentFileId && note.content && note.content.trim()).slice().reverse().map((note, index) => (
                  <Paper key={note.id} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: '8px', transition: 'all 0.2s ease', '&:hover': { boxShadow: 2, borderColor: 'primary.main' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip size="small"
                          label={note.type === 'parsing' ? '🔍 파싱' : note.type === 'validation' ? '✅ 검증' : '💡 개선'}
                          variant="outlined"
                          sx={{ fontSize: '10px', height: '20px',
                            bgcolor: note.type === 'parsing' ? '#fff3e0' : note.type === 'validation' ? '#e8f5e8' : '#e3f2fd',
                            color: note.type === 'parsing' ? '#e65100' : note.type === 'validation' ? '#2e7d32' : '#1565c0'
                          }}
                        />
                        {index === 0 && <Chip size="small" label="최신" sx={{ bgcolor: '#ff5722', color: 'white', fontSize: '9px', height: '18px' }} />}
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px', fontFamily: 'monospace' }}>
                        {new Date(note.timestamp).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    <Box sx={{ maxHeight: '100px', overflowY: 'auto', bgcolor: '#fafafa', borderRadius: '6px', p: 1.5, border: '1px solid #f0f0f0' }}>
                      <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {note.content}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => hook.setNoteDialogOpen(false)}>취소</Button>
          <Button variant="contained" startIcon={<SendIcon />} onClick={hook.handleNoteSubmit} disabled={!hook.noteContent.trim()}>
            노트 저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParsedDataReviewPage;

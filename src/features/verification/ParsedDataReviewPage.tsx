/**
 * @fileoverview ② 검증 페이지
 * @description 원본과 AI파싱 결과 나란히 비교, 실시간 하이라이트, 원클릭 수정
 */
import React from 'react';
import {
  Box, Typography, Paper, Button, Chip, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton,
} from '@mui/material';
import { CheckCircle, Warning, Error as ErrorIcon, NavigateNext, NavigateBefore, Edit, Description, Close } from '@mui/icons-material';
import ReportDialog from './components/ReportDialog';
import { mockVerificationData, mockExcelData, statusColor, confidenceColor } from './data/mockData';
import { useParsedDataReview } from './hooks/useParsedDataReview';

const ParsedDataReviewPage: React.FC = () => {
  const {
    navigate,
    highlightedCell,
    editDialog, setEditDialog,
    correctedValue, setCorrectedValue,
    reportDialogOpen, setReportDialogOpen,
    totalCorrect, totalWarning, totalError,
    handleCellHighlight,
  } = useParsedDataReview();

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#003875" sx={{ mb: 1 }}>🔍 견적서 검증</Typography>
        <Typography variant="body1" color="text.secondary"><strong>파일명:</strong> 현대모비스_제조견적서_2024.xlsx</Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Chip icon={<CheckCircle />} label={`✅ ${totalCorrect}개 정상`} sx={{ bgcolor: '#e8f5e8', color: '#2e7d32' }} />
          <Chip icon={<Warning />} label={`⚠️ ${totalWarning}개 검토 필요`} sx={{ bgcolor: '#fff8e1', color: '#ef6c00' }} />
          <Chip icon={<ErrorIcon />} label={`❌ ${totalError}개 오류`} sx={{ bgcolor: '#ffebee', color: '#c62828' }} />
        </Box>
      </Box>

      {/* 요약 카드 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
        {[
          { count: totalCorrect, label: '정상 추출', border: '#4caf50', bg: '#e8f5e8', color: '#2e7d32' },
          { count: totalWarning, label: '검토 필요', border: '#ff9800', bg: '#fff8e1', color: '#ef6c00' },
          { count: totalError, label: '수정 필요', border: '#f44336', bg: '#ffebee', color: '#c62828' },
          { count: '85%', label: '전체 신뢰도', border: '#2196f3', bg: '#e3f2fd', color: '#1976d2' },
        ].map(c => (
          <Card key={c.label} sx={{ textAlign: 'center', border: `2px solid ${c.border}`, bgcolor: c.bg }}>
            <CardContent>
              <Typography variant="h2" fontWeight={800} color={c.color}>{c.count}</Typography>
              <Typography variant="body2" color={c.color}>{c.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* 비교 영역 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 3, mb: 3 }}>
        {/* 원본 엑셀 미리보기 */}
        <Paper sx={{ p: 3, height: '600px' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#003875' }}>📊 원본 엑셀 미리보기</Typography>
          <TableContainer sx={{ height: '500px', overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                  <TableCell sx={{ fontWeight: 700 }}>행</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>항목</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>값</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>위치</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockExcelData.map((cell) => (
                  <TableRow key={`${cell.row}-${cell.col}`}
                    sx={{ bgcolor: highlightedCell === cell.row + cell.col ? '#ffeb3b' : undefined, transition: 'background-color 0.5s ease' }}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{cell.row}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{cell.field}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: cell.type === 'number' ? '#1976d2' : '#333' }}>{cell.value}</TableCell>
                    <TableCell><Chip label={cell.col + cell.row} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '11px' }} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* AI 파싱 결과 검증 */}
        <Paper sx={{ p: 3, height: '600px' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#003875' }}>🤖 AI 파싱 결과 검증</Typography>
          <Box sx={{ height: '500px', overflow: 'auto' }}>
            {mockVerificationData.map((item) => {
              const colors = statusColor[item.status];
              return (
                <Paper key={item.id} sx={{ p: 2, mb: 2, border: `2px solid ${colors.border}`, bgcolor: colors.bg, cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transform: 'translateY(-2px)' } }}
                  onClick={() => handleCellHighlight(item.cellRef.replace(/[^0-9A-Z]/g, ''))}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color={colors.text}>{item.fieldName}</Typography>
                    <Chip label={`${item.confidence}%`} size="small" sx={{ bgcolor: confidenceColor(item.confidence), color: 'white', fontWeight: 700 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    원본: {item.originalValue} → 파싱: {item.parsedValue || '인식 실패'}
                    {item.status !== 'correct' && <span style={{ color: colors.text }}> ❌</span>}
                  </Typography>
                  {item.message && <Alert severity={item.status === 'error' ? 'error' : 'warning'} sx={{ mb: 2, fontSize: '12px' }}>{item.message}</Alert>}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {item.status !== 'correct' && (
                      <Button size="small" variant="contained" startIcon={<Edit />}
                        onClick={e => { e.stopPropagation(); setEditDialog({ open: true, item }); setCorrectedValue(item.originalValue); }}
                        sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}>수정</Button>
                    )}
                    <Button size="small" variant="contained" startIcon={<CheckCircle />}
                      sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}>
                      {item.status === 'correct' ? '확인됨' : '맞음'}
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Paper>
      </Box>

      {/* 하단 액션 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>진행상황:</strong> {mockVerificationData.length}개 항목 중 {totalCorrect}개 검토 완료 ({Math.round((totalCorrect / mockVerificationData.length) * 100)}%)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<NavigateBefore />} onClick={() => navigate('/parsing')}>뒤로가기</Button>
          <Button variant="outlined" startIcon={<Description />} onClick={() => setReportDialogOpen(true)} sx={{ color: '#003875', borderColor: '#003875' }}>검증레포트</Button>
          <Button variant="contained" endIcon={<NavigateNext />} onClick={() => navigate('/analysis')} sx={{ bgcolor: '#003875', px: 4, py: 1.5, fontSize: '16px' }}>
            검증 완료 및 다음 단계 →
          </Button>
        </Box>
      </Box>

      {/* 수정 다이얼로그 */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          필드 값 수정
          <IconButton onClick={() => setEditDialog({ open: false })}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField label="필드명" value={editDialog.item?.fieldName || ''} fullWidth disabled sx={{ mb: 2 }} />
            <TextField label="현재 AI 파싱값" value={editDialog.item?.parsedValue || ''} fullWidth disabled sx={{ mb: 2 }} />
            <TextField label="수정된 값" value={correctedValue} onChange={e => setCorrectedValue(e.target.value)} fullWidth placeholder="올바른 값을 입력하세요" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false })}>취소</Button>
          <Button onClick={() => { setEditDialog({ open: false }); setCorrectedValue(''); alert('수정사항이 저장되었습니다!'); }} variant="contained" sx={{ bgcolor: '#003875' }}>저장</Button>
        </DialogActions>
      </Dialog>

      <ReportDialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} />
    </Box>
  );
};

export default ParsedDataReviewPage;

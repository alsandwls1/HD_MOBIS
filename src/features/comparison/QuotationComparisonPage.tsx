/**
 * @fileoverview ④ 견적서 비교 페이지
 * @description 3단계 선택 플로우: 아이템 → 견적서 복수선택 → 나란히 비교
 */
import React from 'react';
import {
  Box, Typography, Paper, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, FormControlLabel, FormGroup, Stepper, Step, StepLabel,
  Dialog, DialogTitle, DialogContent, TextField, IconButton,
} from '@mui/material';
import { NavigateNext, SwapHoriz, Search, Close } from '@mui/icons-material';
import { mockCompData, mockMaterialChanges, fmt, getHeatColor } from './data/mockData';
import { mockProducts } from './data/mockData';
import { useQuotationComparison } from './hooks/useQuotationComparison';

const QuotationComparisonPage: React.FC = () => {
  const {
    navigate,
    selectedProduct, setSelectedProduct,
    selectedQuotations,
    searchOpen, setSearchOpen,
    searchQuery, setSearchQuery,
    quotations, selectionStep,
    toggleQuotation, resetSelection, filteredProducts,
  } = useQuotationComparison();

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} color="#003875" sx={{ mb: 0.5 }}>견적서 비교</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        아이템 선택 → 견적서 복수 선택 → 나란히 비교
      </Typography>

      {/* 스텝 표시 */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stepper activeStep={selectionStep} alternativeLabel>
          <Step><StepLabel>아이템 선택</StepLabel></Step>
          <Step><StepLabel>견적서 선택 (2개 이상)</StepLabel></Step>
          <Step><StepLabel>비교 결과</StepLabel></Step>
        </Stepper>
      </Paper>

      {/* Step 1: 아이템 선택 */}
      {!selectedProduct && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>1️⃣ 비교할 아이템을 선택하세요</Typography>
          <Button variant="contained" size="large" startIcon={<Search />}
            sx={{ bgcolor: '#003875', px: 4, py: 1.5, fontSize: 16 }}
            onClick={() => { setSearchOpen(true); setSearchQuery(''); }}>
            아이템 검색
          </Button>

          <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#003875', color: '#fff' }}>
              아이템 검색
              <IconButton onClick={() => setSearchOpen(false)} sx={{ color: '#fff' }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: '16px !important' }}>
              <TextField fullWidth placeholder="아이템 코드 또는 품명으로 검색" variant="outlined" size="small"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                sx={{ mb: 2 }} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.disabled' }} /> }} />
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>아이템코드</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>품명</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>재질</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>견적서 수</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.map(p => (
                      <TableRow key={p.id} hover sx={{ cursor: 'pointer' }}
                        onClick={() => { setSelectedProduct(p.id); setSearchOpen(false); }}>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.id}</TableCell>
                        <TableCell>{p.name}</TableCell>
                        <TableCell><Chip label={p.material} size="small" variant="outlined" /></TableCell>
                        <TableCell align="center"><Chip label={`${p.quotationCount}건`} size="small" color="primary" variant="outlined" /></TableCell>
                      </TableRow>
                    ))}
                    {filteredProducts.length === 0 && (
                      <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.disabled' }}>검색 결과가 없습니다</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </Dialog>
        </Box>
      )}

      {/* Step 2: 견적서 복수 선택 */}
      {selectedProduct && selectionStep < 2 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>2️⃣ 비교할 견적서를 선택하세요 (2개 이상)</Typography>
            <Button size="small" variant="text" onClick={resetSelection}>← 아이템 다시 선택</Button>
          </Box>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              선택된 아이템: <strong>{mockProducts.find(p => p.id === selectedProduct)?.name}</strong>
            </Typography>
            <FormGroup>
              {quotations.map(q => (
                <FormControlLabel key={q.id}
                  control={<Checkbox checked={selectedQuotations.includes(q.id)} onChange={() => toggleQuotation(q.id)} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{q.vendor}</Typography>
                      <Chip label={q.date} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                    </Box>
                  }
                />
              ))}
            </FormGroup>
            {selectedQuotations.length >= 2 && (
              <Button variant="contained" sx={{ mt: 2, bgcolor: '#003875' }}>
                비교 시작 ({selectedQuotations.length}건)
              </Button>
            )}
          </Paper>
        </Box>
      )}

      {/* Step 3: 비교 결과 */}
      {selectionStep >= 2 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>3️⃣ 비교 결과</Typography>
            <Button size="small" variant="text" onClick={resetSelection}>← 다시 선택</Button>
            <Chip label={`${selectedQuotations.length}건 비교 중`} size="small" color="primary" />
          </Box>

          {/* 총원가 비교 바 */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#003875' }}>📊 총원가 비교</Typography>
            {(() => {
              const totalRow = mockCompData.find(r => r.item === '총원가')!;
              const vals = selectedQuotations.map(qid => totalRow.values[qid] || 0);
              const maxVal = Math.max(...vals);
              const minVal = Math.min(...vals);
              return selectedQuotations.map((qid) => {
                const q = quotations.find(qq => qq.id === qid)!;
                const v = totalRow.values[qid] || 0;
                return (
                  <Box key={qid} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ width: 130, flexShrink: 0 }}>{q.label}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{
                        height: 28, borderRadius: 1.5,
                        bgcolor: v === minVal ? '#1976d2' : '#90caf9',
                        width: `${(v / maxVal) * 100}%`,
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 1.5,
                        transition: 'width 0.5s',
                      }}>
                        <Typography variant="caption" fontWeight={700} color="#fff">₩{fmt(v)}</Typography>
                      </Box>
                    </Box>
                    {v === minVal && <Chip label="최저" size="small" color="success" sx={{ fontWeight: 700 }} />}
                  </Box>
                );
              });
            })()}
          </Paper>

          {/* 히트맵 비교 테이블 */}
          <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                  <TableCell sx={{ fontWeight: 700 }}>항목</TableCell>
                  {selectedQuotations.map(qid => {
                    const q = quotations.find(qq => qq.id === qid)!;
                    return <TableCell key={qid} align="right" sx={{ fontWeight: 700, color: '#003875' }}>{q.label}</TableCell>;
                  })}
                  <TableCell align="right" sx={{ fontWeight: 700 }}>차이율</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockCompData.map((row, i) => {
                  const vals = selectedQuotations.map(qid => row.values[qid] || 0);
                  const minV = Math.min(...vals);
                  const maxV = Math.max(...vals);
                  const diffPct = minV > 0 ? ((maxV - minV) / minV * 100).toFixed(1) : '0';
                  return (
                    <TableRow key={i} sx={{ bgcolor: row.item === '총원가' ? '#e8eef5' : undefined, '&:hover': { bgcolor: '#f0f4ff' } }}>
                      <TableCell sx={{ fontWeight: row.isSubtotal ? 700 : 400, pl: row.isSubtotal ? 2 : 3 }}>{row.item}</TableCell>
                      {selectedQuotations.map(qid => {
                        const v = row.values[qid] || 0;
                        return (
                          <TableCell key={qid} align="right" sx={{ fontFamily: 'monospace', fontWeight: row.isSubtotal ? 700 : 400, bgcolor: getHeatColor(v, minV, maxV) }}>
                            ₩{fmt(v)}
                          </TableCell>
                        );
                      })}
                      <TableCell align="right">
                        <Chip label={`${diffPct}%`} size="small"
                          color={Number(diffPct) > 10 ? 'error' : Number(diffPct) > 5 ? 'warning' : 'default'}
                          variant="outlined" sx={{ fontWeight: 600 }} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 재질 변경 하이라이트 */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SwapHoriz color="warning" />
              <Typography variant="subtitle1" fontWeight={700} color="#003875">재질 변경 부품</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                    <TableCell sx={{ fontWeight: 700 }}>부품</TableCell>
                    {selectedQuotations.map(qid => {
                      const q = quotations.find(qq => qq.id === qid)!;
                      return <TableCell key={qid} sx={{ fontWeight: 700 }}>{q.label}</TableCell>;
                    })}
                    <TableCell sx={{ fontWeight: 700 }}>변경 여부</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockMaterialChanges.map((m, i) => (
                    <TableRow key={i} sx={{ bgcolor: m.changed ? '#fff3e0' : undefined }}>
                      <TableCell sx={{ fontWeight: 600 }}>{m.part}</TableCell>
                      {selectedQuotations.map(qid => (
                        <TableCell key={qid} sx={{ fontWeight: m.changed ? 700 : 400, color: m.changed && m.values[qid] !== m.values[selectedQuotations[0]] ? '#e65100' : undefined }}>
                          {m.values[qid] || '-'}
                        </TableCell>
                      ))}
                      <TableCell>
                        {m.changed
                          ? <Chip label="재질 변경" size="small" color="warning" sx={{ fontWeight: 700 }} />
                          : <Chip label="동일" size="small" variant="outlined" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* 빈 상태 */}
      {!selectedProduct && (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2, mt: 3 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>위에서 아이템을 선택해주세요</Typography>
          <Typography variant="body2" color="text.disabled">아이템 → 견적서 선택 후 비교 결과가 표시됩니다.</Typography>
        </Paper>
      )}

      {/* 네비게이션 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="contained" endIcon={<NavigateNext />}
          disabled={selectionStep < 2}
          sx={{ bgcolor: '#e60012', px: 4, '&:hover': { bgcolor: '#cc0010' } }}>
          리포트로 이동
        </Button>
      </Box>
    </Box>
  );
};

export default QuotationComparisonPage;

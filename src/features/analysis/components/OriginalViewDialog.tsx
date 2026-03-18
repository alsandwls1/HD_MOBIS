import React from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableRow,
  Dialog, DialogTitle, DialogContent, IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { C } from '../../../shared/constants/colors';
import { excelData } from '../data/excelData';

interface OriginalViewDialogProps {
  open: boolean;
  onClose: () => void;
  highlightedCell: { row: number; col: number } | null;
}

const OriginalViewDialog: React.FC<OriginalViewDialogProps> = ({ open, onClose, highlightedCell }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>📄 엑셀 원본 데이터</Typography>
        <Typography sx={{ fontSize: 12, color: C.gray }}>— 파싱 전 원본 셀 매핑</Typography>
      </Box>
      <IconButton onClick={onClose} size="small"><Close /></IconButton>
    </DialogTitle>
    <DialogContent sx={{ p: 0 }}>
      <Box sx={{ overflow: 'auto', maxHeight: '70vh' }}>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableBody>
            {excelData.map((row, ri) => (
              <TableRow key={ri}>
                <TableCell sx={{
                  fontSize: 10, color: C.gray, bgcolor: '#f5f5f5', width: 30, textAlign: 'center',
                  borderRight: `1px solid ${C.border}`, py: 0.75, px: 0.5,
                  ...(highlightedCell?.row === ri && { bgcolor: '#fff3cd', fontWeight: 700 })
                }}>
                  {ri + 1}
                </TableCell>
                {row.cols.map((col: any, ci: number) => (
                  <TableCell
                    key={ci}
                    colSpan={col.colSpan || 1}
                    sx={{
                      fontSize: ri === 0 ? 15 : 12,
                      fontWeight: col.bold ? 700 : 400,
                      textAlign: col.align || 'left',
                      bgcolor: col.bg || '#fff',
                      color: col.color || C.dark,
                      py: ri === 0 ? 1.5 : 0.75,
                      px: 1,
                      border: `1px solid ${C.border}`,
                      whiteSpace: 'nowrap',
                      ...(highlightedCell?.row === ri && highlightedCell?.col === ci && {
                        bgcolor: '#fff3cd !important',
                        border: `2px solid ${C.orange} !important`,
                        fontWeight: 700,
                        position: 'relative',
                        '&::after': {
                          content: '"📍"',
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          fontSize: 12,
                        }
                      })
                    }}
                  >
                    {col.text}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Box sx={{ p: 1.5, bgcolor: '#f9f9fb', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#d4edda', borderRadius: 2, border: '1px solid #c3e6cb' }} />
          <Typography sx={{ fontSize: 10, color: C.gray }}>정상 파싱</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#f8d7da', borderRadius: 2, border: '1px solid #f5c6cb' }} />
          <Typography sx={{ fontSize: 10, color: C.gray }}>이상치 감지</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#fff3cd', borderRadius: 2, border: `1px solid ${C.orange}` }} />
          <Typography sx={{ fontSize: 10, color: C.gray }}>선택된 항목</Typography>
        </Box>
      </Box>
    </DialogContent>
  </Dialog>
);

export default OriginalViewDialog;

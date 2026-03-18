import React from 'react';
import {
  Box, Typography, IconButton, Button, LinearProgress, Drawer,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { C } from '../../../shared/constants/colors';
import { statusConfig } from '../data/mockData';
import type { FileItem } from '../types';

interface FileDetailDrawerProps {
  file: FileItem | null;
  onClose: () => void;
  onVerify: () => void;
}

const FileDetailDrawer: React.FC<FileDetailDrawerProps> = ({ file, onClose, onVerify }) => (
  <Drawer anchor="right" open={!!file} onClose={onClose} PaperProps={{ sx: { width: 400 } }}>
    {file && (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* 헤더 */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{file.name}</Typography>
            <Typography sx={{ fontSize: 12, color: statusConfig[file.status].color, mt: 0.25 }}>
              {statusConfig[file.status].emoji} {statusConfig[file.status].label}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}><Close /></IconButton>
        </Box>

        {/* 내용 */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>파일 정보</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3 }}>
            {[
              { label: '파일 크기', value: file.fileSize || '-' },
              { label: '시트 수', value: file.sheets ? `${file.sheets}개` : '-' },
              { label: '업로드일', value: file.uploadDate },
              { label: '진행률', value: `${file.progress}%` },
            ].map(item => (
              <Box key={item.label}>
                <Typography sx={{ fontSize: 11, color: C.gray }}>{item.label}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.value}</Typography>
              </Box>
            ))}
          </Box>

          {file.status === 'complete' && (
            <>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>추출 결과 요약</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <Box><Typography sx={{ fontSize: 11, color: C.gray }}>파싱 항목</Typography><Typography sx={{ fontSize: 13, fontWeight: 600, color: C.blue }}>{file.parsedItems}건</Typography></Box>
                <Box><Typography sx={{ fontSize: 11, color: C.gray }}>이상치</Typography><Typography sx={{ fontSize: 13, fontWeight: 600, color: C.red }}>{file.anomalies}건</Typography></Box>
                <Box><Typography sx={{ fontSize: 11, color: C.gray }}>신뢰도</Typography><Typography sx={{ fontSize: 13, fontWeight: 600, color: C.green }}>92%</Typography></Box>
                <Box><Typography sx={{ fontSize: 11, color: C.gray }}>소요시간</Typography><Typography sx={{ fontSize: 13, fontWeight: 600 }}>1분 48초</Typography></Box>
              </Box>
            </>
          )}

          {file.status === 'extracting' && (
            <>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>추출 진행</Typography>
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, mb: 0.5 }}>
                  <span>전체 진행률</span>
                  <span style={{ fontWeight: 600, color: C.orange }}>{file.progress}%</span>
                </Box>
                <LinearProgress variant="determinate" value={file.progress} sx={{ height: 8, borderRadius: 4, bgcolor: '#e5e5e7', '& .MuiLinearProgress-bar': { bgcolor: C.orange } }} />
              </Box>
              <Box sx={{ fontSize: 12, color: C.gray, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <div>✅ Sheet 1 — 구조 분석 완료</div>
                <div>✅ Sheet 2 — 셀 매핑 완료</div>
                <div>⏳ Sheet 3 — 데이터 검증 중...</div>
              </Box>
            </>
          )}

          {file.status === 'failed' && (
            <>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>실패 정보</Typography>
              <Box sx={{ bgcolor: '#fff5f5', border: `1px solid ${C.red}30`, borderRadius: '8px', p: 2 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>⚠️ 파싱 오류 — 양식 인식 실패</Typography>
                <Typography sx={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                  Sheet 1의 셀 구조를 인식할 수 없습니다.<br />
                  원인: 병합 셀이 다중 중첩(3단계 이상)되어 있어 자동 파싱에 실패했습니다.<br /><br />
                  <strong>권장 조치:</strong><br />
                  • 엑셀 파일에서 불필요한 병합 셀 해제 후 재업로드<br />
                  • 수동 매핑 모드로 전환하여 직접 영역 지정
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {/* 하단 액션 */}
        <Box sx={{ p: 2, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 1 }}>
          {file.status === 'complete' && (
            <Button fullWidth variant="contained" onClick={() => { onClose(); onVerify(); }}
              sx={{ bgcolor: C.blue, textTransform: 'none', py: 1.25, '&:hover': { bgcolor: '#0077ED' } }}>
              검증하기 →
            </Button>
          )}
          {file.status === 'failed' && (
            <>
              <Button fullWidth variant="outlined" sx={{ textTransform: 'none' }}>수동 매핑</Button>
              <Button fullWidth variant="contained" sx={{ bgcolor: C.blue, textTransform: 'none' }}>재시도</Button>
            </>
          )}
        </Box>
      </Box>
    )}
  </Drawer>
);

export default FileDetailDrawer;

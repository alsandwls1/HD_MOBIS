/**
 * 📄 파싱(업로드) 페이지 - 견적서 처리 1단계
 * 
 * 🎯 주요 기능:
 * 1. 드래그앤드롭 파일 업로드 (Excel 파일)
 * 2. AI 자동 파싱 진행률 실시간 표시
 * 3. 파일별 상태 관리 (대기/추출중/검증/분석/실패)
 * 4. 파일 목록 테이블 (검색, 정렬, 필터링)
 * 5. 개별 파일 상세 정보 및 액션 (검증하기, 재시도 등)
 * 
 * 📊 상태별 카드 시스템:
 * - 전체: 모든 파일 개수
 * - 추출: AI 파싱 진행 중 (주황색)
 * - 검증: 파싱 완료, 검증 대기 (초록색)
 * - 분석: 검증 완료, 분석 진행/대기 (보라색)
 * - 실패: 파싱/검증 실패 (빨간색)
 * 
 * 🔧 사용자 액션:
 * - 파일 업로드: 드래그앤드롭 또는 클릭 업로드
 * - 상태 필터링: 카드 클릭으로 해당 상태 파일들만 표시
 * - 검색: 파일명으로 실시간 검색
 * - 일괄 작업: 체크박스로 선택 후 삭제/다운로드
 * - 개별 작업: "검증하기", "상세보기", "재시도" 버튼
 * 
 * 🔗 다음 단계 연동:
 * - "검증하기" 버튼 → 검증 페이지 (/verification)
 * - "상세보기" 버튼 → 분석 페이지 (/analysis)
 * 
 * 💾 상태 관리:
 * - useParsingPage 훅에서 파일 목록, 필터, 검색 등 모든 상태 관리
 * - 실시간 진행률 업데이트 (WebSocket 또는 Polling)
 */
import React from 'react';
import { Box, Typography, TextField, InputAdornment, Checkbox, Button } from '@mui/material';
import { Search, Delete, Download, FilterList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { C } from '../../shared/constants/colors';
import FileUploadArea from './components/FileUploadArea';
import FileTable from './components/FileTable';
import FileDetailDrawer from './components/FileDetailDrawer';
import SearchFilterDialog from './components/SearchFilterDialog';
import { useParsingPage } from './hooks/useParsingPage';

const ParsingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    filter, setFilter,
    searchQuery, setSearchQuery,
    selectedIds, setSelectedIds,
    dragOver, setDragOver,
    uploadQueue, setUploadQueue,
    drawerFile, setDrawerFile,
    searchDialogOpen, setSearchDialogOpen,
    searchFilters, setSearchFilters,
    sortField, sortDirection,
    filteredAndSorted, counts, isSearchActive, statusCards,
    handleFiles, handleSort,
  } = useParsingPage();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: C.bg }}>
      <Box sx={{ px: 3, pt: 2.5 }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.5, color: C.dark }}>견적서 파싱</Typography>
        <Typography sx={{ fontSize: 13, color: C.gray, mb: 2 }}>파일을 업로드하면 AI가 자동으로 데이터를 추출합니다</Typography>
      </Box>

      <FileUploadArea
        dragOver={dragOver} uploadQueue={uploadQueue}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
        onFileSelect={handleFiles}
        onRemoveQueue={i => setUploadQueue(prev => prev.filter((_, j) => j !== i))}
      />

      {/* 검색 툴바 */}
      <Box sx={{ display: 'flex', gap: 1.25, px: 3, mb: 2 }}>
        <TextField size="small" fullWidth placeholder="문서명으로 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: C.gray }} /></InputAdornment>, sx: { fontSize: 13, bgcolor: '#fff', borderRadius: '8px' } }} />
        <Button variant="outlined" size="small" onClick={() => setSearchDialogOpen(true)}
          sx={{ whiteSpace: 'nowrap', fontSize: 12, borderColor: isSearchActive ? C.blue : C.border, color: isSearchActive ? C.blue : C.dark, bgcolor: isSearchActive ? '#f0f6ff' : 'transparent' }}>
          <FilterList sx={{ fontSize: 16, mr: 0.5 }} />상세조회
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, px: 3, mb: 1.5, alignItems: 'center' }}>
        <Checkbox size="small" checked={selectedIds.size === filteredAndSorted.length && filteredAndSorted.length > 0}
          onChange={() => { if (selectedIds.size === filteredAndSorted.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filteredAndSorted.map(f => f.id))); }} />
        <Typography sx={{ fontSize: 12 }}>전체 선택</Typography>
        <Button size="small" startIcon={<Delete sx={{ fontSize: 14 }} />} sx={{ fontSize: 12, ml: 1 }}>일괄 삭제</Button>
        <Button size="small" startIcon={<Download sx={{ fontSize: 14 }} />} sx={{ fontSize: 12 }}>일괄 다운로드</Button>
      </Box>

      {/* 상태 카드 */}
      <Box sx={{ display: 'flex', gap: 1.5, px: 3, mb: 2 }}>
        {statusCards.map(sc => (
          <Box key={sc.key} onClick={() => setFilter(sc.key)}
            sx={{ flex: 1, bgcolor: '#fff', border: `1px solid ${filter === sc.key ? C.blue : C.border}`, borderRadius: '10px', p: 2, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', ...(filter === sc.key && { bgcolor: '#f0f6ff' }), '&:hover': { borderColor: C.blue } }}>
            <Typography sx={{ fontSize: 28, fontWeight: 700, color: sc.colorKey, mb: 0.5 }}>{counts[sc.key]}</Typography>
            <Typography sx={{ fontSize: 12, color: C.gray }}>{sc.label}</Typography>
          </Box>
        ))}
      </Box>

      <FileTable
        files={filteredAndSorted}
        selectedIds={selectedIds}
        sortField={sortField}
        sortDirection={sortDirection}
        onToggleSelect={id => setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; })}
        onToggleAll={() => { if (selectedIds.size === filteredAndSorted.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filteredAndSorted.map(f => f.id))); }}
        onSort={handleSort}
        onRowClick={f => setDrawerFile(f)}
        onVerify={() => navigate('/verification')}
        onAnalysis={() => navigate('/analysis')}
        onFailedDetail={f => setDrawerFile(f)}
      />

      <FileDetailDrawer
        file={drawerFile}
        onClose={() => setDrawerFile(null)}
        onVerify={() => navigate('/verification')}
      />

      <SearchFilterDialog
        open={searchDialogOpen}
        filters={searchFilters}
        onChange={setSearchFilters}
        onApply={() => setSearchDialogOpen(false)}
        onReset={() => setSearchFilters({ documentName: '', dateFrom: '', dateTo: '', uploader: '', department: '' })}
        onClose={() => setSearchDialogOpen(false)}
      />
    </Box>
  );
};

export default ParsingPage;

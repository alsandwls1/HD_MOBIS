import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CostItem, CostGroup, CellData } from '../types';
import { getDemoItems, createCostGroups } from '../data/mockData';

export const useParsedDataReview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 📄 파일 정보 (URL 파라미터에서 가져옴)
  const fileId = searchParams.get('fileId') || 'demo_file_001';
  const fileName = searchParams.get('fileName') || 'sample_data.xlsx';
  const filePath = searchParams.get('filePath') || '';
  const currentFileId = fileId;

  // 📄 파일 메타 정보
  const [fileMetadata, setFileMetadata] = useState({
    coNumber: 'CO-2024-001',
    partNumber: 'HL-2024-001',
    partName: 'HEAD LINING ASSY',
    supplier: '대리(주)',
    manager: '원장수',
    uploadDate: '2024-03-27',
    fileSize: '125 KB'
  });

  // UI 상태
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<CostItem | null>(null);
  const [highlightedCell, setHighlightedCell] = useState<string>('');
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [excelViewerOpen, setExcelViewerOpen] = useState(false);
  const [costGroups, setCostGroups] = useState<CostGroup[]>([]);

  // 리사이징
  const [leftWidth, setLeftWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 편집 상태
  const [editingCell, setEditingCell] = useState<{
    itemId: string;
    fieldName: string;
    value: string | number;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isRemappingMode, setIsRemappingMode] = useState(false);

  // 노트 상태
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('parsing');
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 아코디언 상태
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>(() => {
    const saved = localStorage.getItem('cost-analysis-expanded-categories');
    return saved ? JSON.parse(saved) : { '재료비': true, '가공비': true, '경비': true };
  });

  // ✅ 데이터 로드
  useEffect(() => {
    const items = getDemoItems();
    setCostGroups(createCostGroups(items));
  }, []);

  // 📝 노트 로드
  useEffect(() => {
    try {
      const parsingNotesData = JSON.parse(localStorage.getItem('parsing-notes') || '[]');
      const legacyNotesData = JSON.parse(localStorage.getItem('cost-analysis-notes') || '[]');

      const currentFileNotes = parsingNotesData.filter((note: any) =>
        note && note.fileId === currentFileId && note.content && note.content.trim().length > 0
      );

      const migratedLegacyNotes = legacyNotesData.map((note: any) => ({
        ...note,
        fileId: currentFileId,
        fileName: fileName
      }));

      if (migratedLegacyNotes.length > 0) {
        const allParsingNotes = [...parsingNotesData, ...migratedLegacyNotes];
        localStorage.setItem('parsing-notes', JSON.stringify(allParsingNotes));
        localStorage.removeItem('cost-analysis-notes');
      }

      const allCurrentFileNotes = [...currentFileNotes, ...migratedLegacyNotes];
      setSavedNotes(allCurrentFileNotes);
    } catch (error) {
      console.error('노트 로드 실패:', error);
      setSavedNotes([]);
    }
  }, [currentFileId]);

  // ✅ 리사이징 이벤트
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

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

  // ✅ 셀 클릭 핸들러
  const handleCellClick = (item: CostItem, cell: string, value: string | number) => {
    setSelectedItem(item);
    setSelectedSheet(item.sheetName || '');
    setHighlightedCell(cell);
    console.log(`🎯 Excel 셀 ${cell} 하이라이트 - 값: ${value}`);
  };

  // 🔧 셀 더블클릭 편집 핸들러
  const handleCellDoubleClick = (item: CostItem, fieldName: string, cellData: CellData) => {
    console.log(`🔥 더블클릭 감지! 항목: ${item.id}, 필드: ${fieldName}, 값: ${cellData.value}`);

    const newEditingCell = {
      itemId: item.id,
      fieldName,
      value: cellData.value
    };

    setEditingCell(newEditingCell);
    setIsRemappingMode(true);
    setExcelViewerOpen(true);
    setHighlightedCell(cellData.cell);

    console.log(`📊 Excel 재매핑 모드 설정 완료: ${fieldName} (현재: ${cellData.cell})`);

    setTimeout(() => {
      console.log(`⏰ 1초 후 editingCell 상태 확인:`, editingCell);
    }, 1000);
  };

  // 💾 Excel 셀 재매핑 완료 핸들러
  const handleCellRemapping = (newCell: string, newValue: string | number) => {
    if (!editingCell) return;

    console.log(`🔄 셀 재매핑 시작: ${editingCell.fieldName} - ${highlightedCell} → ${newCell} (${newValue})`);

    setCostGroups(prev => {
      return prev.map(group => {
        const updatedGroup = {
          ...group,
          items: group.items.map(item => {
            if (item.id === editingCell.itemId) {
              const updatedItem = { ...item };
              const field = updatedItem[editingCell.fieldName as keyof CostItem] as CellData;

              if (field && typeof field === 'object' && 'value' in field) {
                (field as CellData).cell = newCell;
                (field as CellData).value = newValue;
                (field as CellData).isModified = true;
                (field as CellData).modifiedAt = new Date().toISOString();
                (field as CellData).modifiedBy = '사용자';
              }

              return updatedItem;
            }
            return item;
          })
        };

        updatedGroup.total = updatedGroup.items.reduce((sum, item) => {
          const amount = item.id === editingCell.itemId && editingCell.fieldName === '금액'
            ? Number(newValue)
            : Number(item.금액.value);
          return sum + amount;
        }, 0);

        return updatedGroup;
      });
    });

    setEditingCell(null);
    setIsRemappingMode(false);
    setExcelViewerOpen(false);
    setHighlightedCell(newCell);

    console.log(`🎯 재매핑 완료! 새로운 셀: ${newCell}, 값: ${newValue}`);
  };

  // 📊 수정된 항목 개수 계산
  const getModifiedItemsCount = (): number => {
    return costGroups.reduce((groupCount, group) => {
      return groupCount + group.items.reduce((itemCount, item) => {
        const modifiedFields = Object.keys(item).filter(key => {
          const field = item[key as keyof CostItem];
          return field && typeof field === 'object' && 'isModified' in field && field.isModified;
        });
        return itemCount + modifiedFields.length;
      }, 0);
    }, 0);
  };

  // 💾 전체 변경사항 저장
  const handleSaveAllChanges = () => {
    const modifiedCount = getModifiedItemsCount();
    if (modifiedCount === 0) return;

    console.log(`💾 전체 저장 시작: ${modifiedCount}개 항목`);
    alert(`✅ ${modifiedCount}개 항목이 성공적으로 저장되었습니다!`);
  };

  // 💾 편집 저장 핸들러
  const handleEditSave = () => {
    if (!editingCell) return;

    const newValue = typeof editingCell.value === 'number'
      ? parseFloat(editValue) || 0
      : editValue;

    setCostGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => {
        if (item.id === editingCell.itemId) {
          const updatedItem = { ...item };
          const field = updatedItem[editingCell.fieldName as keyof CostItem] as CellData;

          if (field && typeof field === 'object' && 'value' in field) {
            (field as CellData).value = newValue;
            (field as CellData).isModified = true;
            (field as CellData).modifiedAt = new Date().toISOString();
            (field as CellData).modifiedBy = '사용자';
          }

          return updatedItem;
        }
        return item;
      }),
      total: group.items.reduce((sum, item) => {
        const amount = item.id === editingCell.itemId && editingCell.fieldName === '금액'
          ? Number(newValue)
          : Number(item.금액.value);
        return sum + amount;
      }, 0)
    })));

    setEditingCell(null);
    setEditValue('');

    setTimeout(() => {
      setHighlightedCell('');
    }, 1000);

    console.log(`✅ ${editingCell.fieldName} 편집 완료: ${newValue} (임시 저장)`);
  };

  // ❌ 편집 취소 핸들러
  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // 📝 노트 제출 핸들러
  const handleNoteSubmit = () => {
    if (!noteContent.trim()) return;

    const newNote = {
      id: Date.now().toString(),
      fileId: currentFileId,
      fileName: fileName,
      type: noteType,
      content: noteContent,
      timestamp: new Date().toISOString(),
      analysisData: {
        totalItems: costGroups.reduce((sum, group) => sum + group.items.length, 0),
        modifiedItems: getModifiedItemsCount(),
        categories: costGroups.map(g => ({
          name: g.category,
          total: g.total,
          itemCount: g.items.length
        })),
        highlightedCell,
        selectedItem: selectedItem?.id
      }
    };

    setSavedNotes(prev => [...prev, newNote]);

    const existingParsingNotes = JSON.parse(localStorage.getItem('parsing-notes') || '[]');
    existingParsingNotes.push(newNote);
    localStorage.setItem('parsing-notes', JSON.stringify(existingParsingNotes));

    setNoteContent('');
    setNoteDialogOpen(false);
  };

  // ✨ AI 분석
  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const aiSuggestion = `
🤖 **AI 분석 결과** (${new Date().toLocaleString()})

📊 **현재 상태 분석:**
- 총 ${costGroups.reduce((sum, g) => sum + g.items.length, 0)}개 항목 중 ${getModifiedItemsCount()}개 수정됨
- 재료비: ${costGroups.find(g => g.category === '재료비')?.total.toLocaleString()}원
- 가공비: ${costGroups.find(g => g.category === '가공비')?.total.toLocaleString()}원
- 경비: ${costGroups.find(g => g.category === '경비')?.total.toLocaleString()}원

🎯 **파싱 개선 권고사항:**
1. **셀 매핑 정확도**: ${highlightedCell ? `${highlightedCell} 셀 매핑 재검토 필요` : '매핑 상태 양호'}
2. **데이터 일관성**: 수량 단위와 금액 계산식 자동 검증 로직 추가
3. **예외처리**: 빈 셀, 병합 셀, 수식 셀에 대한 강화된 처리

⚠️ **체크 포인트:**
- [ ] 금액 합계 검산 (${costGroups.reduce((sum, g) => sum + g.total, 0).toLocaleString()}원)
- [ ] 단가×수량=금액 일치성 확인
- [ ] 셀 참조 오류 없는지 점검
      `;

      setNoteContent(aiSuggestion);
      setIsAnalyzing(false);
    }, 2000);
  };

  // 🔽 카테고리 토글
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newState = { ...prev, [category]: !prev[category] };
      localStorage.setItem('cost-analysis-expanded-categories', JSON.stringify(newState));
      return newState;
    });
  };

  // 📐 컬럼 너비 유틸
  const getFieldWidth = (fieldName: string): string => {
    switch (fieldName) {
      case '구분': case '단위': return '60px';
      case '공정': case 'CT': return '50px';
      case '수량': case '인원': return '70px';
      case '단가': case '임율': case '적용CT': return '80px';
      case '금액': case '경비': return '100px';
      case '품명': case '공정명': case '기종': return '120px';
      case '규격': return '100px';
      default: return '80px';
    }
  };

  const getFieldMaxWidth = (fieldName: string): string => {
    switch (fieldName) {
      case '구분': case '단위': case '공정': case 'CT': return '80px';
      case '수량': case '인원': return '90px';
      case '단가': case '임율': case '적용CT': return '120px';
      case '금액': case '경비': return '150px';
      case '품명': case '공정명': case '기종': return '200px';
      case '규격': return '160px';
      default: return '150px';
    }
  };

  return {
    // 파일 정보
    fileId, fileName, filePath, currentFileId, fileMetadata,
    // UI 상태
    selectedTab, setSelectedTab, selectedItem, highlightedCell, selectedSheet,
    excelViewerOpen, setExcelViewerOpen, costGroups,
    // 리사이징
    leftWidth, isResizing, containerRef, handleMouseDown,
    // 편집
    editingCell, editValue, setEditValue, isRemappingMode, setIsRemappingMode,
    // 노트
    noteDialogOpen, setNoteDialogOpen, noteContent, setNoteContent,
    noteType, setNoteType, savedNotes, setSavedNotes, isAnalyzing,
    // 아코디언
    expandedCategories, toggleCategory,
    // 핸들러
    handleCellClick, handleCellDoubleClick, handleCellRemapping,
    handleEditSave, handleEditCancel, handleSaveAllChanges,
    handleNoteSubmit, handleAIAnalysis,
    getModifiedItemsCount, getFieldWidth, getFieldMaxWidth,
    // 네비게이션
    navigate,
  };
};

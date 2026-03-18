import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { excelData } from '../data/excelData';
import type { CostRow } from '../types';

export const useAnalysisPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [editCell, setEditCell] = useState<{ groupId: string; rowIdx: number; field: 'unitPrice' | 'amount' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [anomalyAnchor, setAnomalyAnchor] = useState<{ el: HTMLElement; reason: string } | null>(null);
  const [originalViewOpen, setOriginalViewOpen] = useState(false);
  const [highlightedCell, setHighlightedCell] = useState<{ row: number; col: number } | null>(null);
  const [calculationAnchor, setCalculationAnchor] = useState<{ el: HTMLElement; row: CostRow; groupTitle: string } | null>(null);

  const startEdit = (groupId: string, rowIdx: number, field: 'unitPrice' | 'amount', currentValue: string) => {
    setEditCell({ groupId, rowIdx, field });
    setEditValue(currentValue);
  };

  const isOverhead = (groupId: string) => groupId === 'overhead';

  const handleCellClick = (itemName: string) => {
    const rowIndex = excelData.findIndex(row =>
      row.cols.some((col: any) => col.text && col.text.includes(itemName.replace(' ⚠️', '')))
    );
    if (rowIndex !== -1) {
      setHighlightedCell({ row: rowIndex, col: 1 });
      setOriginalViewOpen(true);
    }
  };

  const handleAmountClick = (event: React.MouseEvent<HTMLElement>, row: CostRow, groupTitle: string) => {
    setCalculationAnchor({ el: event.currentTarget, row, groupTitle });
  };

  return {
    navigate,
    activeTab, setActiveTab,
    editCell, setEditCell,
    editValue, setEditValue,
    anomalyAnchor, setAnomalyAnchor,
    originalViewOpen, setOriginalViewOpen,
    highlightedCell, setHighlightedCell,
    calculationAnchor, setCalculationAnchor,
    startEdit, isOverhead, handleCellClick, handleAmountClick,
  };
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockProducts, mockQuotations } from '../data/mockData';

export const useQuotationComparison = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const quotations = selectedProduct ? mockQuotations[selectedProduct] || [] : [];
  const selectionStep = !selectedProduct ? 0 : selectedQuotations.length < 2 ? 1 : 2;

  const toggleQuotation = (qId: string) => {
    setSelectedQuotations(prev => prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]);
  };

  const resetSelection = () => {
    setSelectedProduct(null);
    setSelectedQuotations([]);
  };

  const filteredProducts = mockProducts.filter(p => {
    const q = searchQuery.toLowerCase();
    return !q || p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
  });

  return {
    navigate,
    selectedProduct, setSelectedProduct,
    selectedQuotations, setSelectedQuotations,
    searchOpen, setSearchOpen,
    searchQuery, setSearchQuery,
    quotations, selectionStep,
    toggleQuotation, resetSelection, filteredProducts,
  };
};

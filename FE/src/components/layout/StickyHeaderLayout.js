import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Categories from '../Categories'; 
import SearchFilterBar from '../SearchFilterBar'; 
import { useSearchFilter } from '../../contexts/SearchFilterContext';

const StickyHeaderLayout = () => {
  const location = useLocation();
  const searchFilterContextValue = useSearchFilter();
  const { 
    searchTerm, 
    sortOption, 
    activeFilters, 
    setSearchTerm = () => {},
    setSortOption = () => {}, 
    setActiveFilters = () => {} 
  } = searchFilterContextValue || {};

  const pagesWithoutStickyContent = [
    '/wishlist', 
    '/card', 
    '/collection', 
    '/gallery', 
    '/bubble',
    '/cart',
    '/admin/add-product'
  ];
  
  const isAdminPage = location.pathname.toLowerCase().startsWith('/admin/');
  const shouldShowCategories = !isAdminPage && !pagesWithoutStickyContent.includes(location.pathname.toLowerCase());
  const shouldShowSearchBar = !isAdminPage && location.pathname === '/'; 

  const [showHeader, setShowHeader] = useState(true);

  if (!shouldShowCategories && !shouldShowSearchBar) {
    return null;
  }

  return (
    <div
      className="bg-white shadow-sm sticky transition-transform duration-300 pt-4" 
      style={{
        top: '4rem', 
        zIndex: 30,
        transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      {shouldShowCategories && <Categories />}
      {shouldShowSearchBar && (
        <SearchFilterBar
          onSearchChange={setSearchTerm}
          onSortChange={setSortOption}
          onApplyFilters={setActiveFilters}
          currentFilters={activeFilters}
        />
      )}
    </div>
  );
};

export default StickyHeaderLayout;
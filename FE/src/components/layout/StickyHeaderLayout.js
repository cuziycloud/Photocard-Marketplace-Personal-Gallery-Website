import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Categories from '../Categories';
import SearchFilterBar from '../SearchFilterBar';
import { useSearchFilter } from '../../contexts/SearchFilterContext';

const StickyHeaderLayout = () => {
  const location = useLocation();
  const searchFilterContextValue = useSearchFilter();
  const { searchTerm, sortOption, activeFilters, setSearchTerm, setSortOption, setActiveFilters } = useSearchFilter();

  const shouldShowCategories = !['/wishlist', '/card', '/collection', '/gallery', '/bubble'].includes(location.pathname.toLowerCase());
  const shouldShowSearchBar = location.pathname === '/';

  // State để ẩn hiện header
  const [showHeader, setShowHeader] = useState(true);

  const [lastScrollY, setLastScrollY] = useState(window.scrollY);

  useEffect(() => {
    const threshold = 110; 
    const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > threshold) {
        setShowHeader(false);
        } else {
        setShowHeader(true);
        }
    };

    window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


  if (!shouldShowCategories && !shouldShowSearchBar) return null;

  return (
    <div
      className="bg-white shadow-sm sticky transition-transform duration-300"
      style={{
        top: '4rem',
        zIndex: 30,
        transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      {shouldShowCategories && <Categories />}

      {shouldShowCategories && shouldShowSearchBar && (
        <SearchFilterBar
          onSearchChange={searchFilterContextValue.setSearchTerm}
          onSortChange={searchFilterContextValue.setSortOption}
          onApplyFilters={searchFilterContextValue.setActiveFilters}
          currentFilters={activeFilters}
        />
      )}
    </div>
  );
};

export default StickyHeaderLayout;

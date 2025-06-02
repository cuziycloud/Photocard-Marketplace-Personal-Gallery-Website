import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import Categories from '../Categories';
import SearchFilterBar from '../SearchFilterBar';
import { useSearchFilter } from '../../contexts/SearchFilterContext';

const StickyHeaderLayout = () => {
  const location = useLocation();
  const searchFilterContextValue = useSearchFilter();

  const { 
    activeFilters, 
    setSearchTerm = () => {},
    setSortOption = () => {}, 
    setActiveFilters = () => {} 
  } = searchFilterContextValue || {};

  const pathname = location.pathname.toLowerCase();

  const isAdminPage = pathname.startsWith('/admin/');
  
  const pagesWithoutStickyElements = [
    '/wishlist', '/card', '/collection', '/gallery', 
    '/bubble', '/cart', '/login', '/profile'
  ];
  
  const isHomePage = pathname === '/';
  const shouldRenderCategories = !isAdminPage && (!pagesWithoutStickyElements.includes(pathname) || isHomePage);
  const shouldRenderSearchBar = !isAdminPage && isHomePage;

  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    if (!shouldRenderCategories && !shouldRenderSearchBar) {
      setShowHeader(true); 
      return;
    }

    const threshold = 110; 

    const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > threshold) {
            if (showHeader) setShowHeader(false); 
        } else {
            if (!showHeader) setShowHeader(true); 
        }
    };

    if (window.scrollY > threshold) {
        setShowHeader(false);
    } else {
        setShowHeader(true);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, [shouldRenderCategories, shouldRenderSearchBar, showHeader]); 

  if (!shouldRenderCategories && !shouldRenderSearchBar) {
    return null;
  }

  return (
    <div
      className={`bg-white shadow-sm sticky transition-transform duration-300 ease-out ${shouldRenderCategories ? 'pt-4' : ''}`}
      style={{
        top: '4rem', 
        zIndex: 30,
        transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      {shouldRenderCategories && <Categories />}
      {shouldRenderCategories && shouldRenderSearchBar && ( 
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
import React from 'react';
import { useLocation } from 'react-router-dom';
import Categories from '../Categories';
import SearchFilterBar from '../SearchFilterBar';
import { useSearchFilter } from '../../contexts/SearchFilterContext';

const StickyHeaderLayout = () => {
  const location = useLocation();
  const searchFilterContextValue = useSearchFilter();

  const shouldShowCategories = !['/wishlist', '/card', '/collection', '/gallery', '/bubble'].includes(location.pathname.toLowerCase());
  const shouldShowSearchBar = location.pathname === '/';

  if (!shouldShowCategories && !shouldShowSearchBar) return null;

  return (
    <div className="bg-white shadow-sm sticky" style={{ top: '4rem', zIndex: 30 }}>
      {shouldShowCategories && (
        <div className={shouldShowSearchBar ? 'mb-3' : ''}>
          <Categories />
        </div>
      )}

      {shouldShowCategories && shouldShowSearchBar && (
        <div>
          <SearchFilterBar
            onSearchChange={searchFilterContextValue.setSearchTerm}
            onSortChange={searchFilterContextValue.setSortOption}
            onApplyFilters={searchFilterContextValue.setActiveFilters}
          />
        </div>
      )}
    </div>
  );
};

export default StickyHeaderLayout;

// src/components/layout/StickyHeaderLayout.js (đường dẫn dựa trên MainLayout.js)
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Categories from '../Categories'; // Điều chỉnh đường dẫn nếu cần
import SearchFilterBar from '../SearchFilterBar'; // Điều chỉnh đường dẫn nếu cần
import { useSearchFilter } from '../../contexts/SearchFilterContext';

const StickyHeaderLayout = () => {
  const location = useLocation();
  const searchFilterContextValue = useSearchFilter();
  // Destructure các giá trị từ context một cách an toàn
  const { 
    searchTerm, 
    sortOption, 
    activeFilters, 
    setSearchTerm = () => {}, // Cung cấp hàm default để tránh lỗi nếu context chưa sẵn sàng
    setSortOption = () => {}, 
    setActiveFilters = () => {} 
  } = searchFilterContextValue || {}; // Đảm bảo searchFilterContextValue không null/undefined

  // Danh sách các trang không hiển thị Categories
  // Mảng này cần đồng bộ với mảng trong MainLayout.js để tính paddingTop
  const pagesWithoutCategories = [
    '/wishlist', 
    '/card', 
    '/collection', 
    '/gallery', 
    '/bubble', // Nếu bạn có route này
    '/cart'    // <--- THÊM /cart vào đây
  ];
  
  const shouldShowCategories = !pagesWithoutCategories.includes(location.pathname.toLowerCase());
  const shouldShowSearchBar = location.pathname === '/'; // SearchBar chỉ ở trang chủ

  const [showHeader, setShowHeader] = useState(true);
  // Không cần lastScrollY nếu không dùng đến trong logic ẩn hiện header hiện tại
  // const [lastScrollY, setLastScrollY] = useState(window.scrollY); 

  useEffect(() => {
    const threshold = 110;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > threshold) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      // setLastScrollY(currentScrollY); // Cập nhật nếu bạn dùng cho logic phức tạp hơn
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Không cần lastScrollY trong dependencies nếu không dùng nó để trigger re-run useEffect

  // Nếu không hiển thị Categories VÀ không hiển thị SearchBar, thì không render gì cả
  if (!shouldShowCategories && !shouldShowSearchBar) {
    return null;
  }

  return (
    <div
      className="bg-white shadow-sm sticky transition-transform duration-300 pt-4"
      style={{
        top: '4rem', /* Chiều cao Navbar của bạn */
        zIndex: 30,
        transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      {shouldShowCategories && <Categories />}

      {/* SearchFilterBar chỉ hiển thị ở trang chủ */}
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
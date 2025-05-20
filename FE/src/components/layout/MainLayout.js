// src/components/layout/MainLayout.js (đường dẫn dựa trên App.js của bạn)
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProductList from '../../pages/HomePage';
import MyCollectionPage from '../../pages/MyCollectionPage';
import WishlistPage from '../../pages/WishlistPage';
import GalleryPage from '../../pages/GalleryPage';
import CartPage from '../../pages/CartPage'; // <--- IMPORT CartPage
import StickyHeaderLayout from './StickyHeaderLayout';

const MainLayout = () => {
  const location = useLocation();

  const navbarHeight = '4rem'; // Chiều cao Navbar của bạn

  // Xác định xem StickyHeaderLayout có hiển thị nội dung đáng kể không (Categories hoặc SearchBar)
  // Mảng này cần đồng bộ với logic trong StickyHeaderLayout
  const pagesWhereStickyHeaderIsLikelyHidden = [
    '/wishlist', 
    '/card', 
    '/collection', 
    '/gallery', 
    '/bubble', // Nếu bạn có route này
    '/cart'    // <--- THÊM /cart vào đây
  ];

  const isHomePage = location.pathname === '/';
  // StickyHeaderLayout sẽ ẩn (trả về null) nếu trang hiện tại nằm trong mảng trên VÀ không phải là trang chủ
  // (Trang chủ có thể có logic đặc biệt trong StickyHeaderLayout để luôn hiển thị)
  const stickyHeaderWillBeHidden = pagesWhereStickyHeaderIsLikelyHidden.includes(location.pathname.toLowerCase()) && !isHomePage;
  // Hoặc, một cách tiếp cận an toàn hơn là dựa vào cấu hình chiều cao hiện tại của bạn:
  let stickyHeaderHeightContribution = '0rem';

  if (isHomePage) {
    // Giá trị này (1.5rem) là từ code gốc của bạn, giả định là chiều cao của StickyHeader trên trang chủ
    stickyHeaderHeightContribution = '1.5rem'; 
  } else if (!pagesWhereStickyHeaderIsLikelyHidden.includes(location.pathname.toLowerCase())) {
    // Giá trị này (0.25rem) là từ code gốc, cho các trang khác mà StickyHeader không ẩn hoàn toàn
    // (ví dụ, chỉ hiện Categories)
    stickyHeaderHeightContribution = '0.25rem';
  }
  // Nếu trang nằm trong pagesWhereStickyHeaderIsLikelyHidden (ví dụ: /cart), 
  // stickyHeaderHeightContribution sẽ là '0rem', đó là điều chúng ta muốn.

  const paddingTop = `calc(${navbarHeight} + ${stickyHeaderHeightContribution})`;

  return (
    <div className="bg-slate-100 flex flex-col flex-grow ">
      <StickyHeaderLayout />

      <main className="flex-grow bg-slate-100" style={{ paddingTop }}>
        <div>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/card" element={<MyCollectionPage />} />
            <Route path="/collection" element={<MyCollectionPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CartPage />} /> {/* <--- THÊM ROUTE CHO CART */}
            {/* Thêm các route khác nếu cần */}
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
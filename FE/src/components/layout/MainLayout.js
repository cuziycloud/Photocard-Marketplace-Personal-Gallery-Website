import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProductList from '../../pages/HomePage';
import MyCollectionPage from '../../pages/MyCollectionPage';
import WishlistPage from '../../pages/WishlistPage';
import GalleryPage from '../../pages/GalleryPage';
import CartPage from '../../pages/CartPage'; 
import StickyHeaderLayout from './StickyHeaderLayout';
import AddProductPage from '../../pages/admin/AddProductPage';

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
    '/bubble',
    '/cart',
    '/admin/add-product'   
  ];

  const isHomePage = location.pathname === '/';

  const stickyHeaderWillBeHidden = pagesWhereStickyHeaderIsLikelyHidden.includes(location.pathname.toLowerCase()) && !isHomePage;
  let stickyHeaderHeightContribution = '0rem';

  if (isHomePage) {
    stickyHeaderHeightContribution = '1.5rem'; 
  } else if (!pagesWhereStickyHeaderIsLikelyHidden.includes(location.pathname.toLowerCase())) {
    stickyHeaderHeightContribution = '0.25rem';
  }

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
            <Route path="/cart" element={<CartPage />} /> 
            <Route path="/admin/add-product" element={<AddProductPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
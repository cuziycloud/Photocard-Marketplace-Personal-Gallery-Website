import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductList from '../../pages/HomePage';
import MyCollectionPage from '../../pages/MyCollectionPage';
import WishlistPage from '../../pages/WishlistPage';
import GalleryPage from '../../pages/GalleryPage';
import CartPage from '../../pages/CartPage';
import StickyHeaderLayout from './StickyHeaderLayout';
import AddProductPage from '../../pages/admin/AddProductPage';
import LoginPage from '../../pages/LoginPage';

const MainLayout = () => {
  const navbarHeight = '4rem'; 

  let stickyHeaderHeightContribution = '0rem';

  const paddingTop = `calc(${navbarHeight} + ${stickyHeaderHeightContribution})`;

  return (
    <div className="bg-slate-100 flex flex-col flex-grow ">
      <StickyHeaderLayout />

      <main className="flex-grow bg-slate-100" style={{ paddingTop }}>
        <div>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/card" element={<MyCollectionPage />} />
            <Route path="/collection" element={<MyCollectionPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            {/* <Route path="/template" element={<TemplatePage />} /> */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/admin/add-product" element={<AddProductPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
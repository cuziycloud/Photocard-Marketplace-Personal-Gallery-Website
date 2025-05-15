import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProductList from '../ProductList';
import MyCollectionPage from '../MyCollection';
import WishlistPage from '../WishlistPage';
import StickyHeaderLayout from './StickyHeaderLayout';

const MainLayout = () => {
  const location = useLocation();

  const navbarHeight = '4rem';
  const categoriesHeight = ['/'].includes(location.pathname) ? '1.5rem' : '5.5rem'; 
  const paddingTop = `calc(${navbarHeight} + ${categoriesHeight})`;

  return (
    <div className="flex flex-col flex-grow">
      <StickyHeaderLayout />

      <main className="flex-grow bg-slate-100" style={{ paddingTop }}>
        <div>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/card" element={<MyCollectionPage />} />
            <Route path="/collection" element={<MyCollectionPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

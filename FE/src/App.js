import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ProductList from './components/ProductList';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Categories from './components/Categories';
import { CategoryProvider } from './contexts/CategoryContext';
import MyCollectionPage from './components/MyCollection';
import WishlistPage from './components/WishlistPage';

function App() {
  const location = useLocation();

  return (
    <CategoryProvider>
      <div className="App flex flex-col min-h-screen bg-slate-100">
        <Navbar />

        <main className="flex-grow pt-2 sm:pt-2"> 
          {location.pathname !== '/wishlist' && <Categories />}

          {/* const hideCategories = ['/wishlist', '/login', '/register'].includes(location.pathname);
          {!hideCategories && <Categories />} */}

          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/card" element={<MyCollectionPage />} />
            <Route path="/collection" element={<MyCollectionPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </CategoryProvider>
  );
}

export default App;
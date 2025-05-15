import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Categories from './components/Categories';
import ProductList from './components/ProductList';
import MyCollectionPage from './components/MyCollection';
import WishlistPage from './components/WishlistPage';
import { CategoryProvider } from './contexts/CategoryContext';
import BackToTopButton from './components/BackToTopButton';

const MainLayout = () => {
  const location = useLocation();
  const hideCategoriesOnPaths = ['/wishlist', '/card', '/collection']; 
  const shouldShowCategories = !hideCategoriesOnPaths.includes(location.pathname.toLowerCase());
  const navbarHeight = '4rem';
  const categoriesHeight = shouldShowCategories ? '2rem' : '0rem';

  return (
    <div className="flex flex-col flex-grow"> 
      {shouldShowCategories && (
        <div className="bg-white shadow-sm sticky" style={{ top: navbarHeight, zIndex: 40 }}>
          <Categories />
        </div>
      )}

      <main
        className="flex-grow bg-slate-100" 
        style={{
          paddingTop: shouldShowCategories
            ? `calc(${navbarHeight} + ${categoriesHeight})` 
            : navbarHeight 
        }}
      >
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/card" element={<MyCollectionPage />} />
          <Route path="/collection" element={<MyCollectionPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <CategoryProvider>
      <Router>
        <div className="App flex flex-col min-h-screen">
          <Navbar />
          <MainLayout />
          <Footer />
          <BackToTopButton />
        </div>
      </Router>
    </CategoryProvider>
  );
}

export default App;
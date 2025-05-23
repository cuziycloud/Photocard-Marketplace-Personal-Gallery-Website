import React from 'react'; 
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import MainLayout from './components/layout/MainLayout';
import { CategoryProvider } from './contexts/CategoryContext';
import { SearchFilterProvider } from './contexts/SearchFilterContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';

function App() {
  return (
    <AuthProvider>
      <CategoryProvider>
        <SearchFilterProvider>
          <WishlistProvider>
            <CartProvider>
              <Router>
                <div className="bg-white dark:bg-gray-800 App flex flex-col min-h-screen">
                  <Navbar />
                  <MainLayout />
                  <Footer />
                  <BackToTopButton />
                </div>
              </Router>
            </CartProvider>
          </WishlistProvider>
        </SearchFilterProvider>
      </CategoryProvider>
    </AuthProvider>
  );
}

export default App;

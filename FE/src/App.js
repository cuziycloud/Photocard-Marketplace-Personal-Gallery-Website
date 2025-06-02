import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import MainLayout from './components/layout/MainLayout';
import LoginLayout from './components/layout/LoginLayout'; 
import LoginPage from './pages/LoginPage';
import ProductList from './pages/HomePage';
import MyCollectionPage from './pages/MyCollectionPage';
import WishlistPage from './pages/WishlistPage';
import GalleryPage from './pages/GalleryPage';
import CartPage from './pages/CartPage';
import AddProductPage from './pages/admin/AddProductPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import { CategoryProvider } from './contexts/CategoryContext';
import { SearchFilterProvider } from './contexts/SearchFilterContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import ResetPasswordConfirmPage from './pages/ResetPasswordConfirmPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';

const DefaultLayout = ({ children }) => (
  <div className="bg-white dark:bg-gray-800 App flex flex-col min-h-screen">
    <Navbar />
    {children}
    <Footer />
    <BackToTopButton />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CategoryProvider>
        <SearchFilterProvider>
          <WishlistProvider>
            <CartProvider>
              <Router>
                <Routes>
                  <Route element={<LoginLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/reset-password-confirm" element={<ResetPasswordConfirmPage />} />
                  </Route>
                  <Route element={<DefaultLayout><MainLayout /></DefaultLayout>}>
                    <Route path="/" element={<ProductList />} />
                    <Route path="/card" element={<MyCollectionPage />} />
                    <Route path="/collection" element={<MyCollectionPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/myorder" element={<MyOrdersPage />} />
                    <Route path="/admin/add-product" element={<AddProductPage />} />
                  </Route>
                </Routes>
              </Router>
            </CartProvider>
          </WishlistProvider>
        </SearchFilterProvider>
      </CategoryProvider>
    </AuthProvider>
  );
}

export default App;
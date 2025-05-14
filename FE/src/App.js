import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Categories from './components/Categories';
import { CategoryProvider } from './contexts/CategoryContext';

function App() {
  const [selectedCategory, setSelectedCategory] = useState({ id: null, name: 'Tất cả' });

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <CategoryProvider>
      <div className="App flex flex-col min-h-screen bg-slate-100">
          <Navbar />

        <main className="flex-grow pt-2 sm:pt-2"> 
          <Categories
            onSelectCategory={handleCategorySelect}
          />
          <ProductList />
        </main>
        <Footer />
      </div>
    </CategoryProvider>
  );
}

export default App;
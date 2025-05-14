// src/App.js
import React from 'react';
import ProductList from './components/ProductList';
import './App.css'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Categories from './components/Categories';

function App() {
  return (
    <div className="App">
        <Navbar />
      <main className="flex-grow pt-1">
        <Categories />
        <ProductList /> 
      </main>
      <Footer />
    </div>
  );
}

export default App;
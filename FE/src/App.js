// src/App.js
import React from 'react';
import ProductList from './components/ProductList';
import './App.css'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
        <Navbar />
      <main>
        <ProductList /> 
      </main>
      <Footer />
    </div>
  );
}

export default App;
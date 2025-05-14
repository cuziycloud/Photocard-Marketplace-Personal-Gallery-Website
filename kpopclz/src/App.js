// src/App.js
import React from 'react';
import ProductList from './components/ProductList'; // Import component ProductList
import './App.css'; // CSS chung cho App (nếu có)
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navbar />
      </header>
      <main>
        <ProductList /> 
      </main>
      <footer>

      </footer>
    </div>
  );
}

export default App;
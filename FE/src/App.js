import React from 'react'; 
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import MainLayout from './components/layout/MainLayout';
import { CategoryProvider } from './contexts/CategoryContext';
import { SearchFilterProvider } from './contexts/SearchFilterContext';

function App() {
  return (
    <CategoryProvider>
      <SearchFilterProvider>
        <Router>
          <div className="bg-white dark:bg-gray-800 App flex flex-col min-h-screen">
            <Navbar />
            <MainLayout />
            <Footer />
            <BackToTopButton />
          </div>
        </Router>
      </SearchFilterProvider>
    </CategoryProvider>
  );
}

export default App;

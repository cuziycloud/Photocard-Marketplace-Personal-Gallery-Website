// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Hàm getInitialTheme:
  // 1. Ưu tiên theme đã lưu trong localStorage.
  // 2. Nếu không có, ưu tiên theme hệ thống (prefers-color-scheme).
  // 3. Mặc định là 'light'.
  const getInitialTheme = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('color-theme');
      if (typeof storedPrefs === 'string') {
        return storedPrefs;
      }

      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }
    return 'light'; // Mặc định hoặc nếu không thể truy cập localStorage/matchMedia
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement; // Thẻ <html>
    const isDark = theme === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(theme);

    // Lưu lựa chọn vào localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('color-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Script để áp dụng theme ngay từ đầu, tránh FOUC (Flash Of Unstyled Content)
  const blockingScript = `
    (function() {
      function getInitialTheme() {
        const storedPrefs = window.localStorage.getItem('color-theme');
        if (typeof storedPrefs === 'string') {
          return storedPrefs;
        }
        const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
        if (userMedia.matches) {
          return 'dark';
        }
        return 'light';
      }
      const theme = getInitialTheme();
      document.documentElement.classList.add(theme);
    })();
  `;


  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // ✅ Always start with light if no saved theme
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    // ✅ Apply class to html element
    document.documentElement.className = theme === 'dark' ? 'dark' : '';
    localStorage.setItem('theme', theme);
    console.log('🌓 Theme changed to:', theme); // ✅ debug log
  }, [theme]);

  const toggleTheme = () => {
    console.log('🔄 Toggle clicked, current theme:', theme); // ✅ debug log
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
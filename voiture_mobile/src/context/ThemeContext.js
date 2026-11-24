
// src/context/ThemeContext.js

import React, {
  createContext,
  useContext,
  useState,
} from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ThemeContext.Provider
      value={{ darkMode, setDarkMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme deve ser utilizado dentro de ThemeProvider'
    );
  }

  return context;
}

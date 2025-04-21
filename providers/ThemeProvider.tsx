import React, { createContext, useContext, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';

type ThemeContextType = {
  theme: 'dark' | 'light';
  colors: typeof colors;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  colors,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // For now, we're just using a static dark theme
  const theme = 'dark';
  
  return (
    <ThemeContext.Provider value={{ theme, colors }}>
      <StatusBar style="light" />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
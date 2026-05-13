import {
  createContext,
  useContext,
  useMemo,
} from "react";

/**
 * ============================================
 * THEME CONTEXT
 * ============================================
 */

const ThemeContext =
  createContext(null);

/**
 * ============================================
 * THEME PROVIDER
 * ============================================
 */

function ThemeProvider({
  children,
}) {
  const value =
    useMemo(
      () => ({
        theme: "luxury-light",
      }),
      []
    );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * ============================================
 * USE THEME
 * ============================================
 */

export function useTheme() {
  return useContext(
    ThemeContext
  );
}

export default ThemeProvider;
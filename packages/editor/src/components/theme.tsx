import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useAppContext } from './app-context';

type Theme = 'dark' | 'light' | 'system';

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

type ThemeProviderProps = React.PropsWithChildren<{
  defaultTheme?: Theme;
}>;

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
}) => {
  const { $root } = useAppContext();
  const [theme, setTheme] = useState<Theme>(() => defaultTheme);

  useEffect(() => {
    if (!$root) return;

    $root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      $root.classList.add(systemTheme);
      return;
    }

    $root.classList.add(theme);
  }, [$root, theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (theme: Theme) => {
        setTheme(theme);
      },
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

ThemeProvider.displayName = 'ThemeProvider';

export function useTheme(): ThemeState {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

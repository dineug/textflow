import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAppContext } from '@/components/app-context';
import {
  AccentColor,
  Appearance,
  createTheme,
  GrayColor,
} from '@/themes/radix-ui-theme';
import { themeToTokensString } from '@/themes/tokens';

type ThemeAppearance = 'dark' | 'light' | 'system';

type ThemeAppearanceState = {
  appearance: ThemeAppearance;
  setAppearance: (appearance: ThemeAppearance) => void;
};

const ThemeContext = createContext<ThemeAppearanceState | null>(null);

type ThemeProviderProps = React.PropsWithChildren<{
  defaultAppearance?: ThemeAppearance;
}>;

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultAppearance = 'system',
}) => {
  const { $root } = useAppContext();
  const [systemAppearance, setSystemAppearance] = useState<Appearance>(() =>
    globalThis.matchMedia('(prefers-color-scheme: dark)').matches
      ? Appearance.dark
      : Appearance.light
  );
  const [themeAppearance, setThemeAppearance] = useState<ThemeAppearance>(
    () => defaultAppearance
  );

  const styleRef = useRef<HTMLStyleElement>(null);

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemAppearance(event.matches ? Appearance.dark : Appearance.light);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (!$root) return;

    $root.classList.remove(Appearance.light, Appearance.dark);
    $root.classList.add(
      themeAppearance === 'system' ? systemAppearance : themeAppearance
    );
  }, [$root, systemAppearance, themeAppearance]);

  useEffect(() => {
    const $style = styleRef.current;
    if (!$style) return;

    const lightTheme = createTheme({
      grayColor: GrayColor.slate,
      accentColor: AccentColor.indigo,
      appearance: Appearance.light,
    });

    const darkTheme = createTheme({
      grayColor: GrayColor.slate,
      accentColor: AccentColor.indigo,
      appearance: Appearance.dark,
    });

    const light = `:root {\n${themeToTokensString(lightTheme)}\n}`;
    const dark = `.dark {\n${themeToTokensString(darkTheme)}\n}`;

    $style.textContent = `${light}\n${dark}`;
  }, []);

  const value: ThemeAppearanceState = useMemo(
    () => ({
      appearance: themeAppearance,
      setAppearance: setThemeAppearance,
    }),
    [themeAppearance]
  );

  return (
    <ThemeContext.Provider value={value}>
      <style ref={styleRef}></style>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.displayName = 'ThemeProvider';

export function useTheme(): ThemeAppearanceState {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

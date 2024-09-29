import { isString } from 'lodash-es';
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAppContext } from '@/components/app-context';
import {
  AccentColor,
  AccentColorList,
  Appearance,
  AppearanceList,
  createTheme,
  GrayColor,
  GrayColorList,
} from '@/themes/radix-ui-theme';
import { themeToTokensString } from '@/themes/tokens';
import { arrayHas } from '@/utils/array';

type ThemeAppearance = 'dark' | 'light' | 'auto';

export type Theme = {
  appearance: ThemeAppearance;
  grayColor: GrayColor;
  accentColor: AccentColor;
};

type ThemeContextState = Theme & {
  setGrayColor: (grayColor: GrayColor) => void;
  setAccentColor: (accentColor: AccentColor) => void;
  setAppearance: (appearance: ThemeAppearance) => void;
};

const ThemeContext = createContext<ThemeContextState | null>(null);

const hasGrayColor = arrayHas<string>(GrayColorList);
const hasAccentColor = arrayHas<string>(AccentColorList);
const hasAppearance = arrayHas<string>([...AppearanceList, 'auto']);

type ThemeProviderProps = React.PropsWithChildren<{
  defaultAppearance?: ThemeAppearance;
  onThemeChange?: (theme: Theme) => void;
}>;

type ThemeProviderRef = {
  setTheme: (theme: Partial<Theme>) => void;
};

export const ThemeProvider = forwardRef<ThemeProviderRef, ThemeProviderProps>(
  ({ children, defaultAppearance = 'auto', onThemeChange }, ref) => {
    const { $root } = useAppContext();
    const [systemAppearance, setSystemAppearance] = useState<Appearance>(
      getVSCodeSystemAppearance
    );
    const [themeAppearance, setThemeAppearance] = useState<ThemeAppearance>(
      () => defaultAppearance
    );
    const [grayColor, setGrayColor] = useState<GrayColor>(
      () => GrayColor.slate
    );
    const [accentColor, setAccentColor] = useState<AccentColor>(
      () => AccentColor.indigo
    );

    const styleRef = useRef<HTMLStyleElement>(null);

    const value: ThemeContextState = useMemo(
      () => ({
        grayColor,
        accentColor,
        appearance: themeAppearance,
        setGrayColor: grayColor => {
          setGrayColor(grayColor);
          onThemeChange?.({
            grayColor,
            accentColor,
            appearance: themeAppearance,
          });
        },
        setAccentColor: accentColor => {
          setAccentColor(accentColor);
          onThemeChange?.({
            grayColor,
            accentColor,
            appearance: themeAppearance,
          });
        },
        setAppearance: appearance => {
          setThemeAppearance(appearance);
          onThemeChange?.({ grayColor, accentColor, appearance });
        },
      }),
      [accentColor, grayColor, onThemeChange, themeAppearance]
    );

    useImperativeHandle(
      ref,
      () => ({
        setTheme: ({ appearance, grayColor, accentColor }) => {
          if (isString(grayColor) && hasGrayColor(grayColor)) {
            setGrayColor(grayColor);
          }

          if (isString(accentColor) && hasAccentColor(accentColor)) {
            setAccentColor(accentColor);
          }

          if (isString(appearance) && hasAppearance(appearance)) {
            setThemeAppearance(appearance);
          }
        },
      }),
      []
    );

    useEffect(() => {
      const observer = new MutationObserver(() => {
        setSystemAppearance(getVSCodeSystemAppearance());
      });

      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'data-vscode-theme-kind'],
      });

      return () => {
        observer.disconnect();
      };
    }, []);

    useEffect(() => {
      if (!$root) return;

      $root.classList.remove(Appearance.light, Appearance.dark);
      $root.classList.add(
        themeAppearance === 'auto' ? systemAppearance : themeAppearance
      );
    }, [$root, systemAppearance, themeAppearance]);

    useEffect(() => {
      const $style = styleRef.current;
      if (!$style) return;

      const lightTheme = createTheme({
        grayColor,
        accentColor,
        appearance: Appearance.light,
      });

      const darkTheme = createTheme({
        grayColor,
        accentColor,
        appearance: Appearance.dark,
      });

      const light = `:root {\n${themeToTokensString(lightTheme)}\n}`;
      const dark = `.dark {\n${themeToTokensString(darkTheme)}\n}`;

      $style.textContent = `${light}\n${dark}`;
    }, [accentColor, grayColor]);

    return (
      <ThemeContext.Provider value={value}>
        <style ref={styleRef}></style>
        {children}
      </ThemeContext.Provider>
    );
  }
);

ThemeProvider.displayName = 'ThemeProvider';

function getVSCodeSystemAppearance(): Appearance {
  const themeKind = document.body.dataset.vscodeThemeKind;

  return themeKind
    ? themeKind === 'vscode-light'
      ? Appearance.light
      : Appearance.dark
    : document.body.classList.contains('vscode-light')
      ? Appearance.light
      : Appearance.dark;
}

export function useTheme(): ThemeContextState {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

import { kebabCase } from 'lodash-es';

import { ThemeConfig } from './radix-ui-theme.config';

export type Theme = {
  grayColor1: string;
  grayColor2: string;
  grayColor3: string;
  grayColor4: string;
  grayColor5: string;
  grayColor6: string;
  grayColor7: string;
  grayColor8: string;
  grayColor9: string;
  grayColor10: string;
  grayColor11: string;
  grayColor12: string;

  accentColor1: string;
  accentColor2: string;
  accentColor3: string;
  accentColor4: string;
  accentColor5: string;
  accentColor6: string;
  accentColor7: string;
  accentColor8: string;
  accentColor9: string;
  accentColor10: string;
  accentColor11: string;
  accentColor12: string;

  background: string;
  foreground: string;

  card: string;
  cardForeground: string;

  popover: string;
  popoverForeground: string;

  primary: string;
  primaryForeground: string;

  secondary: string;
  secondaryForeground: string;

  muted: string;
  mutedForeground: string;

  accent: string;
  accentForeground: string;

  destructive: string;
  destructiveForeground: string;

  border: string;
  input: string;
  ring: string;
  selection: string;

  code: string;
  codeLineNumber: string;
  codeLineNumberForeground: string;
  codeLineNumberBorder: string;
  codeComment: string;
  codePunctuation: string;
  codeProperty: string;
  codeSelector: string;
  codeOperator: string;
  codeAttr: string;
  codeVariable: string;
  codeFunction: string;
};

export const ThemeTokens = Object.keys(ThemeConfig) as ReadonlyArray<
  keyof Theme
>;

export const themeToTokensString = (theme: Theme) =>
  Object.keys(theme)
    .map(key => {
      const name = kebabCase(key);
      return `--${name}: ${Reflect.get(theme, key)};`;
    })
    .join('\n');

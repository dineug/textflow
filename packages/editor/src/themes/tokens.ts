import { kebabCase } from 'lodash-es';

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
};

export const ThemeTokens: ReadonlyArray<keyof Theme> = [
  'grayColor1',
  'grayColor2',
  'grayColor3',
  'grayColor4',
  'grayColor5',
  'grayColor6',
  'grayColor7',
  'grayColor8',
  'grayColor9',
  'grayColor10',
  'grayColor11',
  'grayColor12',

  'accentColor1',
  'accentColor2',
  'accentColor3',
  'accentColor4',
  'accentColor5',
  'accentColor6',
  'accentColor7',
  'accentColor8',
  'accentColor9',
  'accentColor10',
  'accentColor11',
  'accentColor12',

  'background',
  'foreground',

  'card',
  'cardForeground',

  'popover',
  'popoverForeground',

  'primary',
  'primaryForeground',

  'secondary',
  'secondaryForeground',

  'muted',
  'mutedForeground',

  'accent',
  'accentForeground',

  'destructive',
  'destructiveForeground',

  'border',
  'input',
  'ring',
  'selection',
];

export const themeToTokensString = (theme: Theme) =>
  Object.keys(theme)
    .map(key => {
      const name = kebabCase(key);
      return `--${name}: ${Reflect.get(theme, key)};`;
    })
    .join('\n');

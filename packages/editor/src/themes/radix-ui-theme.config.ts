import type { Theme } from '@/themes/tokens';

export const ThemeConfig: Theme = {
  grayColor1: 'gray-1',
  grayColor2: 'gray-2',
  grayColor3: 'gray-3',
  grayColor4: 'gray-4',
  grayColor5: 'gray-5',
  grayColor6: 'gray-6',
  grayColor7: 'gray-7',
  grayColor8: 'gray-8',
  grayColor9: 'gray-9',
  grayColor10: 'gray-10',
  grayColor11: 'gray-11',
  grayColor12: 'gray-12',

  accentColor1: 'accent-1',
  accentColor2: 'accent-2',
  accentColor3: 'accent-3',
  accentColor4: 'accent-4',
  accentColor5: 'accent-5',
  accentColor6: 'accent-6',
  accentColor7: 'accent-7',
  accentColor8: 'accent-8',
  accentColor9: 'accent-9',
  accentColor10: 'accent-10',
  accentColor11: 'accent-11',
  accentColor12: 'accent-12',

  background: 'gray-2',
  foreground: 'gray-12',

  card: 'gray-2',
  cardForeground: 'gray-12',

  popover: 'gray-2',
  popoverForeground: 'gray-12',

  primary: 'accent-9',
  primaryForeground: 'override-white',

  secondary: 'gray-4',
  secondaryForeground: 'gray-12',

  muted: 'gray-5',
  mutedForeground: 'gray-11',

  accent: 'accent-7',
  accentForeground: 'gray-12',

  destructive: 'gray-2',
  destructiveForeground: 'gray-12',

  border: 'gray-6',
  input: 'gray-6',
  ring: 'accent-8',
  selection: 'accentA-4',

  code: 'custom-slate--3',
  codeLineNumber: 'custom-olive--3',
  codeLineNumberForeground: 'custom-sand--10',
  codeLineNumberBorder: 'custom-olive--7',
  codeComment: 'custom-slate--10',
  codePunctuation: 'custom-mauve--9',
  codeProperty: 'custom-pink--12',
  codeSelector: 'custom-lime--11',
  codeOperator: 'custom-brown--10',
  codeAttr: 'custom-sky--11',
  codeVariable: 'custom-amber--10',
  codeFunction: 'custom-ruby--9',
} as const;

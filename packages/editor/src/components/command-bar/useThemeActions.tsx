import { useRegisterActions } from 'kbar';
import { get, upperFirst } from 'lodash-es';

import { useTheme } from '@/components/theme';
import {
  AccentColorList,
  Appearance,
  GrayColorList,
  Palette,
} from '@/themes/radix-ui-theme';

export function useThemeActions() {
  const { setAppearance, setAccentColor, setGrayColor } = useTheme();

  useRegisterActions(
    [
      {
        id: 'appearance',
        name: 'Change theme appearance…',
        keywords: 'interface color dark light auto',
        section: 'Preferences',
      },
      {
        id: 'darkTheme',
        name: 'Dark',
        keywords: 'dark theme',
        section: '',
        perform: () => {
          setAppearance(Appearance.dark);
        },
        parent: 'appearance',
      },
      {
        id: 'lightTheme',
        name: 'Light',
        keywords: 'light theme',
        section: '',
        perform: () => {
          setAppearance(Appearance.light);
        },
        parent: 'appearance',
      },
      {
        id: 'SystemTheme',
        name: 'Auto',
        keywords: 'system theme',
        section: '',
        perform: () => {
          setAppearance('auto');
        },
        parent: 'appearance',
      },
      {
        id: 'accentColor',
        name: 'Change theme accent color…',
        keywords: 'interface accent color',
        section: 'Preferences',
      },
      ...AccentColorList.map(key => ({
        id: `accentColor-${key}`,
        name: upperFirst(key),
        icon: (
          <span
            className="h-4 w-4"
            style={{
              backgroundColor: get(Palette, [key, `${key}9`]),
            }}
          />
        ),
        keywords: `accent color ${key}`,
        section: '',
        perform: () => {
          setAccentColor(key);
        },
        parent: 'accentColor',
      })),
      {
        id: 'grayColor',
        name: 'Change theme gray color…',
        keywords: 'interface gray color',
        section: 'Preferences',
      },
      ...GrayColorList.map(key => ({
        id: `grayColor-${key}`,
        name: upperFirst(key),
        icon: (
          <span
            className="h-4 w-4"
            style={{
              backgroundColor: get(Palette, [key, `${key}9`]),
            }}
          />
        ),
        keywords: `gray color ${key}`,
        section: '',
        perform: () => {
          setGrayColor(key);
        },
        parent: 'grayColor',
      })),
    ],
    [setAppearance, setAccentColor, setGrayColor]
  );
}

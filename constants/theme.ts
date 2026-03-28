import { Platform } from 'react-native';

const tintColorLight = '#1F6F63';
const tintColorDark = '#EAF6F3';

export const Colors = {
  light: {
    text: '#11221E',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#64827C',
    tabIconDefault: '#64827C',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#EAF6F3',
    background: '#12211E',
    tint: tintColorDark,
    icon: '#A3C7C0',
    tabIconDefault: '#A3C7C0',
    tabIconSelected: tintColorDark,
  },
};

export const AppColors = {
  background: '#ffffff',
  card: '#FFFFFF',
  cardAlt: '#F8FBFA',
  hero: '#D8EEE7',
  ink: '#16302A',
  subtleText: '#4E6A63',
  accent: '#6FB7A7',
  accentSoft: '#E2F5EF',
  accentDeep: '#1F6F63',
  line: '#C8DDD7',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Avenir Next, Nunito Sans, system-ui, sans-serif",
    serif: "Iowan Old Style, Georgia, serif",
    rounded: "'Avenir Next Rounded', 'Trebuchet MS', sans-serif",
    mono: "'IBM Plex Mono', 'Courier New', monospace",
  },
});

export const AppFonts = {
  body: Fonts.sans,
  display: Fonts.rounded,
  mono: Fonts.sans,
};

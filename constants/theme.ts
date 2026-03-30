import { Platform } from 'react-native';

const tintColorLight = '#00355e';
const tintColorDark = '#EAF6F3';

export const Colors = {
  light: {
    text: '#11221E',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#647f82',
    tabIconDefault: '#647e82',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#EAF6F3',
    background: '#12211E',
    tint: tintColorDark,
    icon: '#a3c1c7',
    tabIconDefault: '#a3c1c7',
    tabIconSelected: tintColorDark,
  },
};

export const AppColors = {
  background: '#ffffff',
  card: '#FFFFFF',
  cardAlt: '#f8fbfb',
  hero: '#d8ebee',
  ink: '#015190', //'#16302A',
  subtleText: '#4e676a',
  accent: '#cdeefd', //'#6FB7A7',
  accentSoft: '#e2f3f5',
  accentDeep: '#00355e', //'#1F6F63',
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

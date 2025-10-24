// Definición de paletas (7 claras y 7 oscuras) orientadas a café gourmet
// Cada paleta define colores base que luego se inyectan como CSS variables
export const LIGHT_THEMES = [
  {
    name: 'espresso', label: 'Espresso',
    accent: '#6B3E26', // marrón espresso
    surface: '#FFFFFF',
    surfaceMuted: '#F6F3F1',
    text: '#2C241F',
    bg: '#FCFAF8',
    highlight: '#B06C49'
  },
  {
    name: 'latte', label: 'Latte',
    accent: '#C28F5C',
    surface: '#FFFFFF',
    surfaceMuted: '#F9F5F1',
    text: '#3A2C22',
    bg: '#FBF7F3',
    highlight: '#D9B48A'
  },
  {
    name: 'cacao', label: 'Cacao',
    accent: '#8B4513',
    surface: '#FFFFFF',
    surfaceMuted: '#F5EFEA',
    text: '#2A1C12',
    bg: '#FAF4EF',
    highlight: '#BF7330'
  },
  {
    name: 'forest', label: 'Forest',
    accent: '#3F6F3A',
    surface: '#FFFFFF',
    surfaceMuted: '#F2F7F1',
    text: '#1E2A1C',
    bg: '#F7FBF6',
    highlight: '#5E8E58'
  },
  {
    name: 'amber', label: 'Amber',
    accent: '#B57420',
    surface: '#FFFFFF',
    surfaceMuted: '#FDF6EC',
    text: '#2B1E0F',
    bg: '#FCF3E5',
    highlight: '#D08B35'
  },
  {
    name: 'berry', label: 'Berry',
    accent: '#7C2345',
    surface: '#FFFFFF',
    surfaceMuted: '#F8EFF2',
    text: '#33121F',
    bg: '#FBEFF4',
    highlight: '#9C3A60'
  },
  {
    name: 'ocean', label: 'Ocean',
    accent: '#2F6690',
    surface: '#FFFFFF',
    surfaceMuted: '#ECF3F8',
    text: '#0F2533',
    bg: '#F2F7FA',
    highlight: '#4787B5'
  }
];

export const DARK_THEMES = [
  {
    name: 'espresso-dark', label: 'Espresso D',
    accent: '#B06C49',
    surface: '#1E1713',
    surfaceMuted: '#16110E',
    text: '#E9E3DF',
    bg: '#120D0B',
    highlight: '#D38F68'
  },
  {
    name: 'latte-dark', label: 'Latte D',
    accent: '#D9B48A',
    surface: '#1C1815',
    surfaceMuted: '#15110F',
    text: '#EDE5DE',
    bg: '#110E0B',
    highlight: '#E9C9A9'
  },
  {
    name: 'cacao-dark', label: 'Cacao D',
    accent: '#BF7330',
    surface: '#1C140D',
    surfaceMuted: '#140E08',
    text: '#E9E1DA',
    bg: '#100B07',
    highlight: '#D08842'
  },
  {
    name: 'forest-dark', label: 'Forest D',
    accent: '#5E8E58',
    surface: '#121A12',
    surfaceMuted: '#0C120C',
    text: '#DDE7DC',
    bg: '#090F09',
    highlight: '#7BAF74'
  },
  {
    name: 'amber-dark', label: 'Amber D',
    accent: '#D08B35',
    surface: '#19130B',
    surfaceMuted: '#110D08',
    text: '#EEE3D3',
    bg: '#0B0804',
    highlight: '#E09D46'
  },
  {
    name: 'berry-dark', label: 'Berry D',
    accent: '#9C3A60',
    surface: '#1A1215',
    surfaceMuted: '#120C0F',
    text: '#F1E4E9',
    bg: '#0C0709',
    highlight: '#B25178'
  },
  {
    name: 'ocean-dark', label: 'Ocean D',
    accent: '#4787B5',
    surface: '#11181D',
    surfaceMuted: '#0C1215',
    text: '#DCE7ED',
    bg: '#070C0F',
    highlight: '#5FA3CF'
  }
];

export function applyPalette(mode, palette) {
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--surface', palette.surface);
  root.style.setProperty('--surface-muted', palette.surfaceMuted);
  root.style.setProperty('--color-texto', palette.text);
  root.style.setProperty('--color-fondo', palette.bg);
  root.style.setProperty('--highlight', palette.highlight);
}

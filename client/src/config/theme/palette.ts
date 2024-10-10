import { alpha, createTheme, type Palette } from '@mui/material/styles'

// ----------------------------------------------------------------------

export interface IPalette extends Palette {
  grey: typeof GREY
  chart: typeof CHART_COLORS
}

function createGradient (color1: string, color2: string) {
  return `linear-gradient(to bottom, ${color1}, ${color2})`
}

export type IChartOptions = typeof CHART_COLORS
// SETUP COLORS
const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  50: '#F9FAFB',
  A100: '#F9FAFB',
  A200: '#F9FAFB',
  A400: '#F9FAFB',
  A700: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
  500_8: alpha('#919EAB', 0.08),
  500_12: alpha('#919EAB', 0.12),
  500_16: alpha('#919EAB', 0.16),
  500_24: alpha('#919EAB', 0.24),
  500_32: alpha('#919EAB', 0.32),
  500_48: alpha('#919EAB', 0.48),
  500_56: alpha('#919EAB', 0.56),
  500_80: alpha('#919EAB', 0.8)
}

const PRIMARY = {
  lighter: '#D1E9FC',
  light: '#394452',
  main: '#039485',
  mainlight: '#04af9e',
  dark: '#081627',
  darker: '#061B64',
  contrastText: '#fff'
}

const PRIMARYNEUTRAL = {
  lighter: '#579AFF',
  light: '#579AFF',
  main: '#579AFF',
  dark: '#579AFF',
  darker: '#579AFF',
  contrastText: '#fff'
}

const SECONDARY = {
  lighter: '#E0E9F4',
  light: '#1A202C',
  main: '#1A202C',
  dark: '#0D121F',
  darker: '#040815',
  contrastText: '#fff'
}

const INFO = {
  lighter: '#DCF3FF',
  light: '#98D3FF',
  main: '#54A6FF',
  dark: '#2A60B7',
  darker: '#102E7A',
  contrastText: '#fff'
}

const SUCCESS = {
  lighter: '#D3F178',
  light: '#D3F178',
  main: '#7FB519',
  dark: '#659711',
  darker: '#3B6506',
  contrastText: GREY[800]
}

const WARNING = {
  lighter: '#FFF8D7',
  light: '#FFE488',
  main: '#FFC73A',
  dark: '#B7821D',
  darker: '#7A4D0B',
  contrastText: GREY[800]
}

const ERROR = {
  lighter: '#FF4423',
  light: '#FF4423',
  main: '#FF4423',
  dark: '#B71112',
  darker: '#7A0619',
  contrastText: '#fff'
}

const GRADIENTS = {
  primary: createGradient(PRIMARY.light, PRIMARY.main),
  info: createGradient(INFO.light, INFO.main),
  success: createGradient(SUCCESS.light, SUCCESS.main),
  warning: createGradient(WARNING.light, WARNING.main),
  error: createGradient(ERROR.light, ERROR.main)
}

export const CHART_COLORS = {
  violet: ['#826AF9', '#9E86FF', '#D0AEFF', '#F7D2FF'],
  blue: ['#2D99FF', '#83CFFF', '#A5F3FF', '#CCFAFF'],
  green: ['#2CD9C5', '#60F1C8', '#A4F7CC', '#C0F2DC'],
  yellow: ['#FFE700', '#FFEF5A', '#FFF7AE', '#FFF3D6'],
  red: ['#FF6C40', '#FF8F6D', '#FFBD98', '#FFF2D4'],
  pink: ['#EB7CA6', '#FFACC8', '#579AFF', '#5CAFFC', '#008679', '#A1A9FE']
}

const { palette } = createTheme()

const paletteNew = {
  common: { black: '#000', white: '#fff' },
  primary: { ...PRIMARY },
  mPrimary: palette.augmentColor({ color: PRIMARYNEUTRAL }),
  secondary: { ...SECONDARY },
  info: { ...INFO },
  success: { ...SUCCESS },
  warning: { ...WARNING },
  error: { ...ERROR },
  grey: GREY,
  gradients: GRADIENTS,
  chart: CHART_COLORS,
  divider: GREY[500_24],
  text: { primary: GREY[800], secondary: GREY[600], disabled: GREY[500], mPrimary: PRIMARYNEUTRAL.main },
  background: { paper: '#fff', default: GREY[100], neutral: GREY[200] },
  action: {
    active: GREY[600],
    hover: GREY[500_8],
    selected: GREY[500_16],
    disabled: GREY[500_80],
    disabledBackground: GREY[500_24],
    focus: GREY[500_24],
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
    selectedOpacity: palette.action.selectedOpacity,
    focusOpacity: palette.action.focusOpacity,
    activatedOpacity: palette.action.activatedOpacity
  },
  mode: palette.mode,
  contrastThreshold: palette.contrastThreshold,
  tonalOffset: palette.tonalOffset,
  getContrastText: palette.getContrastText,
  augmentColor: palette.augmentColor
}

export default paletteNew

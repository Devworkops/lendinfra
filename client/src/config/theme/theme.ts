import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles'
import paletteNew, { type IPalette } from './palette'
import shadows, { customShadows, type ICustomShadow } from './shadows'
import typography from './typography'
import componentsOverride from './overrides'
import { type PaletteColorOptions } from '@mui/material'

interface IThemeOptions extends ThemeOptions {
  customShadows: ICustomShadow
  palette: IPalette
}

export interface ITheme extends Theme {
  customShadows: ICustomShadow
  palette: IPalette
}
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    mPrimary: true
  }
}
declare module '@mui/material/styles' {
  interface Palette {
    mPrimary: PaletteColorOptions
  }
  interface PaletteOptions {
    mPrimary: PaletteColorOptions
  }
}

// Create a theme instance.
let theme = createTheme({
  palette: { ...paletteNew },
  shadows,
  customShadows,
  typography,
  shape: {
    borderRadius: 8
  },
  components: {
    MuiTab: {
      defaultProps: {
        disableRipple: true
      }
    }
  },
  mixins: {
    toolbar: {
      minHeight: 50
    }
  }
} as IThemeOptions)

theme = {
  ...theme
}
theme.components = componentsOverride(theme as ITheme)
export default theme as ITheme

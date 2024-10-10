import { padding } from '@mui/system'
import { type ITheme } from '../theme'

export default function Autocomplete (theme: ITheme) {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          borderRadius: '60px',
          padding: '1px',
          '& .MuiOutlinedInput-root': {
            padding: '0px'
          },
          minWidth: '100px',
          width: '100%',
          paddingRight: '5px'
        },
        paper: {
          boxShadow: theme.customShadows.z20
        }
      }
    }

  }
}

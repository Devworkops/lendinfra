//
import CssBaseline from './CssBaseline'
import { type ITheme } from '../theme'
import Autocomplete from './Autocomplete'
import Input from './Input'
import FormLabel from './FormLabel'

// ----------------------------------------------------------------------

export default function ComponentsOverrides (theme: ITheme) {
  return Object.assign(
    CssBaseline(),
    Autocomplete(theme),
    Input(theme),
    FormLabel()
  )
}

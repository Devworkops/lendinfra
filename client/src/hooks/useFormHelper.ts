import { type FieldError } from 'react-hook-form'

export default () => {
  const parseError = (error: FieldError) => {
    if (error.type === 'pattern') {
      return error.message ? error.message : 'Something wrong happened!'
    }
    return 'This field is required'
  }

  return [parseError]
}

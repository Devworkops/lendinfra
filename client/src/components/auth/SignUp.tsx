import CssBaseline from '@mui/material/CssBaseline'
import Grid from '@mui/material/Grid'
import { FormContainer } from 'react-hook-form-mui'
import { useAuth } from '../../hooks/useAuth'
import useFormHelper from '../../hooks/useFormHelper'
import { useForm } from 'react-hook-form'
import { type SignUpArgs } from '../../interfaces/IUser'
import { useRouter } from 'next/router'
import SignUpUserForm from './SignUpUserForm'

export default function SignUp () {
  const { signup } = useAuth()

  const formContext = useForm<SignUpArgs>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    }
  })
  const router = useRouter()
  const [parseError] = useFormHelper()

  const handleSubmit = async (data: SignUpArgs) => {
    signup(data, async () => await router.push('/'))
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      spacing={{ xs: 0, sm: 0, md: 4, lg: 4 }}
    >
      <Grid item xs={false} sm={false} md={1} />
      <Grid item xs={12} md={4} flexDirection="column">
        <CssBaseline />
        <FormContainer formContext={formContext} onSuccess={handleSubmit}>
        <SignUpUserForm
            parseError={parseError}
        />
        </FormContainer>
      </Grid>
      <Grid item xs={false} md={1} />
    </Grid>
  )
}

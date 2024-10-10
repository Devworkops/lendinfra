import * as React from 'react'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/router'
import { InputAdornment } from '@mui/material'
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'

export default function SignIn () {
  const { signin } = useAuth()
  const [showPassword, setShowPassword] = React.useState<boolean>(false)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = data.get('email')
    const password = data.get('password')

    if (email != null && password != null) {
      await signin(email.toString(), password.toString(), async () =>
        await router.push('/dashboard')
      )
    }
  }

  const router = useRouter()

  const handleSignup = () => {
    router.push('/sign-up')
  }

  const handleForgotPassword = () => {
    router.push('/forgot-password')
  }

  return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={{ xs: 0, sm: 0, md: 4, lg: 4 }}
      >
        <CssBaseline />
        <Grid item xs={false} sm={false} md={1} />
        <Grid item xs={false} md={1} />
        <Grid item xs={12} md={3} flexDirection="column">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography component="h3" variant="h3" color="primary">
              Log in to Decision Loop
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 2 }}
            >
              <TextField
                margin="none"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlternateEmailOutlinedIcon color="primary" />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => { setShowPassword(!showPassword) }}
                        edge="end"
                      >
                        {showPassword
                          ? (
                          <VisibilityOff color="primary" />
                            )
                          : (
                          <Visibility color="primary" />
                            )}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 3 }}
              >
                SIGN IN
              </Button>
              <Grid
                container
                direction="column"
                alignItems="center"
                spacing={3}
              >
                <Grid item xs>
                  <Link
                    onClick={handleForgotPassword}
                    variant="h6"
                    sx={{ cursor: 'pointer', color: 'text.secondary' }}
                  >
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6" color="text.secondary">
                    Don't have an account?
                    <Link
                      onClick={handleSignup}
                      variant="h6"
                      sx={{ cursor: 'pointer' }}
                    >
                      {'Sign Up'}
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={false} md={1} />
        <Grid item xs={false} sm={false} md={1} />
      </Grid>
  )
}

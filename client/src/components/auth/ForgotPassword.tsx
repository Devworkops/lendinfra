import * as React from 'react'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useAuth } from '../../hooks/useAuth'
import { Grid, InputAdornment } from '@mui/material'
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined'
import Link from '@mui/material/Link'
import { useRouter } from 'next/router'

export default function ForgotPassword () {
  const { passwordReset } = useAuth()
  const router = useRouter()
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = data.get('email')
    if (email != null) passwordReset(encodeURIComponent(email.toString()))
  }

  const handleSignin = () => {
    router.push('/sign-in')
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      spacing={{ xs: 0, sm: 0, md: 4, lg: 4 }}
    >
      <CssBaseline />
      <Grid item md={1} />
      <Grid item xs={12} md={3} flexDirection="column">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography component="h1" variant="h5" color="primary">
            Reset Password
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          Already have an account?
          <Link onClick={handleSignin} variant="h6" sx={{ cursor: 'pointer' }}>
            {'Log In'}
          </Link>
        </Typography>
      </Grid>
      <Grid item xs={false} md={1} />
    </Grid>
  )
}

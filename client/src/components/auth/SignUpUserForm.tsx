import * as React from 'react'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import { Box, InputAdornment } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import { TextFieldElement } from 'react-hook-form-mui'
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined'
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useRouter } from 'next/router'

export default function SignUpUserForm (props: any) {
  const [showPassword, setShowPassword] = React.useState<boolean>(false)
  const { parseError } = props
  const router = useRouter()

  const handleSignin = () => {
    router.push('/sign-in')
  }

  return (
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Typography component="h3" variant="h3" color="primary">
        Sign up for an account
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextFieldElement
              fullWidth
              required
              name={'firstName'}
              label={'First Name'}
              parseError={parseError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleIcon color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextFieldElement
              required
              name={'lastName'}
              label={'Last Name'}
              parseError={parseError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleIcon color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextFieldElement
              fullWidth
              required
              type="email"
              name={'email'}
              label={'Email Address'}
              parseError={parseError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AlternateEmailOutlinedIcon color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextFieldElement
              fullWidth
              required
              type={showPassword ? 'text' : 'password'}
              name={'password'}
              label={'Password'}
              parseError={parseError}
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
          </Grid>
        </Grid>
        <Button
          type='submit'
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 4 }}
        >
          Submit
        </Button>
        <Grid container justifyContent="center">
          <Grid item>
            <Typography variant="h6" color="text.secondary">
              Already have an account?
              <Link
                onClick={handleSignin}
                variant="h6"
                sx={{ cursor: 'pointer' }}
              >
                Sign in
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

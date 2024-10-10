import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import {
  Box,
  InputAdornment
} from '@mui/material'
import Typography from '@mui/material/Typography'
import { TextFieldElement } from 'react-hook-form-mui'
import BusinessIcon from '@mui/icons-material/Business'
import MButton from '../common/Mbutton'
import SearchIcon from '@mui/icons-material/Search'
import LanguageIcon from '@mui/icons-material/Language'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

export default function SignUpCompanyForm (props: any) {
  const { parseError, handleCancel } = props
  const margin = 4
  const btnText = 'Add Company'
  const headerText = 'Add your business'
  return (
    <Box
      sx={{
        marginTop: { margin },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Typography component="h3" variant="h3">
        {headerText}
      </Typography>
      <Box sx={{ mt: 3, pb: 2 }}>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <TextFieldElement
              fullWidth
              required
              name={'companyName'}
              label={'Company Name'}
              parseError={parseError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextFieldElement
              fullWidth
              required
              name={'industry'}
              label={'Industry'}
              parseError={parseError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <TextFieldElement
              fullWidth
              required
              name={'country'}
              label={'Country'}
              parseError={parseError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LanguageIcon color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextFieldElement
              fullWidth
              required
              name={'timeZone'}
              label={'Time Zone'}
              parseError={parseError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeIcon color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextFieldElement
              fullWidth
              required
              name={'address'}
              label={'Address'}
              parseError={parseError}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <MButton
              onClick={handleCancel}
              fullWidth
              variant="outlined"
              sx={{ mt: 3, mb: 4 }}
            >
              Cancel
            </MButton>
          </Grid>
          <Grid item xs={6}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 4 }}
            >
              {btnText}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

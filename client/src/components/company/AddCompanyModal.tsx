import { Dialog, DialogContent, Box } from '@mui/material'
import { FormContainer } from 'react-hook-form-mui'
import { useForm } from 'react-hook-form'
import { type Company, ExchangeRateInterval } from '../../interfaces/ICompany'
import { useRouter } from 'next/router'
import useFormHelper from '../../hooks/useFormHelper'
import SignUpCompanyForm from '../company/SignUpCompanyForm'
import useApi from '../../hooks/useApi'
import { useSnackbar } from 'notistack'
import { useAuth } from '../../hooks/useAuth'

export default function AddCompanyModal ({
  modalOpen,
  setDropAnchorEl,
  handleClose
}: {
  modalOpen: boolean
  setDropAnchorEl: any
  handleClose: any
}) {
  const { auth } = useAuth()
  const router = useRouter()
  const [, createCompany, ,] = useApi<Company>()
  const [parseError] = useFormHelper()
  const { enqueueSnackbar } = useSnackbar()

  const handleCancel = () => {
    handleClose()
  }
  const handleSubmit = async (data: Company) => {
    const result = await createCompany('api/company/new', data)
    if (result.data.errors) {
      enqueueSnackbar(result.data.errors[0].message, {
        variant: 'error'
      })
    } else {
      enqueueSnackbar('Created New Company Successfully', {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      })
    }
    handleClose()
    setDropAnchorEl(null)
    router.push('/dashboard')
  }
  const formContext = useForm<Company>({
    defaultValues: {
      companyName: '',
      industry: '',
      country: '',
      timeZone: '',
      address: ''
    }
  })
  return (
    <Dialog open={modalOpen} >
      <DialogContent>
        <Box sx={{ maxWidth: '500px', minWidth: '400px' }} justifyContent="flex-end">
        <FormContainer formContext={formContext} onSuccess={handleSubmit}>
            <SignUpCompanyForm
              parseError={parseError}
              handleCancel={handleCancel}
            />
        </FormContainer>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

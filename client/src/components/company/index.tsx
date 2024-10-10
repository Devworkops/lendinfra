import * as React from 'react'
import Grid from '@mui/material/Grid'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography
} from '@mui/material'
import { FormContainer, SelectElement } from 'react-hook-form-mui'
import { useAuth } from '../../hooks/useAuth'
import useFormHelper from '../../hooks/useFormHelper'
import { useForm, useWatch } from 'react-hook-form'
import { type Company } from '../../interfaces/ICompany'
import { useSnackbar } from 'notistack'
import useApi from '../../hooks/useApi'
import MButton from '../common/Mbutton'
import { CompanyConstant } from '../../config/constants/CompanyConstant'

interface CompanyObj { company: Omit<Company, 'beneficiary'> }
export default function AddEditCompany () {
  const { auth, company } = useAuth()
  const [disableFormFields, setdisableFormFields] = React.useState(
    CompanyConstant.disableFields
  )
  const [companyDefaultValues, setcompanyDefaultValues] = React.useState(
    {
      id: company?.id,
      companyName: company?.companyName,
      industry: company?.industry,
      country: company?.country,
      timeZone: company?.timeZone,
      address: company?.address
    }
  )
  const formContext = useForm<CompanyObj>({
    defaultValues: {
      company: companyDefaultValues
    }
  })

  const companyDetail = useWatch({
    control: formContext.control,
    name: 'company'
  })

  const [parseError] = useFormHelper()
  const { enqueueSnackbar } = useSnackbar()
  const [getCompany, , updateCompany] = useApi<Company>()
  const nameForm = React.useRef(null)

  const handleSubmit = async () => {
    const companyToSaveUpdate = {
      id: companyDetail.id,
      companyName: companyDetail?.companyName,
      industry: companyDetail?.industry,
      country: companyDetail?.country,
      timeZone: companyDetail?.timeZone,
      address: companyDetail?.address
    }
    let result

    result = await updateCompany(
        `api/company/${companyDetail.id}`,
        companyToSaveUpdate
    )
    if (result.data.errors) {
      enqueueSnackbar(result.data.errors[0].message, {
        variant: 'error'
      })
    } else {
      enqueueSnackbar('Company Updated Successfully', {
        variant: 'success'
      })
      setcompanyDefaultValues(companyToSaveUpdate)
      console.log(companyToSaveUpdate)
    }

    setdisableFormFields(() => ({
      ...CompanyConstant.disableFields
    }))
  }

  const handleCancel = () => {
    setdisableFormFields(() => ({
      ...CompanyConstant.disableFields
    }))
  }

  const handleCompanyEdit = () => {
    // e.preventDefault()
    setdisableFormFields(() => ({
      ...CompanyConstant.enableFields
    }))
  }

  React.useEffect(() => {
    if ((auth != null) && auth.companyId) {
      if (company == null) {
        // get the company detail
        getCompany(`api/company/${auth.companyId}`).then((response) => {
          if (response.data.errors) {
            enqueueSnackbar(response.data.errors[0].message, {
              variant: 'error'
            })
          } else {
            formContext.setValue('company', response.data)
          }
        })
      }
    }
  }, [auth])

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      spacing={{ xs: 5, sm: 0, md: 5, lg: 5 }}
    >
      {(auth != null) && auth?.companyId && companyDetail?.companyName && (
        <>
          <Grid item xs={12} md={12} flexDirection="column">
            <Card variant="outlined">
              <CardContent ref={nameForm}>
                <Typography gutterBottom variant="h5">
                  Company Information
                  {disableFormFields.companyName
                    ? <MButton variant="contained" onClick= {handleCompanyEdit} sx={{ float: 'right' }}> Edit </MButton>
                    : <Box sx={{ float: 'right' }}>
                    <MButton variant="outlined" onClick= {handleCancel} sx={{ mr: 1 }}> Cancel </MButton>
                    <MButton variant="contained" onClick= {handleSubmit} > Save </MButton>
                  </Box>
                   }
                </Typography>
                <FormContainer
                  formContext={formContext}
                  onSuccess={handleSubmit}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography>Name</Typography>
                      <TextField
                        fullWidth
                        required
                        name={'company.companyName'}
                        defaultValue={companyDetail.companyName}
                        disabled={disableFormFields.companyName}
                        onBlur={(e) => {
                          companyDetail.companyName = e.target.value
                        }}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={6}>
                    <Typography>Industry</Typography>
                      <TextField
                        fullWidth
                        required
                        name={'company.industry'}
                        defaultValue={companyDetail.industry}
                        disabled={disableFormFields.industry}
                        onBlur={(e) => {
                          companyDetail.address = e.target.value
                        }}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography>Country</Typography>
                      <TextField
                        fullWidth
                        required
                        name={'company.country'}
                        defaultValue={companyDetail.country}
                        disabled={disableFormFields.country}
                        onBlur={(e) => {
                          companyDetail.country = e.target.value
                        }}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={6}>
                    <Typography>Time Zone</Typography>
                      <TextField
                        fullWidth
                        required
                        name={'company.timeZone'}
                        defaultValue={companyDetail.timeZone}
                        disabled={disableFormFields.timeZone}
                        onBlur={(e) => {
                          companyDetail.timeZone = e.target.value
                        }}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </FormContainer>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  )
}

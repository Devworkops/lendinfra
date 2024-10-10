import * as React from 'react'
import { useEffect } from 'react'
import { enqueueSnackbar, useSnackbar } from 'notistack'
import {
  AppBar,
  FormControlLabel,
  Switch,
  Toolbar,
  Typography,
} from '@mui/material'
import { useAuth } from '../../hooks/useAuth'
import useApi from '../../hooks/useApi'

export default function NotificationSettings () {
  const { auth } = useAuth()
  const [getExistingSettings,updateNotificationSettings , ,] = useApi<{}>()
  const [isEnabled, setIsEnabled] = React.useState(false);

  useEffect(()=>{
    if (auth) {
      getExistingSettings(`api/notification/settings/${auth?.id}?company_id=${auth?.companyId}`).then((response) => {
        if (response.data.errors) {
          enqueueSnackbar('Someting went wrong', {
            variant: 'error'
          })
        } else {
          if(response?.data?.user?.notificationSetting != undefined && response?.data?.user?.notificationSetting?.email == 'enable') setIsEnabled(true)
          else setIsEnabled(false)
          }
      })
    }
  },[auth])

  const handleSwitchChange = async (event:any) => {
    const value = event.target.checked;
    let email ='disable'

    console.log("email Value",value)
    if (value)  email = 'enable'
    else email = 'disable'
    updateNotificationSettings(`api/notification/settings/${auth?.id}?company_id=${auth?.companyId}`,{ email: email }).then((response) => {
      if (response.data.errors) {
        enqueueSnackbar('Someting went wrong', {
          variant: 'error'
        })  
      } else {
        enqueueSnackbar('Setting updated Successfully', {
          variant: 'success'
        })
        if(response?.data?.user?.notificationSetting != undefined && response?.data?.user?.notificationSetting?.email == 'enable') setIsEnabled(value)
        else setIsEnabled(value)
        }
    })
  }

  return (
    <AppBar
    position="static"
    color="inherit"
    sx={{ boxShadow: 'none', mb: 3 }}
    >
    <Toolbar sx={{ paddingLeft: '4px !important' }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Notification Settings        
        </Typography>
    </Toolbar>
    <FormControlLabel
          control={<Switch checked={isEnabled} onChange={handleSwitchChange} />}
          label="Email notifications for workflow errors"
        />
    </AppBar> 
  )
}

import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { Stack } from '@mui/material'
import { type UseFormReturn } from 'react-hook-form'
import { FormContainer } from 'react-hook-form-mui'

export default function FormDialog(props: {
  isOpen: boolean
  onClose: () => void
  isEditMode?: boolean
  setEditMode?: (arg0: boolean) => void
  showButtons: boolean
  data: UseFormReturn<any, any> | undefined
  handleSubmit: any
  children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined
  title: string | undefined,
  maxWidth?:'sm'|'md'|'lg'
}) {
  const handleCancel = async () => {
    props.data?.reset()
    if (props.setEditMode)
      props.setEditMode(false)
  }

  const renderForm = () => {
    return (
      <FormContainer formContext={props.data} onSuccess={props.handleSubmit}>
        <>{props.children}</>
      </FormContainer>
    )
  }

  return (
    <div>
      <Dialog open={props.isOpen} onClose={props.onClose} fullWidth maxWidth={props.maxWidth?props.maxWidth:'sm'}>
        <DialogTitle sx={{ textAlign: 'center' }}>{props.title}</DialogTitle>
        <DialogContent>
          {renderForm()}
        </DialogContent>
        <DialogActions>
          {props.showButtons &&
            <Stack direction="row-reverse" spacing={2} sx={{ paddingBottom: '16px' }}>
              {props.isEditMode && <Button variant="contained" color="primary" type="submit" >Save</Button>}
              {props.isEditMode && <Button variant="outlined" color="secondary" onClick={async () => { await handleCancel() }} >Reset</Button>}
              {!props.isEditMode && <Button variant="outlined" color="secondary" onClick={() => { props.setEditMode ? props.setEditMode(true) : () => { } }}>Edit</Button>}
            </Stack>
          }
        </DialogActions>
      </Dialog>
    </div>
  )
}

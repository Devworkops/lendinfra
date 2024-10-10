import * as React from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { type UseFormReturn } from 'react-hook-form'
import { FormContainer } from 'react-hook-form-mui'
import MButton from './Mbutton'

export default function EditSaveForm (props: {
  formContext: UseFormReturn<any, any> | undefined
  handleSubmit: any
  children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined
  isEditMode: boolean
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>
  title: string
  titleLeadingIcon?: React.ReactNode
  editable?: boolean
}) {
  const handleCancel = async () => {
    props.formContext?.reset()
    props.setEditMode(false)
  }

  return (
        <FormContainer formContext={props.formContext} onSuccess={props.handleSubmit} >
            <Typography variant="h4" color="primary" component="h2">{props.title}{props.titleLeadingIcon || ''}</Typography>
            <Stack direction="row-reverse" spacing={2} sx={{ paddingBottom: '16px' }}>
                {props.isEditMode && <MButton variant="contained" color="primary" onClick={() => {}} type="submit">Save</MButton>}
                {props.isEditMode && <MButton variant="outlined" color="primary" onClick={async () => { await handleCancel() }} >Cancel</MButton>}
                {(props.editable === undefined && props.editable !== false && !props.isEditMode) && <MButton variant="outlined" color="primary" onClick={() => { props.setEditMode(true) }}>Edit</MButton>}
            </Stack>
            <>{props.children}</>
        </FormContainer>
  )
}

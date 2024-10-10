import React, { useState } from 'react'
import FormDialog from '../common/FormDialog'
import { useForm, useWatch } from 'react-hook-form'
import { Box, Button, Grid, InputLabel, Typography } from '@mui/material'
import { SelectElement, TextFieldElement } from 'react-hook-form-mui'
import useFormHelper from '../../hooks/useFormHelper'
import useApi from '../../hooks/useApi'
import { useSnackbar } from 'notistack'
import { useAuth } from '../../hooks/useAuth'
import { type DataModel, DataType } from '../../interfaces/IDataModel'
import ModelTable from './ModelTable'
const toJsonSchema = require('to-json-schema')

interface DataModelObj { DataModel: DataModel }

export interface AddDataModelDialogProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const readJsonFile = async (file: Blob) =>
  await new Promise((resolve, reject) => {
    const fileReader = new FileReader()

    fileReader.onload = event => {
      if (event.target != null) {
        resolve(JSON.parse(event.target.result as string))
      }
    }

    fileReader.onerror = error => { reject(error) }
    fileReader.readAsText(file)
  })

export default function AddDataModel (props: AddDataModelDialogProps) {
  const { auth } = useAuth()

  const { open, setOpen } = props
  const [isEditMode, setEditMode] = useState<boolean>(false)
  const [schema, setSchema] = React.useState<{ [key: string]: any, type: string } | undefined>()
  const [, addDataModel, ,] = useApi<DataModel>()
  const [parseError] = useFormHelper()
  const { enqueueSnackbar } = useSnackbar()

  const onClose = () => {
    setOpen(false)
  }

  const formContext = useForm<DataModelObj>({
    defaultValues: {
      DataModel: {
        id: '',
        name: '',
        prefix:'',
        label:'',
        description: '',
        company: auth?.companyId,
        createdBy: auth?.id,
        type: DataType.object,
        properties: []
      }
    }
  })

  const dmDetail = useWatch({
    control: formContext.control,
    name: 'DataModel'
  })

  const handleSubmit = async () => {
    let result
    const dmToSaveUpdate = {
      id: dmDetail?.id,
      name: dmDetail.name,
      prefix:dmDetail.prefix,
      label: dmDetail.label,
      description: dmDetail.description,
      company: dmDetail.company,
      createdBy: dmDetail.createdBy,
      type: dmDetail?.type,
      properties: schema?.properties,
      required: dmDetail.required,
      isActive: dmDetail.isActive
    }

    result = await addDataModel('api/DataModel/new', dmToSaveUpdate)
    setEditMode(false)

    if (result && result.data.errors) {
      enqueueSnackbar(result.data.errors[0].message, {
        variant: 'error'
      })
    } else {
      enqueueSnackbar('Data Model addedd Successfully', {
        variant: 'success'
      })
      setOpen(false)
      setSchema(undefined)
    }
    formContext.reset();
  }

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files != null) {
      const parsedData = await readJsonFile(event.target.files[0])
      const options = {
        postProcessFnc: (type: string, schema: any, value: any, defaultFunc: (arg0: any, arg1: any, arg2: any) => any) =>
          (type === 'integer') ? {...schema, type: 'number'} : defaultFunc(type, schema, value),
      }
 
      const schema = toJsonSchema(parsedData, options)
      setSchema(schema)
    }
  }

  return (
    <FormDialog isOpen={open} onClose={onClose} data={formContext} isEditMode={isEditMode} setEditMode={setEditMode} showButtons={false}
      handleSubmit={handleSubmit} title={'New Data Model'}>
      <Box sx={{ width: '100%' }}>
        <React.Fragment>
          <Grid container spacing={2} sx={{ paddingBottom: '20px' }} columns={12}>
            <Grid item xs={12} sm={12} md={12}>
              <TextFieldElement fullWidth required label={'Name'} name={'DataModel.name'} parseError={parseError} size="small" />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <TextFieldElement fullWidth required label={'Description'} name={'DataModel.description'} parseError={parseError} size="small" />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <TextFieldElement fullWidth required label={'Prefix'} name={'DataModel.prefix'} parseError={parseError} size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
                  <InputLabel sx={{ padding: "5px 0px" }}>Parent Model</InputLabel>
                  <SelectElement
                    name={'DataModel.label'}
                    valueKey="id"
                    labelKey="label"
                    options={[
                      {
                        id: "Application",
                        label: "Application",
                      }
                    ]}
                    size="small"
                    fullWidth
                    placeholder="Select Label"
                  />
                </Grid>
            <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex', flexDirection: 'row' }}>
            <Typography color='primary' sx={{ fontWeight: 'bold', paddingRight: '10px' }}>Import Json File</Typography> <input type="file" accept=".json,application/json" onChange={onChange} />
            </Grid>
          </Grid>

          {schema != null && <ModelTable schema={schema}></ModelTable>}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              onClick={onClose}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button type="submit">
              Save
            </Button>
          </Box>
        </React.Fragment>
      </Box>
    </FormDialog>
  )
}

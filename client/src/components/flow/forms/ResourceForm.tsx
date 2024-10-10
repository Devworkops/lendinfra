import * as React from 'react'
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Toolbar,
  IconButton,
  Divider,
  Button,
  Grid,
  Stack,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  TextField
} from '@mui/material'
import { useForm, useWatch } from 'react-hook-form'
import useFormHelper from '../../../hooks/useFormHelper'
import CloseIcon from '@mui/icons-material/Close'
import { DataType, type IResource, ResourceType } from '../../../interfaces/IResource'
import { FormContainer, SelectElement, TextFieldElement } from 'react-hook-form-mui'
import useApi from '../../../hooks/useApi'

const AddNewResource = (props: {
  openResource: boolean
  workflowId: string
  closeResource: () => void
}) => {
  const [parseError] = useFormHelper()
  const [, addResource] = useApi<IResource>()

  const dataTypes = [
    { label: 'Text', id: DataType.text },
    { label: 'Number', id: DataType.number },
    { label: 'Currency', id: DataType.currency },
    { label: 'Boolean', id: DataType.boolean },
    { label: 'Date', id: DataType.date },
    { label: 'Datetime', id: DataType.datetime },
    { label: 'Picklist', id: DataType.picklist },
    { label: 'Multi-Select Picklist', id: DataType.mspicklist }
  ]
  const resourceTypes = [
    { id: ResourceType.variable, label: 'Variable' },
    { id: ResourceType.constant, label: 'Constant' },
    { id: ResourceType.text, label: 'Text template' },
    { id: ResourceType.stage, label: 'Stage' }
  ]

  // List objects from integrated application
  const objectList: any[] = ['global varaible']

  const formContext = useForm<IResource>({
    defaultValues: {
      id: '',
      resourceType: ResourceType.variable,
      apiName: '',
      description: '',
      dataType: DataType.text,
      body: 'Edit the body for custom message',
      order: 1,
      active: false,
      multipleAllowed: false,
      avilableForInput: false,
      availableForOutput: false,
      defaultValue: undefined,
      object: undefined,
      decimalPlaces: 2
    }
  })
  const resourceDetail = useWatch({ control: formContext.control })

    const onSubmit = async (data: IResource) => {
        data.workflowId = props.workflowId;
        let response = await addResource('api/workflow/resource/new', data);
        props.closeResource()
    };
    return (
        <>
            <Dialog open={props.openResource}>
                <DialogTitle sx={{ padding: '8px 0px' }}>
                    <Toolbar sx={{ padding: '0px' }}>
                        <Typography variant="h4" sx={{ flexGrow: 1 }}>
                            New Resource
                        </Typography>
                        <IconButton
                            color="inherit"
                            size="small"
                            onClick={props.closeResource}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </DialogTitle>
                <Divider></Divider>
                <DialogContent>
                    <Box>
                        <FormContainer formContext={formContext} onSuccess={onSubmit}>
                            <Grid container spacing={2} >
                                <Grid item xs={12} md={6}>
                                    <InputLabel sx={{ padding: '5px 0px' }}>Resource Type</InputLabel>
                                    <SelectElement fullWidth required name={'resourceType'} parseError={parseError}
                                        options={resourceTypes} size="small" /><br />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <InputLabel sx={{ padding: '5px 0px' }}>Name</InputLabel>
                                    <TextFieldElement
                                        required
                                        name={'apiName'}
                                        size="small"
                                        placeholder="Name"
                                        fullWidth
                                        parseError={parseError}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <InputLabel sx={{ padding: '5px 0px' }}>Description</InputLabel>
                                    <TextFieldElement
                                        name={'description'}
                                        size="small"
                                        placeholder="Description"
                                        fullWidth
                                        parseError={parseError}
                                    />
                                </Grid>
                                {(resourceDetail.resourceType === ResourceType.variable || resourceDetail.resourceType === ResourceType.constant) &&
                                    <><Grid item xs={12} md={6}>
                                        <InputLabel sx={{ padding: '5px 0px' }}>Data Type</InputLabel>
                                        <SelectElement fullWidth required name={'dataType'} parseError={parseError}
                                            options={dataTypes} size="small" /><br />
                                    </Grid>
                                        {resourceDetail.dataType === DataType.record
                                          ? (<Grid item xs={12} md={6}>
                                                <InputLabel sx={{ padding: '5px 0px' }}>Object</InputLabel>
                                                <Autocomplete
                                                    options={objectList}
                                                    sx={{ width: 140 }}
                                                    size="small"
                                                    renderInput={(params) => <TextField {...params} label="Select Object" sx={{ width: '150px' }} />}
                                                />
                                            </Grid>)
                                          : (
                                                <Grid item xs={12} md={6}>
                                                    <InputLabel sx={{ padding: '5px 0px' }}>Default Value</InputLabel>
                                                    <TextFieldElement
                                                        name={'defaultValue'}
                                                        size="small"
                                                        placeholder="Default Value"
                                                        fullWidth
                                                        parseError={parseError}
                                                    />
                                                </Grid>
                                            )
                                        }
                                        {(resourceDetail.dataType === DataType.number || resourceDetail.dataType === DataType.currency) &&
                                                <Grid item xs={12} md={6}>
                                                    <InputLabel sx={{ padding: '5px 0px' }}>Decimal Places</InputLabel>
                                                    <TextFieldElement
                                                        name={'decimalPlaces'}
                                                        size="small"
                                                        placeholder="Decimal Places"
                                                        fullWidth
                                                        parseError={parseError}
                                                    />
                                                </Grid>
                                        }
                                    </>
                                }
                                {resourceDetail.resourceType === ResourceType.variable &&
                                    <Grid item xs={12} md={6}>
                                        <br /><FormControlLabel control={<Checkbox {...{ inputProps: { 'aria-label': 'multiple allowed' } }} />} label="Allow multiple values(collection)" />
                                    </Grid>
                                }
                                {resourceDetail.resourceType === ResourceType.text &&
                                    <Grid item xs={12} >
                                        <InputLabel sx={{ padding: '5px 0px' }}>Body</InputLabel>
                                        <TextFieldElement
                                            required
                                            name={'body'}
                                            size="small"
                                            placeholder="Body"
                                            fullWidth
                                            parseError={parseError}
                                            multiline
                                            rows={2}
                                            maxRows={4}
                                        />
                                    </Grid>
                                }
                                {resourceDetail.resourceType === ResourceType.stage &&
                                    <>
                                        <Grid item xs={12} md={6}>
                                            <InputLabel sx={{ padding: '5px 0px' }}>Order</InputLabel>
                                            <TextFieldElement fullWidth required name={'order'} parseError={parseError} size="small" />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <br />
                                            <FormControlLabel control={<Checkbox {...{ inputProps: { 'aria-label': 'Checkbox demo' } }} />} label="By default active" />
                                        </Grid>
                                    </>
                                }

                            </Grid>
                            <Divider sx={{ marginBottom: '20px', paddingTop: '20px' }}></Divider>
                            <Grid container spacing={2} >
                                <Grid item xs={12}>
                                    <Stack direction='row' sx={{ justifyContent: 'right' }}>
                                        <Button sx={{ borderRadius: '40px' }} variant="contained" type={'submit'}>Save</Button>
                                        <Button sx={{ borderRadius: '40px' }} onClick={props.closeResource}>Cancel</Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </FormContainer>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
  )
}

export default AddNewResource

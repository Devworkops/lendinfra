import React, { useEffect, useState } from 'react'
import FormDialog from '../common/FormDialog'
import { FilterType, FlowType, TriggerType, type Workflow, WorkflowStatus } from '../../interfaces/IWorkflow'
import { useForm, useWatch } from 'react-hook-form'
import { Box, Button, Card, CardContent, Grid, Step, StepLabel, Stepper, Typography } from '@mui/material'
import router from 'next/router'
import { SelectElement, TextFieldElement } from 'react-hook-form-mui'
import useFormHelper from '../../hooks/useFormHelper'
import useApi from '../../hooks/useApi'
import { useSnackbar } from 'notistack'
import { useAuth } from '../../hooks/useAuth'
import { type DataModel } from '../../interfaces/IDataModel'
import AddEntryConditions from './AddEntryConditions'

export interface Pagination {
  page: number
  maxPageSize: number
  totalResults: number
}

interface WorkflowObj { workflow: Workflow }

export interface AddWorkflowDialogProps {
  open: string
  setOpen: React.Dispatch<React.SetStateAction<string>>
  data: Workflow | undefined
}

export default function AddWorkflow (props: AddWorkflowDialogProps) {
  const { open, setOpen, data } = props
  const [isEditMode, setEditMode] = useState<boolean>(false)
  const [activeStep, setActiveStep] = React.useState(0)
  const [selectedWorkflowtype, setSelectedWorkflowType] = useState<FlowType>()
  const [ selectedFilterType, setSelectedFilterType] = useState<FilterType>(FilterType.none)
  const [, addWorkflow, updateWorkflow ,] = useApi<Workflow>()

  const [getDataModels] = useApi<DataModel[]>()

  const [DataModels, setDataModels] = React.useState<DataModel[]>([])
  const [selectedDataModel, setSelectedDataModel] = React.useState<DataModel | null>(null)
  const [parseError] = useFormHelper()
  const { enqueueSnackbar } = useSnackbar()
  const { auth } = useAuth()

  useEffect(() => {
    if(open == 'edit') {
      if(data){
        formContext.setValue('workflow' , data)
      }
      setActiveStep(0);
      setSelectedFilterType(formContext.getValues().workflow.filterType)
      setSelectedWorkflowType(data?.type)
    } else if(open =='add') {
      setSelectedWorkflowType(undefined);
      setActiveStep(0);
      setSelectedFilterType(FilterType.none);
      formContext.reset();
    }
  }, [open, data])
  
  const steps = [
    'Select workflow type',
    'Configure the flow'
  ]

  const cards = [
    { name: FlowType.recordTriggered, description: 'Launches when a record is created, updated, or deleted. This autolaunched flow runs in the background.' },
    { name: FlowType.scheduleTriggeredFlow, description: 'Launches at a specified time and frequency for each record in a batch. This autolaunched flow runs in the background.' },
    /* We can expand later based on future requirement */
      // { name: FlowType.platformEventTriggeredFlow, description: 'Launches when a platform event message is received. This autolaunched flow runs in the background.' },
      // { name: FlowType.autolaunchedFlow, description: 'Launches when invoked by Apex, processes, REST API, and more. This autolaunched flow runs in the background.' }
  ]

  const filterTypes = [
    { label: 'None', id: FilterType.none },
    { label: 'Any Condition Is Met (OR)', id: FilterType.or },
    { label: 'All Conditions Are Met (AND)', id: FilterType.and },
    { label: 'Custom Condition Logic Is Met', id: FilterType.custom }
  ]

  const triggerType = [
    { label: 'A record is created', id: TriggerType.create },
    { label: 'A record is created or updated', id: TriggerType.createOrUpdate },
    // { label: 'A record is deleted', id: TriggerType.delete },
    { label: 'A record is updated', id: TriggerType.update }
  ]

  const onClose = () => {
    setOpen('')
  }

  const handleNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleType = (type: FlowType) => {
    setSelectedWorkflowType(type)
  }

  const formContext = useForm<WorkflowObj>({
    defaultValues: {
      workflow: {
        id: '',
        name: '',
        description: '',
        company: auth?.companyId,
        type: selectedWorkflowtype,
        status: WorkflowStatus.draft,
        filterType: selectedFilterType,
        filterConditions: [],
        createdBy: 'Admin'
      }
    }
  })

  const handleSubmit = async (data: WorkflowObj) => {
    let result
    data.workflow.type = selectedWorkflowtype || FlowType.recordTriggered
    data.workflow.filterType = selectedFilterType;
    if(selectedFilterType === FilterType.none) 
      data.workflow.filterConditions = [];
    data.workflow.filterConditions.map((inputValue: any) => {
      if(inputValue?.variable?.['type'] === 'boolean'){
        inputValue.value = inputValue.value == 'true' || inputValue.value == 'yes';
      }
    })
    if(open == 'edit'){
      result = await updateWorkflow(`api/workflow/${data.workflow.id}`, data.workflow)
    } else 
      result = await addWorkflow('api/workflow/new', data.workflow)
    setEditMode(false)

    if (result && result.data.errors) {
      enqueueSnackbar(result.data.errors[0].message, {
        variant: 'error'
      })
    } else {
      enqueueSnackbar(`Workflow ${open}ed Successfully`, {
        variant: 'success'
      })
      if(open === 'edit') setOpen('');
      else if(open === 'add') router.push('/flow/' + `${result?.data.id}`)
    }
  }

  const updateData = async (query: any, pagination: Pagination) => {
    let DataModelBaseUrl = `api/DataModel/all/${auth?.companyId}`

    const { page, maxPageSize } = pagination
    DataModelBaseUrl += `?pageToken=${page}&maxPageSize=${maxPageSize}`

    if (query) {
      const { type, options, status, startDate, endDate } = query
      let filterQuery = `&status=${status}&options=${options}&type=${type}`

      if (startDate && endDate) { filterQuery += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}` }

      DataModelBaseUrl += filterQuery
    }

    const [datmodelRes] = await Promise.allSettled([
      getDataModels(DataModelBaseUrl)
    ])

    if (datmodelRes.status === 'fulfilled') {
      const workflowData = datmodelRes.value.data
      if (workflowData.errors) {
        const [{ message }, ..._] = workflowData.errors
        enqueueSnackbar(message, { variant: 'error' })
      } else {
        const { results, totalResults } = workflowData
        setDataModels(results as DataModel[])
      }
    }
  }

  const [pagination, setPagination] = React.useState<Pagination>({
    page: 1,
    maxPageSize: 100,
    totalResults: 0
  })

  // Filters
  const [filterQuery, setFilterQuery] = React.useState({
    startDate: '',
    endDate: '',
    status: 'All',
    type: '',
    options: ''
  })

  useEffect(() => {
    updateData(filterQuery, pagination)
  }, [])

  const getObjectName = () => {
    const objects: Array<{
      label: string
      id: string
    }> = []
    DataModels.forEach(element => {
      objects.push({ label: element.name, id: element.name })
    })
    return objects
  }

  const objectName = useWatch({
    control: formContext.control,
    name: 'workflow.object'
  })


  useEffect(() => {
    updateData(filterQuery, pagination)
  }, [objectName])

  useEffect(() => {
    const datamodel = DataModels.find((obj) => {
      return obj.name === objectName
    })

    if (datamodel != null) { setSelectedDataModel(datamodel) }
  }, [objectName])

  return (
    <FormDialog isOpen={open=='add' || open=='edit'} onClose={onClose} data={formContext} isEditMode={isEditMode} setEditMode={setEditMode} showButtons={false}
      handleSubmit={handleSubmit} title={'New Workflow'}>
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => {
            const stepProps: { completed?: boolean } = {}
            const labelProps: {
              optional?: React.ReactNode
            } = {}

            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            )
          })}
        </Stepper>
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
          {activeStep === steps.length - 1
            ? (
              <Grid container spacing={2} sx={{ paddingBottom: '20px' }} columns={12}>
                <Grid item xs={12} sm={12} md={12}>
                  <TextFieldElement fullWidth required label={'Name'} name={'workflow.name'} parseError={parseError} size="small" />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <TextFieldElement fullWidth required label={'Description'} name={'workflow.description'} parseError={parseError} size="small" />
                </Grid>
                {selectedWorkflowtype === FlowType.recordTriggered &&
                  <>
                    <Grid item xs={12} sm={12} md={12}>
                      <Typography sx={{ paddingBottom: '10px' }}>Select the object whose records trigger the flow when they’re created, updated, or deleted.</Typography>
                      <SelectElement fullWidth required label={'Object'} name={'workflow.object'} parseError={parseError} size="small" options={getObjectName()} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                    <Typography sx={{ paddingBottom: '10px' }}>Trigger the Flow When:</Typography>
                    <SelectElement fullWidth label={'Trigger Type'} name={'workflow.triggerType'} parseError={parseError}
                        options={triggerType} sx={{ minWidth: 177 }} /><br />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                    <Typography sx={{ paddingBottom: '10px' }}>Specify entry conditions to reduce the number of records that trigger the flow and the number of times the flow is executed.</Typography>
                    <SelectElement fullWidth label={'Filter Type'} name={'workflow.filterType'} parseError={parseError}
                        options={filterTypes} sx={{ minWidth: 177 }} onChange={(newValue) => setSelectedFilterType(newValue)} /><br />
                    {(selectedDataModel != null) && (selectedFilterType != FilterType.none) && <AddEntryConditions selectedDataModel={selectedDataModel}></AddEntryConditions>}
                    </Grid>
                  </>
                }
              </Grid>
              )
            : (
              <Grid container spacing={2}>
                {cards.map((card: any) => (
                <Grid item xs={6} key={card.name}>
                  <Card sx={{ maxWidth: 345, minHeight: 170 }} variant="outlined" style={{
                    backgroundColor: selectedWorkflowtype == card.name ? '#039485' : '',
                    color: selectedWorkflowtype == card.name ? 'white' : ''
                  }}
                    onClick={(e) => {
                      e.preventDefault()
                      handleType(card.name)
                    }}>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {card.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                ))}
              </Grid>
              )}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {
              activeStep === steps.length - 1
              ?<Button type="submit">
                Finish
              </Button>
              :<Button disabled={selectedWorkflowtype==undefined} onClick={handleNext}>
                Next
              </Button>
            }
          </Box>
        </React.Fragment>
      </Box>
    </FormDialog>
  )
}

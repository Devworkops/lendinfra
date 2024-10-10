import * as React from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Toolbar,
  IconButton,
  InputLabel,
  Stack,
  Divider
} from '@mui/material'
import { FormContainer, TextFieldElement } from 'react-hook-form-mui'
import { useForm } from 'react-hook-form'
import useFormHelper from '../../../hooks/useFormHelper'
import CloseIcon from '@mui/icons-material/Close'
import { forwardRef, useImperativeHandle } from 'react'
import useApi from '../../../hooks/useApi'
import { useSnackbar } from 'notistack'
import { type Workflowstep, NodeType, StepType } from '../../../interfaces/IWorkflowstep'
import { type DataModel } from '../../../interfaces/IDataModel'
import AddCriterias from './AddCriterias'

const AddNewAssignment = forwardRef((props: {
  open: boolean
  workflowId: string
  onCreateAssignmentNode?: (nodeType: string, data: Workflowstep) => void
  source?: string
  dataModels: DataModel[]
}, ref) => {

    const [open, setOpen] = React.useState(props.open)
    const [parseError] = useFormHelper()
    const { enqueueSnackbar } = useSnackbar()
    const [, addWorkflowstep,] = useApi<Workflowstep>()
    const operators = [
        { "label": "Equals", "id": "equals" },
    ]
   
    const { control } = useForm<Workflowstep>({
        defaultValues: {
            id: '',
            label: '',
            name: '',
            description: '',
            inputValues: [
                {
                    variable: "",
                    operator: "",
                    value: ""
                },

      ]
    }
  })

    const onSubmit = async (data: Workflowstep) => {
        data.type = StepType.logic;
        data.workflowId = props.workflowId;
        if (props.source != undefined && props.source != null)
        {
            data.dependsOn = props.source
        }
        props.onCreateAssignmentNode && props.onCreateAssignmentNode(NodeType.assignment, data);
        setOpen(false);
    };

  useImperativeHandle(ref, () => ({
    openForm () {
      setOpen(true)
    }
  }))

  return (
        <>
            <Dialog open={open}>
                <DialogTitle sx={{ padding: '8px 0px' }}>
                    <Toolbar sx={{ padding: '0px' }}>
                        <Typography variant="h4" sx={{ flexGrow: 1 }}>
                            New Assignment
                        </Typography>
                        <IconButton
                            color="inherit"
                            size="small"
                            onClick={() => { setOpen(false) }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </DialogTitle>
                <Divider></Divider>
                <DialogContent>
                    <Box>
                        <FormContainer onSuccess={onSubmit}>
                            <Grid container spacing={2} >
                                <Grid item xs={12} md={6}>
                                    <InputLabel sx={{ padding: '5px 0px' }}>Label</InputLabel>
                                    <TextFieldElement
                                        required
                                        name={'label'}
                                        size="small"
                                        placeholder="Label"
                                        fullWidth
                                        parseError={parseError}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <InputLabel sx={{ padding: '5px 0px' }}>Name</InputLabel>
                                    <TextFieldElement
                                        required
                                        name={'name'}
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
                            </Grid>
                            <Divider sx={{ marginBottom: '10px', marginTop: '20px' }}></Divider>
                            <Typography variant="h6" >Set Variable Values </Typography>
                            <div>
                                {props.dataModels && <AddCriterias dataModels={props.dataModels} isConditional={false} workflowId={props.workflowId} buttonText={'Add Assignments'}/>}
                            </div>
                            <Divider sx={{ marginBottom: '20px', paddingTop: '20px' }}></Divider>
                            <Grid container spacing={2} >
                                <Grid item xs={12}>
                                    <Stack direction='row' sx={{ justifyContent: 'right' }}>
                                        <Button sx={{ borderRadius: '40px' }} variant="contained" type={'submit'}>Save</Button>
                                        <Button sx={{ borderRadius: '40px' }} onClick={() => { setOpen(false) }}>Cancel</Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </FormContainer>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
  )
})

export default AddNewAssignment

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
import { type Workflowstep, NodeType, StepType } from '../../../interfaces/IWorkflowstep'
import { type DataModel } from '../../../interfaces/IDataModel'
import AddCriterias from './AddCriterias'

const AddNewDecision = forwardRef((props: {
    open: boolean
    workflowId: string
    onCreateDecisionNode?: (nodeType: string, data: Workflowstep) => void
    source?: string
    dataModels: DataModel[],
    defaultData?: Workflowstep,
    onEditNode?: (data: any, nodeId: string) => void
    nodeId?: string
}, ref) => {
    const { defaultData } = props
    const [open, setOpen] = React.useState(props.open)
    const [parseError] = useFormHelper()
    const conditions = [
        { label: 'All conditions are met (AND)', id: 'and' },
        { label: 'Either of the condition met (OR)', id: 'or' }
    ]

    const formContext = useForm<Workflowstep>({
        defaultValues: defaultData ? defaultData : {
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
            ],
            condition: ''
        },
    });

    const onSubmit = async (data: Workflowstep) => {
        data?.inputValues?.map((inputValue: any) => {
            if(inputValue?.variable?.['type'] === 'boolean'){
                inputValue.value = inputValue.value == 'true';
            }
        })
        data.type = StepType.logic;
        data.workflowId = props.workflowId;
        if (props.source != undefined && props.source != null) { data.dependsOn = props.source }
        if (props.onCreateDecisionNode)
            props.onCreateDecisionNode(NodeType.decision, data);
        if (props.onEditNode)
            props.onEditNode(data, props.nodeId ? props.nodeId : '')
        setOpen(false);
    };


    useImperativeHandle(ref, () => ({
        openForm() {
            setOpen(true)
        }
    }))

    return (
        <>
            <Dialog open={open} fullWidth={true} maxWidth={'lg'}>
                <DialogTitle sx={{ padding: '8px 0px' }}>
                    <Toolbar sx={{ padding: '0px' }}>
                        <Typography variant="h4" sx={{ flexGrow: 1 }}>
                            New Decision
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
                        <FormContainer onSuccess={onSubmit} formContext={formContext}>
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
                                <Grid item xs={12} >
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
                            <Divider sx={{ marginBottom: '20px', paddingTop: '20px' }}></Divider>
                            <Typography sx={{ marginBottom: '20px' }} variant="h6" >Set Criterias </Typography>
                            <div>
                                {props.dataModels &&
                                    <AddCriterias dataModels={props.dataModels} conditions={conditions} isConditional={true} workflowId={props.workflowId} buttonText={'Add Conditions'} isResource={true} />
                                }
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

export default AddNewDecision

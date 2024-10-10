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
    Divider,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material'
import { FormContainer, SelectElement, TextFieldElement } from 'react-hook-form-mui'
import { useForm } from 'react-hook-form'
import useFormHelper from '../../../hooks/useFormHelper'
import CloseIcon from '@mui/icons-material/Close'
import { forwardRef, useImperativeHandle } from 'react'
import { type Workflowstep, NodeType, StepType } from '../../../interfaces/IWorkflowstep'
import { type DataModel } from '../../../interfaces/IDataModel'
import AddCriterias from './AddCriterias'
import { Workflow } from '../../../interfaces/IWorkflow'
import useApi from '../../../hooks/useApi'
import { useSnackbar } from 'notistack'

const AddUpdateRecord = forwardRef((props: {
    open: boolean
    workflowId: string
    onUpdateRecordNode?: (nodeType: string, data: Workflowstep) => void
    source?: string
    dataModels: DataModel[],
    defaultData?: Workflowstep,
    onEditNode?: (data: any, nodeId: string) => void
    nodeId?: string
}, ref) => {

    const [parseError] = useFormHelper()
    const { enqueueSnackbar } = useSnackbar();
    const [howToSetRecordsFields, setHowToSetRecordsFields] = React.useState("Use the selected record that triggered the flow");
    const [value, setValue] = React.useState("");
    const [getWorkflow, , ,] = useApi<Workflow>();
    const [workflowObject, setWorkflowObject] = React.useState("")
    const { open, workflowId, onUpdateRecordNode, source, onEditNode, dataModels, defaultData } = props;
    const [isOpen, setIsOpen] = React.useState(open)

    const conditions = [
        { label: 'None --- Always Update Record', id: 'none' },
        { label: 'All conditions are met (AND)', id: 'and' },
        { label: 'Either of the condition met (OR)', id: 'or' }
    ]

    const formContext = useForm<Workflowstep>({
        defaultValues: defaultData ? defaultData : {
            id: '',
            label: '',
            name: '',
            description: '',
            setRecordFields: '',
            condition: '',
            assignmentValues: [
                {
                    variable: "",
                    operator: "",
                    value: ""
                },
            ],
            inputValues: [
                {
                    variable: "",
                    operator: "",
                    value: ""
                },
            ],
            record: ''
        }
    })

    React.useEffect(() => {
        const response = getWorkflow(`api/workflow/` + workflowId).then((response) => {
            if (response.data.errors) {
                enqueueSnackbar(response.data.errors[0].message, {
                    variant: 'error'
                });
            }
            else {
                setWorkflowObject(response.data.object)
            }
        })
    }, [])

    const getObjects = (objectName: string) => {
        let objects: {
            id: string, label: any, key: string
        }[] = [];
        if (objectName != 'all') {
            const selectedObject = dataModels.filter(function (item) {
                return item.name === workflowObject;
            });
            if (selectedObject != undefined && selectedObject != null) {
                objects.push({ id: selectedObject[0].id, label: selectedObject[0].name, key: selectedObject[0].name })
            }
        }
        else {
            dataModels.forEach(element => {
                objects.push({ id: element.id, label: element.name, key: element.name })
            });
        }
        return objects
    }

    const handleHowToSetRecordsFields = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHowToSetRecordsFields((event.target as HTMLInputElement).value)
    }

    const setRecord = (event: any) => {
        setValue(event)
    }

    const onSubmit = async (data: Workflowstep) => {
        data.type = StepType.data;
        data.workflowId = workflowId;
        if (source != undefined && source != null) {
            data.dependsOn = source
        }
        data.setRecordFields = howToSetRecordsFields
        if (onUpdateRecordNode)
            onUpdateRecordNode(NodeType.updateRecord, data);
        if (onEditNode)
            onEditNode(data, props.nodeId ? props.nodeId : '')
        setIsOpen(false);
    };

    useImperativeHandle(ref, () => ({
        openForm() {
            setIsOpen(true)
        }
    }))

    return (
        <>
            <Dialog open={isOpen} fullWidth={true} maxWidth={'lg'}>
                <DialogTitle sx={{ padding: '8px 0px' }}>
                    <Toolbar sx={{ padding: '0px' }}>
                        <Typography variant="h4" sx={{ flexGrow: 1 }}>
                            New Update Records
                        </Typography>
                        <IconButton
                            color="inherit"
                            size="small"
                            onClick={() => { setIsOpen(false) }}
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
                            <Grid container spacing={2} sx={{ maxWidth: '100%', marginBottom: '20px' }} columns={12} >
                                <Grid item xs={12} sx={{ display: 'flex' }}>
                                    <FormControl>
                                        <FormLabel sx={{ marginBottom: '8px', fontWeight: '700', color: 'black' }} required id="#records-to-create-radio-button-form">How to Find Records to Update and Set Their Values</FormLabel>
                                        <RadioGroup
                                            row
                                            name="how-to-set-records-radio-button-group"
                                            value={howToSetRecordsFields}
                                            onChange={handleHowToSetRecordsFields}
                                        >
                                            <FormControlLabel value="Use the selected record that triggered the flow" control={<Radio sx={{ padding: '1px', marginLeft: '10px' }} />} label="Use the selected record that triggered the flow" />
                                            {/* Will implement other option based on requirement */}
                                            {/* <FormControlLabel value="Update records related to the selected record that triggered the flow" control={<Radio sx={{ padding: '1px', marginLeft: '10px' }} />} label="Update records related to the selected record that triggered the flow" />
                                            <FormControlLabel value="Use the IDs and all field values from a record or record collection" control={<Radio sx={{ padding: '1px', marginLeft: '10px' }} />} label="Use the IDs and all field values from a record or record collection" /> 
                                            <FormControlLabel value="Specify conditions to identify records, and set fields individually" control={<Radio sx={{ padding: '1px', marginLeft: '10px' }} />} label="Specify conditions to identify records, and set fields individually" /> */}
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            {howToSetRecordsFields === "Use the selected record that triggered the flow" ?
                                <>
                                    {/* Will enhance conditional based functionality later */}
                                    {/* <Divider sx={{ marginBottom: '10px' }}></Divider>
                                    <Typography sx={{ marginBottom: '10px' }} variant="h6">Set Conditions </Typography>
                                    <div>
                                        {dataModels &&
                                        <AddCriterias dataModels={dataModels} conditions={conditions} isConditional={true} workflowId={workflowId} buttonText={'Add Conditions'} fieldToWatch={'inputValues'}/>}
                                    </div> */}
                                    <Divider sx={{ marginBottom: '10px', marginTop: '20px' }}></Divider>
                                    <Typography sx={{ marginBottom: '10px' }} variant="h6">Set Field Values for the Selected Record</Typography>
                                    <AddCriterias dataModels={dataModels} isConditional={false} workflowId={workflowId} buttonText={'Add Fields'} isResource={false} fieldToWatch={'assignmentValues'} isAssignment={true} type='update' />
                                </>
                                : <>
                                    <Divider sx={{ marginBottom: '10px' }}></Divider>
                                    <Typography variant="h6">Select Record</Typography>
                                    <Grid container spacing={2} sx={{ maxWidth: '100%', marginBottom: '20px', marginTop: '1px' }} columns={12}>
                                        <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex' }}>
                                            <SelectElement required label={'Record'} name={'record'} value={value} onChange={event => setRecord(event)} parseError={parseError} fullWidth
                                                options={(howToSetRecordsFields != 'Specify conditions to identify records, and set fields individually'
                                                    ? getObjects(workflowObject) : getObjects('all')).map(option => option)} size="small" />
                                            <br />
                                        </Grid>
                                    </Grid>
                                    {value &&
                                        <>
                                            {/* Will enhance conditional based functionality later */}
                                            {/* <Divider sx={{ marginBottom: '10px' }}></Divider>
                                                <Typography sx={{ marginBottom: '10px' }} variant="h6">Set Conditions </Typography>
                                                <div>
                                                    {dataModels &&
                                                    <AddCriterias dataModels={dataModels} conditions={conditions} isConditional={true} workflowId={workflowId} buttonText={'Add Conditions'} fieldToWatch={'inputValues'} record={value}/>}
                                                </div> */}
                                            <Divider sx={{ marginBottom: '10px', marginTop: '20px' }}></Divider>
                                            <Typography sx={{ marginBottom: '10px' }} variant="h6">Set Field Values for the Selected Record</Typography>
                                            <AddCriterias dataModels={dataModels} isConditional={false} workflowId={workflowId} buttonText={'Add Fields'} isResource={false} fieldToWatch={'assignmentValues'} record={value} type='update' />
                                        </>
                                    }
                                </>
                            }
                            <Divider sx={{ marginBottom: '20px', paddingTop: '20px' }}></Divider>
                            <Grid container spacing={2} >
                                <Grid item xs={12}>
                                    <Stack direction='row' sx={{ justifyContent: 'right' }}>
                                        <Button sx={{ borderRadius: '40px' }} variant="contained" type={'submit'}>Save</Button>
                                        <Button sx={{ borderRadius: '40px' }} onClick={() => { setIsOpen(false) }}>Cancel</Button>
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

export default AddUpdateRecord

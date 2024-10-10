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
import { AutocompleteElement, FormContainer, SelectElement, TextFieldElement } from 'react-hook-form-mui'
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

const AddDeleteRecord = forwardRef((props: {
    open: boolean
    workflowId: string
    onDeleteRecordNode?: (nodeType: string, data: Workflowstep) => void
    source?: string
    dataModels: DataModel[]
}, ref) => {

    const [parseError] = useFormHelper()
    const { enqueueSnackbar } = useSnackbar();
    const [recordsToDelete, setRecordsToDelete] = React.useState("Use the IDs stored in a record variable or record collection variable");
    const [value, setValue] = React.useState("");
    const [getWorkflow, , ,] = useApi<Workflow>();
    const [workflowObject, setWorkflowObject] = React.useState("")
    const { open, workflowId, onDeleteRecordNode, source, dataModels } = props;
    const [isOpen, setIsOpen] = React.useState(open)

    const conditions = [
        { label: 'None --- Get All Selected Records', id: 'none' },
        { label: 'All conditions are met (AND)', id: 'and' },
        { label: 'Either of the condition met (OR)', id: 'or' }
    ]

    const { control } = useForm<Workflowstep>({
        defaultValues: {
            id: '',
            label: '',
            name: '',
            description: '',
            record: '',
            condition: '',
            inputValues: [
                {
                    variable: "",
                    operator: "",
                    value: ""
                },
            ],
            recordsToCreateOrStore: ''
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
            if (selectedObject[0] != undefined) {
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

    const handleRecordsToDelete = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRecordsToDelete((event.target as HTMLInputElement).value)
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
        data.recordsToCreateOrStore = recordsToDelete
        onDeleteRecordNode && onDeleteRecordNode(NodeType.deleteRecord, data);
        setIsOpen(false);
    };

    useImperativeHandle(ref, () => ({
        openForm() {
            setIsOpen(true)
        }
    }))

    return (
        <>
            <Dialog open={isOpen}>
                <DialogTitle sx={{ padding: '8px 0px' }}>
                    <Toolbar sx={{ padding: '0px' }}>
                        <Typography variant="h4" sx={{ flexGrow: 1 }}>
                            New Get Records
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
                            <Grid container spacing={2} sx={{ maxWidth: '100%', marginBottom: '20px' }} columns={12} >
                                <Grid item xs={12} sx={{ display: 'flex' }}>
                                    <FormControl>
                                        <FormLabel sx={{ marginBottom: '8px', fontWeight: '700', color: 'black' }} required id="#records-to-delete-radio-button-form">How to Find Records to Update and Set Their Values</FormLabel>
                                        <RadioGroup
                                            row
                                            name="records-to-delete-radio-button-group"
                                            value={recordsToDelete}
                                            onChange={handleRecordsToDelete}
                                        >
                                            <FormControlLabel value="Use the IDs stored in a record variable or record collection variable" control={<Radio sx={{ padding: '1px', marginLeft: '10px' }} />} label="Use the IDs stored in a record variable or record collection variable" />
                                            <FormControlLabel value="Specify conditions" control={<Radio sx={{ padding: '1px', marginLeft: '10px' }} />} label="Specify conditions" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            {recordsToDelete &&
                                <>
                                    <Divider sx={{ marginBottom: '10px', marginTop: '20px' }}></Divider>
                                    <Typography variant="h6">Delete Records of This Object</Typography>
                                    <Grid container spacing={2} sx={{ maxWidth: '100%', marginTop: '1px' }} columns={12}>
                                        <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex' }}>
                                            <SelectElement required label={'Record'} name={'record'} value={value} onChange={event => setRecord(event)} parseError={parseError} fullWidth
                                                options={(recordsToDelete === "Specify conditions" ? getObjects('all') : getObjects(value)).map(option => option)} size="small" />
                                            <br />
                                        </Grid>
                                    </Grid></>}
                            { recordsToDelete === "Specify conditions" &&
                                <>
                                    <Divider sx={{ marginBottom: '10px', marginTop: '20px' }}></Divider>
                                    <Typography variant="h6" sx={{ marginBottom: '5px' }}>Filter Account Records</Typography>
                                    <div>
                                        {dataModels &&
                                            <AddCriterias dataModels={dataModels} conditions={conditions} isConditional={true} workflowId={workflowId} buttonText={'Add Condition'} record={value} />}
                                    </div>
                                </>   
                            }
                            <Divider sx={{ marginBottom: '20px', paddingTop: '10px' }}></Divider>
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

export default AddDeleteRecord

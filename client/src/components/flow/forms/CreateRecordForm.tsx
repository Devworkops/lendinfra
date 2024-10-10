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
import { Controller, useForm, useWatch } from 'react-hook-form'
import useFormHelper from '../../../hooks/useFormHelper'
import CloseIcon from '@mui/icons-material/Close'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import useApi from '../../../hooks/useApi'
import { useSnackbar } from 'notistack'
import { type Workflowstep, NodeType, StepType } from '../../../interfaces/IWorkflowstep'
import { type DataModel } from '../../../interfaces/IDataModel'
import { Workflow } from '../../../interfaces/IWorkflow'
import AddCriterias from './AddCriterias'


const AddCreateRecord = forwardRef((props: {
    open: boolean
    workflowId: string
    onCreateRecordNode?: (nodeType: string, data: Workflowstep) => void
    source?: string
    dataModels: DataModel[]
}, ref) => {
    const [parseError] = useFormHelper()
    const { enqueueSnackbar } = useSnackbar();
    const [recordsToCreateValue, setRecordsToCreateValue] = React.useState("One");
    const [howToSetRecordsFields, setHowToSetRecordsFields] = React.useState("Use all values from a record");
    const [getWorkflow, , ,] = useApi<Workflow>();
    const [workflowObject, setWorkflowObject] = React.useState("")
    const [value, setValue] = React.useState("");
    const { open, workflowId, onCreateRecordNode, source, dataModels } = props;
    const [isOpen, setIsOpen] = React.useState(open)
    const formContext = useForm<Workflowstep>({
        defaultValues: {
            id: '',
            label: '',
            name: '',
            description: '',
            recordsToCreateOrStore: '',
            setRecordFields: '',
            record: ''
        }
    })

    useEffect(() => {
        const response = getWorkflow(`api/workflow/${workflowId}`).then((response) => {
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
                return item.name === objectName;
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

    const handleRecordsToCreate = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRecordsToCreateValue((event.target as HTMLInputElement).value)
    }

    const setRecord = (event: any) => {
        setValue(event)
    }

    const handleHowToSetRecordsFields = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHowToSetRecordsFields((event.target as HTMLInputElement).value)
    }

    const onSubmit = async (data: Workflowstep) => {
        data.type = StepType.data;
        data.workflowId = workflowId;
        if (source != undefined && source != null) {
            data.dependsOn = source
        }
        data.recordsToCreateOrStore = recordsToCreateValue
        data.setRecordFields = howToSetRecordsFields
        onCreateRecordNode && onCreateRecordNode(NodeType.createRecord, data);
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
                            New Create Records
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
                            <Grid container spacing={2} sx={{ maxWidth: '100%'}} columns={12} >
                                <Grid item xs={12} sx={{ display: 'flex' }}>
                                    <FormControl>
                                        <FormLabel id="#records-to-create-radio-button-form" sx={{ fontWeight: '700', color: 'black' }}>How Many Records to Create</FormLabel>
                                        <RadioGroup
                                            row
                                            name="#records-to-create-radio-button-group"
                                            value={recordsToCreateValue}
                                            onChange={handleRecordsToCreate}
                                        >
                                            <FormControlLabel value="One" control={<Radio />} label="One" />
                                            <FormControlLabel value="Multiple" control={<Radio />} label="Multiple" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                {recordsToCreateValue === "One" &&
                                    <Grid item xs={12} sx={{ display: 'flex' }}>
                                        <FormControl>
                                            <FormLabel id="#records-to-create-radio-button-form" sx={{ fontWeight: '700', color: 'black' }}>How to Set the Record Fields</FormLabel>
                                            <RadioGroup
                                                row
                                                name="how-to-set-records-radio-button-group"
                                                value={howToSetRecordsFields}
                                                onChange={handleHowToSetRecordsFields}
                                            >
                                                <FormControlLabel value="Use all values from a record" control={<Radio sx={{ padding: '2px', marginLeft: '10px' }} />} label="Use all values from a record" />
                                                <FormControlLabel value="Use separate resources, and literal values" control={<Radio sx={{ padding: '2px', marginLeft: '10px' }} />} label="Use separate resources, and literal values" />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>}
                            </Grid>
                            {recordsToCreateValue &&
                                <>
                                    <Divider sx={{ marginBottom: '10px', marginTop: '20px' }}></Divider>
                                    <Typography sx={{ marginBottom: '10px' }} variant="h6">Create a Record from These Values</Typography>
                                    <Grid container spacing={2} sx={{ maxWidth: '100%', marginBottom: '10px' }} columns={12}>
                                        <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex' }}>
                                            <SelectElement required label={'Record'} name={'record'} value={value} onChange={event => setRecord(event)} parseError={parseError} fullWidth 
                                                options={(howToSetRecordsFields === 'Use all values from a record' || recordsToCreateValue === 'Multiple'
                                                ? getObjects(workflowObject) : getObjects('all')).map(option => option)} size="small" />
                                            <br />
                                        </Grid>
                                    </Grid></>}
                            {(howToSetRecordsFields === 'Use separate resources, and literal values' && recordsToCreateValue === 'One' && value!= "") &&
                                <>
                                    <Divider sx={{ marginBottom: '10px', marginTop: '20px' }}></Divider>
                                    <Typography sx={{ marginBottom: '10px' }} variant="h6">Set Field Values for the Account</Typography>
                                    <AddCriterias dataModels={dataModels} isConditional={false} workflowId={workflowId} buttonText={'Add Fields'} isResource={false} record={value}/>
                                </>
                            }
                            <Divider sx={{ marginBottom: '20px', marginTop: '20px'}}></Divider>
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

export default AddCreateRecord

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

const AddGetRecord = forwardRef((props: {
    open: boolean
    workflowId: string
    onGetRecordNode?: (nodeType: string, data: Workflowstep) => void
    source?: string
    dataModels: DataModel[]
}, ref) => {

    const [parseError] = useFormHelper()
    const { enqueueSnackbar } = useSnackbar();
    const [recordsToStore, setRecordsToStore] = React.useState("Only the first record");
    const [value, setValue] = React.useState("");
    const [sortValue, setSortValue] = React.useState("asc");
    const [getWorkflow, , ,] = useApi<Workflow>();
    const [workflowObject, setWorkflowObject] = React.useState("")
    const { open, workflowId, onGetRecordNode, source, dataModels } = props;
    const [isOpen, setIsOpen] = React.useState(open)

    const sortOrders = [
        { label: 'Ascending', id: 'asc' },
        { label: 'Descending', id: 'des' },
        { label: 'Not sorted', id: 'nos' },
    ]
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
            direction:'',
            directionField:'',
            recordsToCreateOrStore:''
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
    const getObjectAttributes = (workflowObject: string | undefined) => {
        let attributes: {
            id: string, label: any, key: string
        }[] = [];
        const dataModel: any[] = dataModels.filter(function (item) {
            return item.name === workflowObject || item.id === workflowObject;
        });
        dataModel.forEach(element => {
            if (element.properties) {
                Object.keys(element?.properties).map((item) => {
                    attributes.push({ id: element.id, label: item, key: element.name })
                })
            }
        });
        return attributes
    }

    const handleRecordsToStore = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRecordsToStore((event.target as HTMLInputElement).value)
    }

    const setRecord = (event:any) => {
        setValue(event)
    }
  
    const onSubmit = async (data: Workflowstep) => {
        data.type = StepType.data;
        data.workflowId = workflowId;
        if (source != undefined && source != null) {
            data.dependsOn = source
        }
        data.recordsToCreateOrStore = recordsToStore
        onGetRecordNode && onGetRecordNode(NodeType.getRecord, data);
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
                            <Typography variant="h6">Get Records of This Object</Typography>
                                <Grid container spacing={2} sx={{ maxWidth: '100%', marginTop: '1px'}} columns={12}>
                                    <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex' }}>
                                        <SelectElement required label={'Record'} name={'record'} value={value} onChange={event => setRecord(event)} parseError={parseError} fullWidth 
                                        options={(getObjects('all')).map(option => option)} size="small" />
                                        <br />
                                    </Grid>
                                </Grid>
                            { value &&
                                <>
                                <Divider sx={{ marginBottom: '10px', marginTop: '20px' }}></Divider>
                                <Typography variant="h6" sx={{ marginBottom: '5px'}}>Filter Account Records</Typography>
                                <div>
                                    {dataModels &&
                                        <AddCriterias dataModels={dataModels} conditions={conditions} isConditional={true} workflowId={workflowId} buttonText={'Add Condition'} record={value}/>}
                                </div>
                                <Divider sx={{ marginBottom: '10px', marginTop: '20px' }}></Divider>
                                <Typography variant="h6">Sort Records</Typography>
                                <Grid container spacing={2} sx={{ maxWidth: '100%', marginBottom: '20px', marginTop: '1px' }} columns={12}>
                                    <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex' }}>
                                        <SelectElement required label={'Sort Order'} name={'direction'}  parseError={parseError} fullWidth 
                                        options={sortOrders} size="small" />
                                        <br />
                                    </Grid>
                                    {sortValue != 'nos' && <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex' }}>
                                        <AutocompleteElement label='Sort By' required name={`directionField`} textFieldProps={{size: 'small'}}
                                        autocompleteProps={{
                                            disablePortal: true,
                                        }}
                                        options={getObjectAttributes(value).map(option => option)}
                                        />  
                                        <br />
                                    </Grid>}
                                </Grid>
                                <Divider sx={{ marginBottom: '10px', marginTop: '20px' }}></Divider>
                                <Grid container spacing={2} sx={{ maxWidth: '100%'}} columns={12} >
                                    <Grid item xs={12} sx={{ display: 'flex' }}>
                                        <FormControl>
                                            <FormLabel sx={{ marginBottom: '8px', fontWeight: '700', color: 'black' }} required id="#records-to-store-radio-button-form">How many records to store</FormLabel>
                                            <RadioGroup
                                                row
                                                name="records-to-store-radio-button-group"
                                                value={recordsToStore}
                                                onChange={handleRecordsToStore}
                                            >
                                                <FormControlLabel value="Only the first record" control={<Radio sx={{ padding: '2px', marginLeft: '10px' }} />} label="Only the first record" />
                                                <FormControlLabel value="All records" control={<Radio sx={{ padding: '2px', marginLeft: '10px' }} />} label="All records" />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                </Grid></>
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

export default AddGetRecord

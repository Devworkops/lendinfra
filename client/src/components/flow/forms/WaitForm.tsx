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
} from "@mui/material";
import { FormContainer, SelectElement, TextFieldElement } from "react-hook-form-mui";
import { useForm } from "react-hook-form";
import useFormHelper from "../../../hooks/useFormHelper";
import CloseIcon from '@mui/icons-material/Close';
import { forwardRef, useImperativeHandle } from "react";
import { Workflowstep, NodeType, StepType } from "../../../interfaces/IWorkflowstep";

const AddNewWait = forwardRef((props: {
    open: boolean;
    workflowId: string;
    onCreateWaitNode?: (nodeType: string, data: Workflowstep) => void
    source: string
    defaultData?: Workflowstep,
    onEditNode?: (data: any, nodeId: string) => void
    nodeId?: string
}, ref) => {
    const {defaultData, workflowId, source, onCreateWaitNode, onEditNode, nodeId} = props
    const [open, setOpen] = React.useState(props.open)
    const resumeactions = [{"label": "Once consent confirms", "id": "consent confirmation"}, {"label": "Set a timer", "id": "timer"}];
    const [selectedAction, setSelectedAction] = React.useState("");
    const formContext = useForm<Workflowstep>({
        defaultValues: defaultData ? defaultData :{
            id: '',
            label: '',
            name: '',
            description: '',
            apiName:''
        }
    })

    React.useEffect(() => {
        const label = (resumeactions.find(action => action.id === formContext.getValues().apiName)?.label || '');
        setSelectedAction(label);
    }, [ open ])
    
    const [parseError] = useFormHelper()

    const onSubmit = (data: Workflowstep) => {
        data.type = StepType.interaction
        data.workflowId = workflowId;
        if (source != undefined && source != null){
            data.dependsOn = source}
        if (onCreateWaitNode)
        onCreateWaitNode(NodeType.wait, data)
        if (onEditNode)
            onEditNode(data, nodeId ? nodeId : '')
        setOpen(false)
    }

    const handleActionChange = (event: any) => {
        const action = resumeactions.find(action => action.id === event) || { label: '', id: '' };
        setSelectedAction(action.label)
    }

    useImperativeHandle(ref, () => ({
        openForm() {
            setOpen(true)
        }
    }))

    return (
        <>
            <Dialog open={open}>
                <DialogTitle sx={{ padding: '8px 0px' }}>
                    <Toolbar sx={{ padding: '0px' }}>
                        <Typography variant="h4" sx={{ flexGrow: 1 }}>
                            New Wait
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
                        <FormContainer formContext={formContext} onSuccess={onSubmit}>
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
                                    <InputLabel sx={{ padding: '5px 0px' }}>Resume</InputLabel>
                                    <SelectElement fullWidth required name={'apiName'} parseError={parseError}
                                        options={resumeactions} value={selectedAction} size="small" onChange={handleActionChange} />
                                    {selectedAction == 'Set a timer' && <>
                                        <br /><br/>
                                        <TextFieldElement 
                                            type='number' 
                                            size="small" 
                                            required
                                            label="Time in minutes" 
                                            name='timer'/>
                                    </>}
                                </Grid>
                                <Grid item xs={12} md={12}>
                                    <InputLabel sx={{ padding: '5px 0px' }}>Description</InputLabel>
                                    <TextFieldElement
                                        required
                                        name={'description'}
                                        size="small"
                                        placeholder="Description"
                                        fullWidth
                                        parseError={parseError}
                                    />
                                </Grid>
                            </Grid>
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

export default AddNewWait

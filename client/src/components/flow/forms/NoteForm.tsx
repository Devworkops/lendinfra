import * as React from 'react'
import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
    Toolbar,
    IconButton,
    InputLabel,
    Divider,
    Stack,
    Button
} from '@mui/material'
import { FormContainer, TextFieldElement } from 'react-hook-form-mui'
import { useForm } from 'react-hook-form'
import useFormHelper from '../../../hooks/useFormHelper'
import CloseIcon from '@mui/icons-material/Close'
import { forwardRef, useImperativeHandle } from 'react'
import { type Workflowstep, NodeType, StepType } from '../../../interfaces/IWorkflowstep'
import { type DataModel } from '../../../interfaces/IDataModel'
import { Workflow } from '../../../interfaces/IWorkflow'
import useApi from '../../../hooks/useApi'
import { useSnackbar } from 'notistack'

const AddNote = forwardRef((props: {
    open: boolean
    workflowId: string
    onCreateNoteNode?: (nodeType: string, data: Workflowstep) => void
    source?: string
    defaultData?: Workflowstep,
    onEditNode?: (data: any, nodeId: string) => void
    nodeId?: string
}, ref) => {
    const {defaultData, workflowId, source, onCreateNoteNode, onEditNode, nodeId, open} = props
    const [parseError] = useFormHelper()
    const { enqueueSnackbar } = useSnackbar();
    const [isOpen, setIsOpen] = React.useState(open)
    
    const formContext = useForm<Workflowstep>({
        defaultValues: defaultData ? defaultData :{
            id: '',
            label: '',
            name: '',
            description: '',
        }
    }) 

    useImperativeHandle(ref, () => ({
        openForm() {
            setIsOpen(true)
        }
    }))

    const onSubmit = (data: Workflowstep) => {
        data.type = StepType.data
        data.workflowId = workflowId;
        if (source != undefined && source != null){
            data.dependsOn = source}
        if (onCreateNoteNode)
            onCreateNoteNode(NodeType.note, data)
        if (onEditNode)
            onEditNode(data, nodeId ? nodeId : '')
        setIsOpen(false)
    }

    return (
        <>
            <Dialog open={isOpen} fullWidth={true} maxWidth={'md'}>
                <DialogTitle sx={{ padding: '8px 0px' }}>
                    <Toolbar sx={{ padding: '0px' }}>
                        <Typography variant="h4" sx={{ flexGrow: 1 }}>
                            New Notes
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
                            <Grid item xs={12}>
                                <InputLabel sx={{ padding: '5px 0px' }}>Note</InputLabel>
                                <TextFieldElement
                                    required
                                    name='comment'
                                    size="small"
                                    placeholder="Note"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    parseError={parseError}
                                />
                            </Grid>
                            <Divider sx={{ marginBottom: '10px', marginTop: '20px' }}></Divider>
                            <Grid container spacing={2} >
                                <Grid item xs={12}>
                                    <Stack direction='row' sx={{ justifyContent: 'right' }}>
                                        <Button sx={{ borderRadius: '40px' }} variant="contained" type={'submit'}>Save</Button>
                                        <Button sx={{ borderRadius: '40px' }} type="button" onClick={() => { setIsOpen(false) }}>Cancel</Button>
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

export default AddNote

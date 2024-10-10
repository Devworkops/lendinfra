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
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Workflowstep, NodeType, StepType } from "../../../interfaces/IWorkflowstep";
import useApi from '../../../hooks/useApi';
import { useSnackbar } from 'notistack';
import { ActionAttrs } from '../../../interfaces/IIntegration';
import DataRecordAutoComplete from '../../common/DataRecordAutoComplete';
import { DataRecord } from '../../../interfaces/IDataRecord';

const apiParamsValues: { id: string | undefined; objectName?: string; label?: string | undefined; value?: any }[] = []
const AddNewAction = forwardRef((props: {
    open: boolean;
    workflowId: string;
    onCreateActionNode?: (nodeType: string, data: Workflowstep) => void
    source: string,
    defaultData?: Workflowstep,
    onEditNode?: (data: any, nodeId: string) => void
    nodeId?: string
}, ref) => {
    const { defaultData } = props
    const [open, setOpen] = React.useState(props.open)
    const { enqueueSnackbar } = useSnackbar();
    const [getApiActionList] = useApi<any>();
    const [actions, setActions] = React.useState<ActionAttrs[]>([]);
    const [selectedAction, setSelectedAction] = React.useState<ActionAttrs>();
    const [selectedRecord, setSelectedRecord] = React.useState<DataRecord[]>([]);
    const [apiParamsList, setapiParamsList] = React.useState<{ id: string | undefined; objectName?: string | undefined, required?: boolean; label: string }[]>([])
    useEffect(() => {
        if (open)
            getApiActionList(`api/integration/apis/`).then((response) => {
                if (response.data.errors) {
                    enqueueSnackbar(response.data.errors[0].message, {
                        variant: "error",
                    });
                } else {
                    if (response.data)
                        setActions(response.data);
                }
            });
    }, [open]);

    const formContext = useForm<Workflowstep>({
        defaultValues: defaultData ? defaultData : {
            id: '',
            label: '',
            name: '',
            description: '',
            apiName: '',
            apiParams: []
        }
    })
    const [parseError] = useFormHelper()

    const onSubmit = (data: Workflowstep) => {
        data.type = StepType.interaction
        data.workflowId = props.workflowId;
        data.apiParams = [...apiParamsValues]
        if (props.source != undefined && props.source != null) {
            data.dependsOn = props.source
        }
        if (props.onCreateActionNode){
            props.onCreateActionNode(NodeType.action, data)
        }
        if (props.onEditNode){
            props.onEditNode(data, props.nodeId ? props.nodeId : '')
        }
        setOpen(false)
    }

    const handleActionChange = (event: any) => {
        const action = actions.reduce((found, action) => {
            if (action.id === event)
                return action
            return found
        }, { label: '', id: '' })
        setSelectedAction(action)
        updateActionParams(action);
    }

    const updateActionParams = (action: ActionAttrs) => {
        const paramsList: React.SetStateAction<{ id: string | undefined; objectName?: string | undefined; required: boolean; label: string }[]> = [];
        action?.params?.map((param) => {
            if (param.objectName) {
                if (!paramsList.find(obj => obj.objectName === param.objectName))
                    paramsList.push({ id: param.id, objectName: param.objectName, required: param.required, label: param.label })
            }
            else {
                paramsList.push({ id: param.id, objectName: '', required: param.required, label: param.label })
            }
        })
        setapiParamsList(paramsList)
    }
    const handleRecordSelection = (record: DataRecord) => {
        apiParamsValues.push({ id: record.id, objectName: record.objectName, label: record.recordId })
        setSelectedRecord([...selectedRecord, record])
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
                            New Action
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
                                    <InputLabel sx={{ padding: '5px 0px' }}>Select Api </InputLabel>
                                    <SelectElement fullWidth required name={'apiName'} parseError={parseError}
                                        options={actions} size="small" onChange={(event) => handleActionChange(event)} />
                                </Grid>
                                {apiParamsList && apiParamsList.map((param, index) => (
                                    param.objectName ?
                                        <Grid item xs={12} md={6}>
                                            <InputLabel sx={{ padding: '5px 0px' }}>Select {param.objectName} record</InputLabel>
                                            <DataRecordAutoComplete key={param.id} handleRecordChange={handleRecordSelection} intialValue={selectedRecord[index] ? selectedRecord[index] : null} objectName={param.objectName}></DataRecordAutoComplete>
                                        </Grid>
                                        :
                                        <Grid item xs={12} md={6}>
                                            {/* <TextFieldElement
                                        required={param.required}
                                        name={'value'}
                                        size="small"
                                        placeholder={param.label}
                                        fullWidth
                                        parseError={parseError}
                                    /> */}
                                        </Grid>
                                ))}
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

export default AddNewAction

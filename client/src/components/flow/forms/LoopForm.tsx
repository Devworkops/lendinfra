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
    Radio,
} from "@mui/material";
import { FormContainer, SelectElement, TextFieldElement } from "react-hook-form-mui";
import { useForm } from "react-hook-form";
import useFormHelper from "../../../hooks/useFormHelper";
import CloseIcon from '@mui/icons-material/Close';
import { forwardRef, useImperativeHandle } from "react";
import { Workflowstep, NodeType, StepType } from "../../../interfaces/IWorkflowstep";
import { useSnackbar } from 'notistack';
import useApi from "../../../hooks/useApi";

const AddNewLoop = forwardRef((props: {
    open: boolean;
    workflowId: string;
    onCreateLoopNode: (nodeType: string, data: Workflowstep) => void
    source: string
}, ref) => {

    const [open, setOpen] = React.useState(props.open);
    const [parseError] = useFormHelper();
    const { enqueueSnackbar } = useSnackbar();
    const [, addWorkflowstep,] = useApi<Workflowstep>();
    const [value, setValue] = React.useState('First item to last item');

    const formContext = useForm<Workflowstep>({
        defaultValues: {
            id: '',
            label: '',
            name: '',
            description: '',
            direction: '',
            collection: ''
        },
    });

    const onSubmit = async (data: Workflowstep) => {
        data.type = StepType.logic;
        data.workflowId = props.workflowId;
        data.dependsOn = props.source
        data.direction = value
        props.onCreateLoopNode(NodeType.loop, data);
        setOpen(false);
    };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value)
  }

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
                            New Loop
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
                                    <InputLabel sx={{ padding: '5px 0px' }}>Api Name</InputLabel>
                                    <TextFieldElement
                                        required
                                        name={'name'}
                                        size="small"
                                        placeholder="Name"
                                        fullWidth
                                        parseError={parseError}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
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
                            <Typography sx={{ marginBottom: '20px' }} variant="h6" >Select Collection Variable </Typography>
                            <Grid container spacing={2} sx={{ maxWidth: '100%', marginBottom: '20px' }} columns={12} >
                                <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex' }}>
                                    <SelectElement required label={'Collection Variable'} name={'collection'} parseError={parseError} fullWidth options={[{ id: 'global variable', label: 'global variable' }]} size="small" /><br />
                                </Grid>
                            </Grid>
                            <Divider sx={{ marginBottom: '20px' }}></Divider>
                            <Typography sx={{ marginBottom: '20px' }} variant="h6" >Specify Direction for Iterating Over Collection </Typography>
                            <Grid container spacing={2} sx={{ maxWidth: '100%', marginBottom: '20px' }} columns={12} >
                                <Grid item xs={12} sx={{ display: 'flex' }}>
                                    <FormControl>
                                        <FormLabel id="direction-radio-button-form">Direction</FormLabel>
                                        <RadioGroup
                                            row
                                            name="direction-radio-button-group"
                                            value={value}
                                            onChange={handleChange}
                                        >
                                            <FormControlLabel value="First item to last item" control={<Radio />} label="First item to last item" />
                                            <FormControlLabel value="Last item to first item" control={<Radio />} label="Last item to first item" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Divider sx={{ marginBottom: '20px' }}></Divider>
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

export default AddNewLoop

import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Dialog, DialogContent, DialogTitle, Grid, Link } from '@mui/material';
import useApi from '../../hooks/useApi';
import { useSnackbar } from 'notistack';
import { Workflowstep } from '../../interfaces/IWorkflowstep';
import { WorkflowInstance } from '../../interfaces/IWorkflow';
import { WorkflowLogDisplay } from './WorkflowLogDisplay';

export default function WorkflowRunDetail(props: any) {
    const { enqueueSnackbar } = useSnackbar()
    const { isOpen, onClose, objectName, workflowInstanceId, recordId } = props;

    const [activeStep, setActiveStep] = React.useState(0);

    const [workflowInstance, setWorkflowInstance] = React.useState<{ steps: Workflowstep[], workflowInstance: WorkflowInstance }>();
    const [getWorkflowInstance] = useApi<{ steps: Workflowstep[], workflowInstance: WorkflowInstance }>()
    const [getWorkflowResume,,,]= useApi();
    const [error, setError] = React.useState<Boolean>(false)

    React.useEffect(() => {
        let url = `api/workflow/instance/recent?object=${objectName}`

        // get the workflow instance detail
        if (workflowInstanceId) {
            url += `&workflowInstanceId=${workflowInstanceId}`
        }

        if (recordId) {
            url += `&recordId=${recordId}`
        }

        getWorkflowInstance(url).then((response) => {
            if (response.data.errors) {
                enqueueSnackbar(response.data.errors[0].message, {
                    variant: 'error'
                })
                setWorkflowInstance(undefined);
                setError(true)
            } else if (response.data) {
                setWorkflowInstance(response.data)
            }
            else {
                enqueueSnackbar('Invalid Request', {
                    variant: 'error'
                })
                setWorkflowInstance(undefined);
                setError(true)
            }
        })
    }, [])

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStep = (step: number) => () => {
        setActiveStep(step);
    };

    const parseResult = (value: any) =>{
        if(!value) return {stack: "This is older api calls where result can't be stored"}
        let parsedValue = value;
        const result = value;
        if (result.startsWith("[")){
            parsedValue = JSON.parse(value.replaceAll('\\', '').replace('["','').replace('"]',''))
        }
        if(result.startsWith("{"))
            parsedValue = JSON.parse(parsedValue);
        return parsedValue;
    }

    const handleResume =async (step: string, wsid: string) =>{
        const id = workflowInstance?.workflowInstance.workflow.id;
        const wid = workflowInstance?.workflowInstance.id;
        getWorkflowResume(`api/workflow/resume/${recordId}/${step}/${id}/${wid}/${wsid}`).then((response) => {
            console.log(response)
            if (response.status!==200) {
                enqueueSnackbar(response.statusText, {
                    variant: 'error'
                })
            } else {
                enqueueSnackbar('Workflow Resumed', {variant: 'success'})
            }
        })
    }

    return (
        <Dialog open={isOpen} onClose={() => onClose(false)} fullWidth>
            {!error ? 
            <> 
                {workflowInstance != undefined && <>
                    <DialogTitle sx={{ textAlign: 'center' }}>{workflowInstance?.workflowInstance.workflow.name}</DialogTitle>
                    <DialogContent>
                        <Grid container rowSpacing={2} columnSpacing={2} sx={{ paddingBottom: '10px', paddingTop: '10px' }} columns={12}>
                            <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Box component='div' sx={{ fontWeight: 'bold' }} >{'Description: '}</Box>
                                <Box component='div'>{workflowInstance?.workflowInstance.workflow.name}</Box>
                            </Grid>
                            <Grid item xs={6} sm={6} md={6} sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Box component='div' sx={{ fontWeight: 'bold' }} >{'Object:'}</Box>
                                <Box component='div'>{workflowInstance?.workflowInstance.workflow.object}</Box>
                            </Grid>
                            <Grid item xs={6} sm={6} md={6} sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Box component='div' sx={{ fontWeight: 'bold' }} >{'Type:'}</Box>
                                <Box component='div'>{workflowInstance?.workflowInstance.workflow.triggerType}</Box>
                            </Grid>
                            <Grid item xs={6} sm={6} md={6} sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Box component='div' sx={{ fontWeight: 'bold' }} >{'Start Date:'}</Box>
                                <Box component='div'>{String(workflowInstance?.workflowInstance.startedAt)}</Box>
                            </Grid>
                            <Grid item xs={6} sm={6} md={6} sx={{ display: 'flex', flexDirection: 'row' }}>
                                <Box component='div' sx={{ fontWeight: 'bold' }} >{'Status: '}</Box>
                                <Box component='div'>{workflowInstance?.workflowInstance.status}
                                </Box>
                            </Grid>
                        </Grid>
                        <Box sx={{ maxWidth: 400 }}>
                            <Stepper nonLinear activeStep={activeStep} orientation="vertical">
                                {workflowInstance.steps.map((step, index) => (
                                    <Step key={step.label} completed={false}>
                                        <StepLabel
                                            optional={
                                                index === workflowInstance.steps.length - 1 ? (
                                                    <Typography variant="caption">Last step</Typography>
                                                ) : null
                                            }
                                            onClick={handleStep(index)}
                                        >
                                            {/* {step.label} - {parseResult(step.result)?.stack ? 'Error' : step.status} */}
                                            {step.label} - {step.status ? step.status : 'Error'} 
                                            {(step.label !== 'Start' && step.label !== 'End') && step?.data?.stepData?.label ? `(${step.data.stepData.label})` : ''}
                                        </StepLabel>
                                        <StepContent>
                                            {step.result && <WorkflowLogDisplay type={step.type} result={step.result} inputData={step.data} />}
                                            <Box sx={{ mb: 2 }}>
                                                <div>
                                                    {index !== workflowInstance.steps.length - 1 && <Button
                                                        variant="contained"
                                                        onClick={handleNext}
                                                        sx={{ mt: 1, mr: 1 }}
                                                    >
                                                        Next
                                                    </Button>
                                                    }
                                                    <Button
                                                        disabled={index === 0}
                                                        onClick={handleBack}
                                                        sx={{ mt: 1, mr: 1 }}
                                                    >
                                                        Back
                                                    </Button>
                                                    {parseResult(step.result)?.stack && step.type !=='actionNode' &&
                                                    <Button
                                                        onClick={()=>handleResume(step.name, step.id)}
                                                        variant='outlined'
                                                        sx={{ mt: 1, mr: 1 }}
                                                    >
                                                        Resume 
                                                    </Button>
                                                    }
                                                </div>
                                            </Box>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>
                        </Box>
                    </DialogContent>
                    </>
                }                
            </>
                : <DialogContent><Box padding={'20px'}>No Record Found</Box></DialogContent>}
        </Dialog>
    );
}
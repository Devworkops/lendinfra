import { memo, type FC, useState, useEffect } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite'
import DialogScreen from '../../common/DialogScreen';
import Grid from '@mui/material/Grid'
import { Typography } from '@mui/material';
import useApi from '../../../hooks/useApi';
import { Workflow } from '../../../interfaces/IWorkflow';
import { useSnackbar } from 'notistack';

const StartNode: FC<NodeProps> = ({ id, data }) => {
  const [workflowDetails, setWorkflowDetails] = useState<Workflow>();
  const [openConfig, setOpenConfig] = useState(false);
  const [getWorkflow] = useApi<Workflow>();
  const { enqueueSnackbar } = useSnackbar();
  const openWorkflowConfig = () => {
    setOpenConfig(true)
  }

  const closeWorkflowConfig = () => {
    setOpenConfig(false)
  }
  useEffect(() => {
    if (data.workflowId !== undefined) {
      const response = getWorkflow(`api/workflow/${data.workflowId}`).then((response) => {
        if (response.data.errors) {
          enqueueSnackbar(response.data.errors[0].message, {
            variant: 'error'
          })
        } else {
          setWorkflowDetails(response.data)
        }
      })
    }
  }, [])
  return (
    <>
      <PlayCircleFilledWhiteIcon color='primary' fontSize='large' sx={{ padding: '0px' }} onClick={openWorkflowConfig}></PlayCircleFilledWhiteIcon>
      <DialogScreen open={openConfig} onClose={closeWorkflowConfig} title={'Workflow Detail'} subTitle="" width='full' customHeight='100%' >
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          spacing={{ xs: 2, sm: 0, md: 2, lg: 2 }}
        >
          <Grid item xs={6} md={6} flexDirection="column">
            <strong>Name:</strong> {workflowDetails?.name}
          </Grid>
          <Grid item xs={6} md={6} flexDirection="column">
            <strong>Description:</strong> {workflowDetails?.description}
          </Grid>
          <Grid item xs={6} md={6} flexDirection="column">
            <strong>Workflow Type:</strong> {workflowDetails?.type}
          </Grid>
          <Grid item xs={6} md={6} flexDirection="column">
            <strong>Configured Object:</strong> {workflowDetails?.object}
          </Grid>
          <Grid item xs={6} md={6} flexDirection="column">
            <strong>Trigger Type:</strong> {workflowDetails?.triggerType}
          </Grid>
          <Grid item xs={6} md={6} flexDirection="column">
            <strong>Filter Type:</strong> {workflowDetails?.filterType}
          </Grid>
          {workflowDetails?.filterConditions != undefined && 
            workflowDetails?.filterConditions.length > 0  && 
            <Grid item xs={12} md={12} flexDirection="column">
              <strong>Filter Conditions:</strong> 
              {workflowDetails?.filterConditions.map((item: { variable: any, operator: string, value: any}, index: any) => (
                <Typography>{`Condition ${index + 1}: ${item.variable?.key}.${item.variable?.path} ${item.operator} ${item.value}`}</Typography>
              ))}
          </Grid>}
        </Grid>
      </DialogScreen>
      <Handle type="source" position={Position.Bottom} id={data.label} />
    </>
  )
}
export default memo(StartNode)
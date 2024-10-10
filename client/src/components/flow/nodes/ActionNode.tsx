import { memo, type FC } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { OfflineBolt } from '@mui/icons-material'
import NodeLabel from './NodeLabel'
import { Stack, Typography } from '@mui/material'

const ActionNode: FC<NodeProps> = ({ id, data, isConnectable }) => {
  return (
    <>    
    <OfflineBolt sx={{color:'whitesmoke', padding: '0px' }} fontSize='small'></OfflineBolt>
    <Handle type="source" position={Position.Left} id={'source_left' + data.label} />
    <Handle type="source" position={Position.Right} id={'source_right' + data.label} />
    <Handle type="target" position={Position.Top} id={'target_top' + data.label}/>
    {/* <NodeLabel title={data.stepData.label} subtitle={data.label}></NodeLabel> */}
    <Stack direction='column' alignItems='center' padding='5px' margin='25px 0 0 0'>
          <Typography variant='caption'>{data?.stepData?.label}</Typography>
        </Stack>
    </>
  )
}

export default memo(ActionNode)

import { memo, type FC } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import PendingIcon from '@mui/icons-material/Pending';
import NodeLabel from './NodeLabel';

const WaitNode: FC<NodeProps> = ({ id, data, isConnectable }) => {
  return (
    <>
    <PendingIcon sx={{color:'whitesmoke', padding: '0px' }} fontSize='small'></PendingIcon>
        <>
          <Handle type="source" position={Position.Bottom} id={'source' + data.label} />
          <Handle type="target" position={Position.Top} id={'target' + data.label}/>
        </>
        <NodeLabel title={data.stepData.label} subtitle={data.label}></NodeLabel>
    </>
  )
}

export default memo(WaitNode)

import { memo, type FC } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import AccountIcon from '@mui/icons-material/AccountBalanceSharp';
import NodeLabel from './NodeLabel';

const LendXPNode: FC<NodeProps> = ({ id, data, isConnectable }) => {
  return (
    <>
    <AccountIcon sx={{color:'whitesmoke', padding: '0px' }} fontSize='small'></AccountIcon>
        <>
          <Handle type="source" position={Position.Bottom} id={'source' + data.label} />
          <Handle type="target" position={Position.Top} id={'target' + data.label}/>
        </>
        <NodeLabel title={data.stepData.label} subtitle={data.label}></NodeLabel>
    </>
  )
}

export default memo(LendXPNode)

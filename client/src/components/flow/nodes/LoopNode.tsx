import { memo, type FC } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Loop } from '@mui/icons-material'
import NodeLabel from './NodeLabel'

const LoopNode: FC<NodeProps> = ({ id, data, isConnectable }) => {
  return (
    <>
    <Loop color='warning' fontSize='small' sx={{ padding: '0px' }}></Loop>
      <>
          <Handle type="source" position={Position.Bottom} id={'source' + data.label} />
          <Handle type="target" position={Position.Top} id={'target' + data.label}/>
        </>
        <NodeLabel title={data.stepData.label} subtitle={data.label}></NodeLabel>
    </>
  )
}

export default memo(LoopNode)

import { memo, type FC } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import NoteIcon from '@mui/icons-material/NoteAdd';
import NodeLabel from './NodeLabel';

const NoteNode: FC<NodeProps> = ({ id, data, isConnectable }) => {
  return (
    <>
    <NoteIcon sx={{color:'whitesmoke', padding: '0px' }} fontSize='small'></NoteIcon>
        <>
          <Handle type="source" position={Position.Bottom} id={'source' + data.label} />
          <Handle type="target" position={Position.Top} id={'target' + data.label}/>
        </>
        <NodeLabel title={data.stepData.label} subtitle={data.label}></NodeLabel>
    </>
  )
}

export default memo(NoteNode)

import { memo, type FC, useState, MouseEventHandler, MouseEvent } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import AddCreateRecord from '../forms/CreateRecordForm'
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import NodeLabel from './NodeLabel';

const CreateRecordNode: FC<NodeProps> = ({ id, data, isConnectable }) => {
  return (
    <>
      <>
        <NoteAddIcon sx={{ padding: '0px', color: 'white', fontSize: 'x-small' }}></NoteAddIcon>
        <Handle type="source" position={Position.Bottom} id={'source' + data.label} />
        <Handle type="target" position={Position.Top} id={'target' + data.label} />
        {data.dataModels && <AddCreateRecord open={true} workflowId={data.workflowId} dataModels={data.dataModels} />}
      </>
      <NodeLabel title={data.stepData.label} subtitle={data.label}></NodeLabel>
    </>
  )
}

export default memo(CreateRecordNode)

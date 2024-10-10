import { memo, type FC} from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddUpdateRecord from '../forms/UpdateRecordForm'
import NodeLabel from './NodeLabel';

const UpdateRecordNode: FC<NodeProps> = ({ id, data, isConnectable}) => {
  return (
    <>
      <>
        <EditNoteIcon sx={{ padding: '0px', color: 'white', fontSize: 'x-small' }}></EditNoteIcon>
        <Handle type="source" position={Position.Bottom} id={'source' + data.label} />
        <Handle type="target" position={Position.Top} id={'target' + data.label} />
        {data.dataModels && <AddUpdateRecord open={true} workflowId={data.workflowId} dataModels={data.dataModels} />}
      </>
      <NodeLabel title={data.stepData.label} subtitle={data.label}></NodeLabel>
    </>
  )
}

export default memo(UpdateRecordNode)

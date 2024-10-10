import { memo, type FC} from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import AddDeleteRecord from '../forms/GetRecordForm';
import NodeLabel from './NodeLabel';
import { Delete } from '@mui/icons-material';

const DeleteRecordNode: FC<NodeProps> = ({ id, data, isConnectable}) => {
  return (
    <>
      <>
          <Delete sx={{ padding: '0px', color: 'white', fontSize: 'x-small' }}></Delete>
          <Handle type="source" position={Position.Bottom} id={'source' + data.label} />
          <Handle type="target" position={Position.Top} id={'target' + data.label} />
          {data.dataModels && <AddDeleteRecord open={true} workflowId={data.workflowId} dataModels={data.dataModels} />}
      </>
      <NodeLabel title={data.stepData.label} subtitle={data.label}></NodeLabel>
    </>
  )
}

export default memo(DeleteRecordNode)

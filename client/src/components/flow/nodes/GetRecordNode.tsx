import { memo, type FC} from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import FindInPageIcon from '@mui/icons-material/FindInPage';
import AddGetRecord from '../forms/GetRecordForm';
import NodeLabel from './NodeLabel';

const GetRecordNode: FC<NodeProps> = ({ id, data, isConnectable}) => {
  return (
    <>
      <>
          <FindInPageIcon sx={{ padding: '0px', color: 'white', fontSize: 'x-small' }}></FindInPageIcon>
          <Handle type="source" position={Position.Bottom} id={'source' + data.label} />
          <Handle type="target" position={Position.Top} id={'target' + data.label} />
          {data.dataModels && <AddGetRecord open={true} workflowId={data.workflowId} dataModels={data.dataModels} />}
      </>
      <NodeLabel title={data.stepData.label} subtitle={data.label}></NodeLabel>
    </>
  )
}

export default memo(GetRecordNode)

import { memo, type FC} from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import DensitySmallIcon from '@mui/icons-material/DensitySmall'
import AddNewAssignment from '../forms/AssignmentForm'
import NodeLabel from './NodeLabel'

const AssignmentNode: FC<NodeProps> = ({ id, data, isConnectable }) => {
  return (
      <>
        <>
          <DensitySmallIcon sx={{ padding: '0px', color: 'white', fontSize: 'x-small' }}></DensitySmallIcon>
          <Handle type="source" position={Position.Bottom} id={'source' + data.label} />
          <Handle type="target" position={Position.Top} id={'target' + data.label} />
          {data.dataModels && <AddNewAssignment open={true} workflowId={data.workflowId} dataModels={data.dataModels} />}
        </>
        <NodeLabel title={data.stepData.label} subtitle={data.label}></NodeLabel>
      </>
  )
}

export default memo(AssignmentNode)

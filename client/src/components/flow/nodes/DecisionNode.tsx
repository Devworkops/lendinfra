import { memo, type FC } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { AccountTree } from '@mui/icons-material'
import AddNewDecision from '../forms/DecisionForm'

const DecisionNode: FC<NodeProps> = ({ id, data, isConnectable }) => {
  return (
   
      <>
      <AccountTree sx={{ padding: '0px', color: 'white', fontSize: 'x-small' }}></AccountTree>
        <Handle type="source" position={Position.Left} id={'source_left' + data.label}/>
        <Handle type="source" position={Position.Right} id={'source_right' + data.label} />
        <Handle type="target" position={Position.Top} id={'target_top' + data.label} />
        {data.dataModels && <AddNewDecision open={true} workflowId={data.workflowId} dataModels={data.dataModels}/>}
      </>
  )
}

export default memo(DecisionNode)

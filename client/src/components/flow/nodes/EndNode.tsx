import { memo, type FC } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import StopCircleIcon from '@mui/icons-material/StopCircle'

const EndNode: FC<NodeProps> = ({ id, data }) => {
  return (
        <>
            <StopCircleIcon fontSize='large' sx={{ padding: '0px' }} color='error'></StopCircleIcon>
            <Handle type='target' position={Position.Top} id={data.label} />
        </>
  )
}

export default memo(EndNode)

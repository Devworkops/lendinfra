import React from 'react'
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getSmoothStepPath } from 'reactflow'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import AddElement from '../AddElementDialog'
import CancelIcon from '@mui/icons-material/Cancel'
import { Box, Chip, IconButton, Typography } from '@mui/material'
import NodeLabel from '../nodes/NodeLabel'

// this is a little helper component to render the actual edge label
function EdgeLabel({ transform, label }: { transform: string; label: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        background: 'transparent',
        padding: 10,
        fontSize: 7,
        transform,
      }}
      className="nodrag nopan"
    >
      {label}
    </div>
  );
}

export default function AddNodeEdge (edgeProps: EdgeProps) {
  const {
    id,
    source,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data
  } = edgeProps
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })

  const onEdgeClick = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => {
    evt.stopPropagation()
    setOpen(!open)
    setAnchorEl((anchorEl != null) ? null : evt.currentTarget)
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} label={data.label}/>
      <EdgeLabelRenderer>
        { data && data.edgeType == 'decisionLeft' &&<EdgeLabel
            transform={`translate(-50%, 0%) translate(${sourceX-10}px,${sourceY-20}px)`}
            label='True'
        />
        }
        { data && data.edgeType == 'decisionRight' &&<EdgeLabel
            transform={`translate(-50%, 0%) translate(${sourceX+10}px,${sourceY-20}px)`}
            label='False'
        />
        }
        { data && data.edgeType == 'actionLeft' &&<EdgeLabel
            transform={`translate(-50%, 0%) translate(${sourceX-10}px,${sourceY-20}px)`}
            label='Success'
        />
        }
        { data && data.edgeType == 'actionRight' &&<EdgeLabel
            transform={`translate(-50%, 0%) translate(${sourceX+10}px,${sourceY-20}px)`}
            label='Error'
        />
        }
        {data.isAutoLayout && <IconButton aria-label="end" onClick={(event) => { onEdgeClick(event, id) }} sx={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all' }}>
          {!open
            ? <ControlPointIcon color='action' fontSize='small' sx={{ padding: '0px', border: '0px', background: 'white' }}></ControlPointIcon>
            : <CancelIcon color='action' fontSize='small' sx={{ padding: '0px', border: '0px', background: 'white' }}></CancelIcon>}
        </IconButton>}
        { data && source == 'start' && <Chip sx={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${sourceX}px,${sourceY + 20}px)` }} className='edgeLabel' label={data.label} />}
      </EdgeLabelRenderer>
      <AddElement anchorEl={anchorEl} open={open} setOpen={setOpen} edgeProps={edgeProps}></AddElement>
    </>
  )
}

import React from 'react'
import DensitySmallIcon from '@mui/icons-material/DensitySmall'
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { Divider, Grid, Typography } from '@mui/material'
import { AccountTree, HorizontalRule } from '@mui/icons-material'
const Sidebar = () => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/plain', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
  return (
    <aside>
      <Typography>You can drag these nodes to the pane on the left to construct flow.</Typography>
      <Divider sx={{ marginBottom: '10px', marginTop: '20px' }}></Divider>
      <Grid container spacing={2} >
        <Grid item xs={12} sm={6} md={6}>
          <div onDragStart={(event) => { onDragStart(event, 'Assignment') }} draggable>
            <DensitySmallIcon className='react-flow__node square' sx={{ marginLeft: '30px' }} />
            <br /><br />Assignment Node
          </div>

        </Grid>
        <Grid item xs={12} sm={6} md={6} >
          <div onDragStart={(event) => { onDragStart(event, 'Decision') }} draggable>
            <AccountTree className='react-flow__node diamond' sx={{ marginLeft: '30px' }}/>
            <br /><br />
            Decision Node
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <div onDragStart={(event) => { onDragStart(event, 'Create Record') }} draggable>
            <NoteAddIcon className='react-flow__node createRecord' sx={{ marginLeft: '30px' }} />
            <br /><br />Create Record Node
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <div onDragStart={(event) => { onDragStart(event, 'Update Record') }} draggable>
            <EditNoteIcon className='react-flow__node updateRecord' sx={{ marginLeft: '30px' }} />
            <br /><br />Update Record Node
          </div>
        </Grid>
      </Grid>
    </aside>
  )
}
export default Sidebar

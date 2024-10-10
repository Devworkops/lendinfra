import * as React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

export default function PageHeading (props: { heading: string, startIcon?: React.ReactChild | null | undefined, children?: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined }) {
  return (
    <Box sx={{ width: '100%' }}>
        <Grid container spacing={0}>
          <Grid item xs>
            <Typography gutterBottom variant="h4" component="div">
            {props.startIcon} {props.heading}
            </Typography>
          </Grid>
          <Grid item xs={0} sx={{ padding: '15px' }}>
            {props.children}
          </Grid>
        </Grid>
    </Box>
  )
}

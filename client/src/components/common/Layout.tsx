import { Paper } from '@mui/material'

export default function Layout ({ children }: any) {
  return (
    <Paper sx={{ padding: '10px', display: 'contents' }}>
        {children}
      </Paper>
  )
}

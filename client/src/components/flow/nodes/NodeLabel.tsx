import { Stack, Typography } from '@mui/material'

const NodeLabel = ({ title, subtitle }:{title:string, subtitle:string}) => {
  return (
        <Stack direction='column' alignItems='center' padding='12px'>
          <Typography variant='caption'>{title}</Typography>
        </Stack>
  )
}

export default NodeLabel

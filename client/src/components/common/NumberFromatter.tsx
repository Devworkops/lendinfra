import { Box, Tooltip } from '@mui/material'
import { useAuth } from '../../hooks/useAuth'

export default function NumberFormatter (props: { value: string, alignment?: string, scale?: number, toolTipPlace?: string }) {
  const { company } = useAuth()
  const ToolTipPlacement: any = props.toolTipPlace ? props.toolTipPlace : 'right'
  let formattedValue = ''
  const originalValue = props.value
  const newScale = props.scale && props.scale
  if (originalValue) {
    formattedValue = Math.abs(parseFloat(originalValue)).toPrecision()
    formattedValue = parseFloat(formattedValue).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: newScale })
    if (parseFloat(originalValue) < 0) {
      formattedValue = `(${formattedValue})`
    }
  }

  return (
            <Tooltip title={originalValue} placement={ToolTipPlacement}>
               <Box component='div' sx={{ display: 'flex', justifyContent: props.alignment && props.alignment, flexGrow: 1, paddingLeft: '5px', paddingRight: '5px' }}>{formattedValue}</Box>
            </Tooltip>
  )
}

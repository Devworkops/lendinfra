import { useState } from 'react'
import { Button } from '@mui/material'

export default function MButton (props: any) {
  const [executing, setExecuting] = useState(false)

  const { disabled, onClick, variant,  ...otherProps } = props

  const onRealClick = async (event: any) => {
    setExecuting(true)
    try {
      await onClick(event)
    } finally {
      setExecuting(false)
    }
  }

  return (
    <Button
      onClick={onRealClick}
      variant={variant?variant:'text'}
      disabled={executing || disabled}
      {...otherProps}
    />
  )
}

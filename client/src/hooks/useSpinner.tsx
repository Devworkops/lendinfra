import { createContext, type Context, useContext, useState, useEffect } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { Backdrop } from '@mui/material'

interface SpinnerContext {
  enableSpinner: () => void
  disableSpinner: () => void
}

// Create context with a default state.
const spinnerContext: Context<SpinnerContext> = createContext<SpinnerContext>({
  enableSpinner: () => { },
  disableSpinner: () => { }
})

const { Provider } = spinnerContext

function useProvideSpinner () {
  const [enabled, setEnabled] = useState(false)
  const enableSpinner = () => {
    setEnabled(true)
  }
  const disableSpinner = () => {
    setEnabled(false)
  }

  return { enabled, enableSpinner, disableSpinner }
}

function SpinnerProvider ({ children }: any) {
  const spinner = useProvideSpinner()
  return <Provider value={spinner}>
        {children}
        <Backdrop open={spinner.enabled} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}><CircularProgress color="secondary" /></Backdrop>
    </Provider>
}
export const useSpinner = () => useContext(spinnerContext)

export default SpinnerProvider

import React, { useEffect, useReducer } from 'react'
import { DateRangeInput } from '@datepicker-react/styled'
import { ThemeProvider } from 'styled-components'

function reducer (state: any, action: { type: any, payload: any }) {
  switch (action.type) {
    case 'focusChange':
      return { ...state, focusedInput: action.payload }
    case 'dateChange':
    {
      return action.payload
    }
    default:
      throw new Error()
  }
}

export function CustomDateRangePicker (props: any) {
  const initialState = {
    startDate: props.startDate,
    endDate: props.endDate,
    focusedInput: null
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    props.handleChanges(state)
  }, [state.startDate, state.endDate])

  return (
    <ThemeProvider
      theme={{
        reactDatepicker: {
          daySize: [36, 40],
          dateRangeZIndex: 100,
          datepickerZIndex: 100,
          dateSingleZIndex: 100,
          colors: {
            accessibility: '#039485',
            selectedDay: '#50a199',
            selectedDayHover: '#039485',
            primaryColor: '#039485'
          }
        }
      }}
    >
      <DateRangeInput
        onDatesChange={data => { dispatch({ type: 'dateChange', payload: data }) }}
        onFocusChange={focusedInput => { dispatch({ type: 'focusChange', payload: focusedInput }) }}
        startDate={state.startDate} // Date or null
        endDate={state.endDate} // Date or null
        focusedInput={state.focusedInput} // START_DATE, END_DATE or null
      />
    </ThemeProvider>
  )
}

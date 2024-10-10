import * as React from 'react'
import {
  Button
} from '@mui/material'
import { useFieldArray, useFormContext } from 'react-hook-form-mui'
import { EntryCondition } from './EntryCondition'
import AddIcon from '@mui/icons-material/Add'
import { type DataModel } from '../../interfaces/IDataModel'

export const EntryConditionContext = React.createContext({
  remove: (index: number) => { },
  append: (field: {}) => { }
})

export default function AddEntryConditions (props: { selectedDataModel: DataModel | null }) {
  const { selectedDataModel } = props
  const { control, watch } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'workflow.filterConditions'
  })
  const watchFieldArray = watch('workflow.filterConditions')
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index]
    }
  })

  const addEntryConditionHandler = () => {
    append({
      variable: '',
      operator: '',
      value: ''
    })
  }

  return (
        <>
            <EntryConditionContext.Provider value={{ remove, append }}>
                {controlledFields.map((field, index) => (
                    <EntryCondition
                        index={index}
                        key={field.id}
                        selectedDataModel={selectedDataModel}
                    />
                ))}
                <Button sx={{ marginTop: '10px' }}onClick={addEntryConditionHandler} variant="outlined" startIcon={<AddIcon />}>
                    Add Condition
                </Button>
            </EntryConditionContext.Provider>
        </>
  )
}

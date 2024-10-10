import * as React from 'react'
import {
  Button, Grid
} from '@mui/material'
import { SelectElement, useFieldArray, useFormContext } from 'react-hook-form-mui'
import { Criteria } from './Criteria'
import AddIcon from '@mui/icons-material/Add'
import { type DataModel } from '../../../interfaces/IDataModel'
import useFormHelper from '../../../hooks/useFormHelper'

export const CriteriaContext = React.createContext({
  remove: (index: number) => { },
  append: (field: {}) => { }
})

export default function AddCriterias(props: {
  dataModels: DataModel[],
  conditions?: any
  isConditional: boolean,
  workflowId: string,
  buttonText: string,
  isResource?: boolean,
  record?: string,
  fieldToWatch?: any,
  isAssignment?: boolean,
  type?:string
}) {

  const { control, watch } = useFormContext()
  const [parseError] = useFormHelper()
  const { dataModels, conditions, isConditional, isResource, workflowId, buttonText, record, fieldToWatch, isAssignment, type } = props
  const [selectedCondition, setSelectedCondition] = React.useState("");
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldToWatch ? `${fieldToWatch}` : 'inputValues'
  })
  const watchFieldArray = watch(fieldToWatch ? `${fieldToWatch}` : 'inputValues')
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index]
    }
  })

  const addCriteriaHandler = () => {
    append({
      variable: '',
      operator: '',
      value: ''
    })
  }

  const updateCondition = (event: any) => {
    setSelectedCondition(event)
  }

  return (
    <>
      {isConditional && controlledFields.length != 0 ?
        <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex' }}>
          <SelectElement label={'Condition'} name={'condition'} value={selectedCondition} parseError={parseError} sx={{ width: '300px' }} required
            options={conditions} size="small" onChange={event => updateCondition(event)} /><br />
        </Grid>
        : <></>
      }
      {selectedCondition != 'none' &&
        <CriteriaContext.Provider value={{ remove, append }}>
          {controlledFields.map((field, index) => (
            <>
              <Criteria
                index={index}
                field={field}
                key={field.id}
                dataModels={dataModels}
                workflowId={workflowId}
                isResource={isResource}
                record={record}
                fieldToWatch={fieldToWatch}
                isAssignment={isAssignment}
                type={type}
              />
            </>
          ))}
          <Button onClick={addCriteriaHandler} variant="outlined" startIcon={<AddIcon />}>
            {buttonText}
          </Button>
        </CriteriaContext.Provider>}
    </>
  )
}

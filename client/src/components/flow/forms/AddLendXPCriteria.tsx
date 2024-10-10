import * as React from 'react'
import {
  Button, Grid
} from '@mui/material'
import { SelectElement, useFieldArray, useFormContext } from 'react-hook-form-mui'
import AddIcon from '@mui/icons-material/Add'
import { type DataModel } from '../../../interfaces/IDataModel'
import useFormHelper from '../../../hooks/useFormHelper'
import { LendXPCriteria } from './LendXPCriteria'

export const CriteriaContext = React.createContext({
  remove: (index: number) => { },
  append: (field: {}) => { }
})

export default function AddLendXPCriteria(props: {
  dataModels: DataModel[],
  conditions?: any
  workflowId: string,
  isResource?: boolean,
  record?: string,
  fieldToWatch?: any,
  isAssignment?: boolean,
  type?:string
}) {

  const { dataModels, conditions, isResource, workflowId, record, fieldToWatch, isAssignment, type } = props

  return (
    <LendXPCriteria
      dataModels={dataModels}
      workflowId={workflowId}
      isResource={isResource}
      record={record}
      fieldToWatch={fieldToWatch}
      isAssignment={isAssignment}
      type={type}
    />
  )
}

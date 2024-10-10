import { type DataType } from './IDataType'

export interface Condition {
  dataType?: DataType
  field: string
  operator: string
  value: any
}

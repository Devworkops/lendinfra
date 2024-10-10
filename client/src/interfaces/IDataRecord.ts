
export interface DataRecord {
  id:string
  recordId:string
  objectName: string
  uniqueId: string // will create using primary and secondary keys
  dataModel: string
  company: string
  createdBy: string
  fields: {[key: string]: any, type?:string}
  isActive?: boolean
}

export interface MetafieldsAttrs {
  key: string
  label: string
  value: any
  type: string
  isEditable: boolean
  isVisible?: boolean
}

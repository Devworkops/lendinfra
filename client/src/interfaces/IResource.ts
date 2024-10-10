export enum ResourceType {
  variable = 'Variable',
  constant = 'Constant',
  text = 'Text',
  stage = 'Stage'
}

export enum DataType {
  text = 'Text',
  record = 'Record',
  number = 'Number',
  currency = 'Currency',
  boolean = 'Boolean',
  date = 'Date',
  datetime = 'DateTime',
  picklist = 'Picklist',
  mspicklist = 'Multi-Select Picklist',
}

// An interface that describes the properties
// that are required to create a new Resource
export interface IResource {
  id: string
  workflowId: string
  resourceType: ResourceType
  apiName: string
  description: string
  dataType: DataType
  body: string
  order: number
  active?: boolean
  multipleAllowed?: boolean
  avilableForInput?: boolean
  availableForOutput?: boolean
  defaultValue?: {}
  object: {}
  decimalPlaces?: number
}

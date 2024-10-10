import { IResource } from './IResource'

enum WorkflowStepStatus {
  inProgress = "In Progress",
  completed = "Completed",
  paused = "Paused",
}

export enum StepType {
  interaction = 'Interaction',
  logic = 'Logic',
  data = 'Data',
}

export interface Workflowstep {
  id:string
  label: string;
  name: string;
  description: string;
  workflowInstanceId: string;
  type:string;
  status:WorkflowStepStatus
  inputValues?:MetafieldsAttrs[],
  apiName?:string;
  apiParams?:apiParamAttrs[]
  args?: string;
  dependsOn?: string;
  functionDetail?:string;
  condition?: string;
  result?:string;
  isActive:boolean;
  workflowId?:string;
  recordsToCreateOrStore?:string;
  setRecordFields?:string;
  record?:string
  direction?:string,
  directionField?:string;
  collection?:string
  assignmentValues?:[MetafieldsAttrs],
  data?:{key: string, value: any} | any
  timer?: number
  comment?: string;
}
export type apiParamAttrs = {
  id:string| undefined;
  objectName?: string;
  label?: string| undefined; 
  value?: any;
}

export type MetafieldsAttrs = {
  name: string;
  variable?:string
  operator: string;
  value: any;
  fieldName?:string;
}

export enum NodeType {
  assignment = 'Assignment',
  decision = 'Decision',
  loop = 'Loop',
  action = 'Action',
  createRecord ='Create Record',
  getRecord ='Get Record',
  updateRecord ='Update Record',
  deleteRecord ='Delete Record',
  wait ='Wait',
  note = 'Note',
  createNote = 'Create Note',
  LendXP = 'LendXP'
}
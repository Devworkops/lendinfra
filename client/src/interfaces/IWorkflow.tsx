export interface Workflow {

  id: string;
  name: string;
  description: string;
  company: string;
  type: FlowType;
  triggerType: TriggerType;
  object: string;
  filterType: FilterType;
  filterConditions: FilterCondition[];
  status: WorkflowStatus;
  isActive: boolean;
  createdBy: string;
  config?: any
  _id?: string
}

export interface WorkflowInstance {
  id: string;
  workflow: Workflow
  company: string
  status: WorkflowInstanceStatus
  result?: string
  startedAt: Date
  complatedAt?: Date
  _id?: string
  recordId?: string
}

export enum FlowType {
  recordTriggered = 'Record-Triggered Flow',
  platformEventTriggeredFlow = 'Platform Event—Triggered Flow',
  scheduleTriggeredFlow = 'Schedule-Triggered Flow',
  autolaunchedFlow = 'Autolaunched Flow'
}

export enum FilterType {
  or = 'OR',
  and = 'AND',
  none = 'NONE',
  custom = 'CUSTOM'
}

export enum TriggerType {
  update = 'Update',
  delete = 'Delete',
  create = 'Create',
  createOrUpdate = 'CreateOrUpdate'
}

export enum WorkflowStatus {
  draft = 'DRAFT',
  published = 'PUBLISHED'
}

enum WorkflowInstanceStatus {
  inProgress = "In Progress",
  completed = "Completed",
  paused = "Paused",
}

// export interface FilterCondition {
//   id: number
//   field: string
//   operator: string
//   value: any
//   path?: string
// }

export type FilterCondition = {
  name: string;
  variable: string
  operator: string;
  value: any;
}
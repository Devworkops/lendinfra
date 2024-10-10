export enum DataType {
  object = 'object',
  array = 'array',
  string = 'string',
  integer = 'integer'
}

export interface DataModel {
    id:string
    name: string;
    description: string;
    prefix: string;
    label: string;
    company: string;
    createdBy: string;
    type: DataType;
    primaryKeys?:string;
    secondaryKeys?:string;
    properties?: {[key: string]: any, type?:string, ref?:string, required?:boolean};
    required?: [string],
    isActive?: boolean
}

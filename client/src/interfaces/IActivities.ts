export interface Activities {
    record_id: string
    company: string
    user: {[key: string]: any, value?:string}

    object_type: string
    activity: string
    oldDataRecord:oldDataRecord
    newDataRecord:NewDataRecord
    timestamp: string
    createdAt: string
    updatedAt: string
}

export interface NewDataRecord {
    objectName:string
    uniqueId:string
    recordId:string
    dataModel:string
    company:string
    createdBy:string
    fields:any
    isActive:boolean
}
export interface oldDataRecord {
    objectName:string
    uniqueId:string    
    recordId:string
    dataModel:string
    company:string
    createdBy:string
    fields:any
    isActive:boolean
}
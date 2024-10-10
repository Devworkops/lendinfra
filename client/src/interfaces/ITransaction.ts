export interface Transaction {
    id?:string
    comment: string
    reference: string
    referenceId:string
    recordId:string
    company: string
    createdBy: string
    isActive?: boolean
}
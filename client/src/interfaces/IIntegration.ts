export enum IntegrationType {
    exchangeRate = "INVOICING",
    accounting = "ACCOUNTING"
}

export type ActionAttrs = {
    label:string;
    id:string;
    params?:[{ id:string, label:string, value:any, type: string, required:boolean, objectName:string }]
  }

export type MetafieldsAttrs = {
    key: string;
    label:string;
    value: string;
    type: string;
    isEditable:boolean
    isVisible?:boolean
}

export interface Integration {
    id?:string;
    name: string;
    description?: string;
    logo?: string;
    company: string;
    type: IntegrationType;
    metaFields?: [MetafieldsAttrs];
    actions?: [ActionAttrs];
    isActive: boolean;
    url?: string;
}

export enum AccountingIntegration {
    xero = "Xero",
    quickBook = "QuickBook",
}
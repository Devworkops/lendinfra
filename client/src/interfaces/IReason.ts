export interface Reason {
    id?: string;
    objectName?: string;
    primaryKey?: string;
    company?: string;
    createdBy?: string;
    fields?: { [key: string]: any, type?: string };
    createdAt?: Date;
}
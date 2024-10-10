export enum DataType {
  object = 'object',
  array = 'array',
  string = 'string',
  integer = 'integer'
}

export interface WebhookEvents {
    _id:string
    consent_id:string
    new_status: string;
    notification_utc_time: string;
}

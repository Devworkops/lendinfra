export interface Notification {
    count: number
    messages: Messages[]
    total_notification:number

}

export interface Messages {
    company: string
    user: string
    action: string
    activity: string
    is_read: number
    timestamp: string
    createdAt: string
    updatedAt: string
    id: string
    instatnce_id:string
}
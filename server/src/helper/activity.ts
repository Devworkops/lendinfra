
import { BadRequestError } from "../errors/bad-request-error";
import { Activity } from "../models/activity";

export async function activity(record_id:string, company: string | undefined, user: string | undefined, object_type: string, activity: string, oldDataRecord?:object,newDataRecord?:object): Promise<void> {
    try {
        const newNotification = new Activity({ record_id:record_id, company: company, user: user, object_type:object_type, activity: activity, oldDataRecord:oldDataRecord,newDataRecord:newDataRecord });
        await newNotification.save();
        console.log(`Activity added successfully: ${activity}`);  
    } catch (error) {
        console.error(`Error Activity: ${error}`);
    }
}

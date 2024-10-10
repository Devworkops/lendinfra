import {Log} from "../models/log";
import {CompanyDoc} from "../models/company";
import {UserDoc} from "../models/user";

export async function logActivity(company: string | undefined, user: string | undefined, action: string, activity: string): Promise<void> {
    try {
        const newLog = new Log({ company: company, user: user, action: action, activity: activity });
        await newLog.save();
        console.log(`Activity logged successfully: ${activity}`);
    } catch (error) {
        console.error(`Error logging activity: ${error}`);
    }
}

import {Notification} from "../models/notifications";
import {CompanyDoc} from "../models/company";
import {User, UserDoc} from "../models/user";
import MailUtil from "./MailUtil";
import { BadRequestError } from "../errors/bad-request-error";

export async function notfication(company: string | undefined, user: string | undefined, action: string, activity: string, instatnce_id?:string): Promise<void> {
    try {
        const newNotification = new Notification({ company: company, user: user, action: action, instatnce_id:instatnce_id, activity: activity });
        await newNotification.save();
        console.log(`Notification added successfully: ${activity}`);
        
        const userExist = await User.findOne({ company: company, _id: user });
        if(!userExist) {
            throw new BadRequestError("User does not exist to mail");
        }  else {
            if (userExist.notificationSetting != undefined && userExist.notificationSetting?.email == 'enable'){
                const email = userExist.email
                if(action == 'workflow'){
                    await MailUtil.sendMail(email as string, '', 'Workflow error', activity, '');
                    console.error(`Email Sent successfully`);
                }
            }
        }                   
    } catch (error) {
        console.error(`Error Notification activity: ${error}`);
    }
}

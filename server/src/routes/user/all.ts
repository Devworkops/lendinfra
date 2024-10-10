import express, { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { UserToCompany } from "../../models/user-company";
import { RoleOptions} from "../../models/user";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.get(
    "/api/user/all/:companyId?",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
        const companyId = req.params.companyId;
        let userToCompanyAssoc;
        let users = new Array();
        if(typeof companyId != 'undefined' && companyId){
           userToCompanyAssoc = await UserToCompany.find({
                company: companyId
            }).populate('user').populate('company');
            for (const key in userToCompanyAssoc){
                const user = userToCompanyAssoc[key].user;
                user.isActive = userToCompanyAssoc[key].status;
                user.roles = <[RoleOptions]>(userToCompanyAssoc[key].roles);
                users.push(user);
            }
        }
        res.send(users);
    }
);

export { router as allUserRouter };

import express, { Request, Response } from "express";
import { body } from "express-validator";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { validateRequest } from "../../middleware/validate-request";
import { RoleOptions, User } from "../../models/user";
import { UserToCompany } from "../../models/user-company";
import { BadRequestError } from "../../errors/bad-request-error";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.put(
    "/api/user/:id",
    currentUser,
    requireAuth,
    [
        body("firstName")
            .optional()
            .isLength({ min: 3, max: 100 })
            .withMessage("Please provide valid first name"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        try{
            const filter = { _id: req.params.id };

            const { company } = req.body;
            const userCompanyAssoc = await UserToCompany.findOne({user: req.params.id, company: company});
            let userStatus = userCompanyAssoc?.status;
            let userRoles: RoleOptions[] = [RoleOptions.admin]
            if(userCompanyAssoc?.roles){
            userRoles = userCompanyAssoc.roles;
            }
            const isActiveFilter={company: company, status:true};      //filter to check isActive
            const userCount= (await UserToCompany.find(isActiveFilter)).length;   //count of active users

            //Operator cannot modify isActive status
            if(userStatus!==req.body.isActive && req.body.currentUser!==RoleOptions.admin){
                throw new BadRequestError('Operators cannot activate or deactivate user');
            }

            if(req.body.isActive===false &&  userStatus === true && userCount<=1){
                throw new BadRequestError('Atleast one user should be active');
            }

            const {roles}=req.body;

            const isAdminFilter={company:company, roles: RoleOptions.admin, status: true};  //filter to check isActive and isAdmin
            const adminCount=(await UserToCompany.find(isAdminFilter)).length;         //count of active admin role users
            // console.log(adminCount);

             //Last admin cannot be deactivated
            if((req.body.roles===RoleOptions.operator || req.body.isActive===false) && userRoles[0] === RoleOptions.admin && adminCount<=1){
                throw new BadRequestError('Atleast one active user should be admin');
            }


            let user = await User.findOneAndUpdate(filter, req.body, {
                new: true
            });
            if(!user) throw new NotFoundError();
            let userToCompanyAssoc = await UserToCompany.findOneAndUpdate({user: req.params.id, company: company},
                {roles: req.body.roles, status: req.body.isActive}, {
                    new: true
                });
            if(!userToCompanyAssoc) throw new NotFoundError();
            return res.send(user);

        } catch (error) {
            return res.send({ errors: [{ message: (error as Error).message }] });
        }

    }
);

export { router as updateUserRouter };

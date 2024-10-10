import express, { Request, Response } from "express";
import {
    NotFoundError
} from "../../errors/not-found-error";
import { BadRequestError } from "../../errors/bad-request-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Company } from "../../models/company";
import { UserToCompany } from "../../models/user-company";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.get(
    "/api/company/user/:userId",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
        try {
            let company = await Company.findOne({ _id: req.currentUser?.companyId })
            if (!company) throw new BadRequestError('Invalid Company or user does not have any company added');
            let result = await UserToCompany.find({ user: req.params.userId }).populate("company");
            let companyList = new Array();
            for (const key in result) {
                if (result[key].status) {
                    const company = result[key].company;
                    companyList.push(company);
                }
            }
            return res.send({ companyList: companyList, presentCompany: company });
        }
        catch (error) {
            return res.send({ errors: [{ message: (error as Error).message }] });
        };
    }
);

export { router as showUserCompanyListRouter };

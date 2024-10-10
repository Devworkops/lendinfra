import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { validateRequest } from "../../middleware/validate-request";
import { DataRecord } from "../../models/data-record";
import { Datamodel } from "../../models/data-model";
import {BadRequestError} from "../../errors/bad-request-error";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.post(
    "/api/datarecord/getAnalytics",
    currentUser,
    requireAuth,
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);

            company_id = req?.currentUser?.companyId;
            user_id = req?.currentUser?.id;
            const { companyId, accountId } = req.body;

            console.log(companyId, accountId );

            const dataModel = await Datamodel.findOne({company: companyId, name: 'TrustLoop'});
            if (!dataModel) {
                await logActivity(company_id, user_id, "DataRecord", "DataModel doesn't exists.");
                throw new BadRequestError("Invalid query.");
            }

            const dataRecord = await DataRecord.find({ company: companyId, objectName: 'TrustLoop',  primaryKey: accountId}).sort({createdAt: -1});
            if (dataRecord){
                res.status(200).send(dataRecord);
                return;
            }
            await logActivity(company_id, user_id, "DataRecord", "No analytics data found based in the given body");
            res.status(200).send({message: "No analytics data found based in the given body"});
            return;
        } catch (error) {
            company_id = req?.currentUser?.companyId;
            user_id = req?.currentUser?.id;
            await logActivity(company_id, user_id, "DataRecord", "Error while getting analytics data.");
            console.log((error as Error).message);
            console.log((error as Error).stack);
            res.status(400).send({ errors: [{ message: (error as Error).message }] });
            return;
        }
    }
);

export { router as getAnalytics };

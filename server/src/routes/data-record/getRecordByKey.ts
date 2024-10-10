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
    "/api/datarecord/dataRecordByKey/:companyId?",
    currentUser,
    requireAuth,
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);

            const companyId = req.params.companyId;
            company_id = req?.currentUser?.companyId;
            user_id = req?.currentUser?.id;
            // filters  = { key: 'primaryKey', value: 'value' }
            const { filters, objectName } = req.body;

            console.log(objectName, companyId, filters );

            const dataModel = await Datamodel.findOne({company: companyId, name: objectName});
            if (!dataModel) {
                await logActivity(company_id, user_id, "DataRecord", "DataModel doesn't exists.");
                throw new BadRequestError("Invalid query.");
            }

            const dataRecordByKey = await DataRecord.findOne({[filters.key]: filters.value, company: companyId, objectName: objectName});
            if (dataRecordByKey){
                res.status(200).send(dataRecordByKey);
                return;
            }
            await logActivity(company_id, user_id, "DataRecord", "No record found based on the key provided");
            res.status(200).send({message: "No record found based on the key provided"});
            return;
        } catch (error) {
            company_id = req?.currentUser?.companyId;
            user_id = req?.currentUser?.id;
            await logActivity(company_id, user_id, "DataRecord", "Error while getting records by key.");
            console.log((error as Error).message);
            console.log((error as Error).stack);
            res.status(400).send({ errors: [{ message: (error as Error).message }] });
            return;
        }
    }
);

export { router as getRecordByKey };

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { validateRequest } from "../../middleware/validate-request";
import { DataRecord } from "../../models/data-record";
import { random } from "lodash";
import mongoose from "mongoose";
import { Datamodel } from "../../models/data-model";
import { WorkflowManager } from "../../classes/WorkflowManager";
import {BadRequestError} from "../../errors/bad-request-error";
import {sec} from "mathjs";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.post(
    "/api/datarecord/duplicate-check/:companyId?",
    currentUser,
    requireAuth,
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);

            const companyId = req.params.companyId;
            company_id = req?.currentUser?.companyId;
            user_id = req?.currentUser?.id;
            // POST API
            // One or more fields - input, it can have one or more unique fields
            // we need to check
            //filters = {email: @gmail.com, phone:9039, address: 90}
            let uniqueId = "";
            let primaryKey = "";
            let secondaryKey = "";
            const { filters, objectName, isActive } = req.body;

            console.log(objectName, companyId, filters, isActive);

            const dataModel = await Datamodel.findOne({company: companyId, name: objectName});
            if (!dataModel) {
                await logActivity(company_id, user_id, "DataRecord", "DataModel doesn't exists.");
                throw new BadRequestError("Invalid query.");
            }

            Object.keys(filters).forEach((key) => {
                if (dataModel.primaryKeys && dataModel.primaryKeys.includes(key)){
                    uniqueId += filters[key];
                    primaryKey = filters[key];
                }
                else if (dataModel.secondaryKeys && dataModel.secondaryKeys.includes(key)) {
                    uniqueId += filters[key];
                    secondaryKey = filters[key];
                }
            })

            const dataRecordByUniqueId = await DataRecord.findOne({uniqueId: uniqueId, company: companyId, objectName: objectName, isActive:isActive});
            if (dataRecordByUniqueId){
                await logActivity(company_id, user_id, "DataRecord", dataRecordByUniqueId.toString());
                res.status(200).send(dataRecordByUniqueId);
                return;
            }

            const dataRecordByPrimaryKey = await DataRecord.findOne({primaryKey: primaryKey, company: companyId, objectName: objectName, isActive:isActive});
            if (dataRecordByPrimaryKey){
                await logActivity(company_id, user_id, "DataRecord", dataRecordByPrimaryKey.toString());
                res.status(200).send(dataRecordByPrimaryKey);
                return;
            }

            const dataRecordBySecondaryKey = await DataRecord.findOne({secondaryKey: secondaryKey, company: companyId, objectName: objectName, isActive:isActive});
            if (dataRecordBySecondaryKey){
                await logActivity(company_id, user_id, "DataRecord", dataRecordBySecondaryKey.toString());
                res.status(200).send(dataRecordBySecondaryKey);
                return;
            }
            await logActivity(company_id, user_id, "DataRecord", "No duplicate found");
            res.status(200).send({message: "No duplicate found"});
            return;
        } catch (error) {
            company_id = req?.currentUser?.companyId;
            user_id = req?.currentUser?.id;
            await logActivity(company_id, user_id, "DataRecord", "Error while getting duplicate dataRecord.");
            console.log((error as Error).message);
            console.log((error as Error).stack);
            res.status(400).send({ errors: [{ message: (error as Error).message }] });
            return;
        }
    }
);

export { router as duplicateDataRecordRouter };

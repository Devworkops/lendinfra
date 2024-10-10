import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { validateRequest } from "../../middleware/validate-request";
import {logActivity} from "../../helper/log";

import express from 'express';
import { Reason } from "../../models/reason";

const router = express.Router();

let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.post(
    "/api/reasons",
    currentUser,
    requireAuth,
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);

            const { primaryKey, objectName } = req.body;
            console.log( objectName, primaryKey );

            const reason = await Reason.find({objectName, primaryKey});
            
            if (reason.length===0) {
                await logActivity(company_id, user_id, "Reason", "Reason doesn't exists for this application.");
            }

            res.status(200).send(reason[0]);        

        } catch (error) {
            company_id = req?.currentUser?.companyId;
            user_id = req?.currentUser?.id;
            await logActivity(company_id, user_id, "reason", "Error while getting reason by primary key.");
            console.log((error as Error).message);
            console.log((error as Error).stack);
            res.status(400).send({ errors: [{ message: (error as Error).message }] });
            return;
        }
    }
);

export { router as getReasonByRecordId };

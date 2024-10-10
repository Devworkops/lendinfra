import { Request, Response } from "express";
import {
  NotFoundError
} from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { DataRecord} from "../../models/data-record";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.get("/api/consents/:id",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
        const { id } = req.params ;
        console.log(id)
        if (!id) {
            res.status(400).send({ error: 'Account id missing' });
        }

        const accountRecords = await DataRecord.find({
            objectName: 'Consent',
            company: company_id,
            primaryKey: id
        }).sort({ createdAt: -1 }); 

        if (accountRecords.length === 0) {
            throw new NotFoundError();
        }

        res.status(200).send(accountRecords);
    }
);

export { router as getConsents };

import { Request, Response } from "express";
import {
  NotFoundError
} from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { DataRecord} from "../../models/data-record";

import express from 'express';
import { Types } from "mongoose";
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.get("/api/applications/:id",
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
    
        const query = {
            objectName: 'Application',
            company: company_id,
            isActive: true,
            $or: [
                { 'fields.IndividualAccount': id },  // Match as string
                { 'fields.IndividualAccount': (new  Types.ObjectId(id)) }  // Match as ObjectId
            ]
        };
    
        const accountRecords = await DataRecord.find(query).sort({ createdAt: -1 });
    
        res.status(200).send(accountRecords);
    }
);

export { router as getApplications };

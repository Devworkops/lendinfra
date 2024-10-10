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

router.post("/api/datarecords/accounts",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
        let { accounts } = req.body;

        if (!Array.isArray(accounts) || accounts.length === 0) {
            res.status(400).send({ error: 'Accounts array is required and cannot be empty' });
        }

        accounts = accounts.filter((account: any) => typeof account === 'string' && account.trim().length > 0);

        if (accounts.length === 0) {
            res.status(400).send({ error: 'Accounts array contains no valid entries' });
        }
        const accountRecords = await DataRecord.find({
            _id: { $in: accounts },
            company: company_id,
        });

        if (accountRecords.length === 0) {
            throw new NotFoundError();
        }

        res.status(200).send(accountRecords);
    }
);

export { router as getAccounts };

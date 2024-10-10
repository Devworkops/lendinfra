import { Request, Response } from "express";
import { BadRequestError } from "../../errors/bad-request-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { DataRecord } from "../../models/data-record";

const express = require('express');
const router = express.Router();

router.get(
    "/api/contract/Detail",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
        const { companyId, contractId } = req.query;
        if (!companyId || !contractId) {
            throw new BadRequestError('companyId and contractId are required.');
        }

        try {
            const contract = await DataRecord
                .findOne({ objectName: "Contract", _id:contractId, company: companyId, isActive: true })
                .sort({ "createdAt": -1 });

                let transactions=null;
                if (contract){
                    transactions = await DataRecord.find({objectName:"Transaction", company: companyId,'fields.ContractId': contractId, isActive: true});
                }

            res.status(200).send( {
                contract:contract,
                transaction:transactions
            });
        } catch (err) {
            console.error('Error fetching contract/transactions:', err);
            res.status(500).send({errors:[{message: 'Internal server error' }]});
        }
    }
);

export { router as getContractDetails };

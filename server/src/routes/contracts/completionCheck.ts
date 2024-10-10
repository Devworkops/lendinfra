import { Request, Response } from "express";import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { DataRecord} from "../../models/data-record";
import { BadRequestError } from "../../errors/bad-request-error";

const express = require('express');
const router = express.Router();

router.post(
  "/api/datarecord/completionCheck",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {

    const { id, company } = req.body;

    console.log(id, company);

    const contract = await DataRecord.findOne({objectName: 'Contract', 'fields.AccountId': id, company: company});
    if(!contract){
        throw new BadRequestError("Contract not created")
    }
    const contractFields:any = contract.fields;

    if (!contractFields?.DocumentId) {
        throw new BadRequestError("Zoho sign not complete");
    }
    
    if (!contractFields?.VRPConsentId) {
        throw new BadRequestError("VRP consent not authorized");
    }
    
    res.send(contract).status(200);
    return;
  }
);

export { router as completionCheck };

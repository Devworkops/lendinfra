import { Request, Response } from "express";
import { BadRequestError } from "../../errors/bad-request-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { DataRecord } from "../../models/data-record";

const express = require('express');
const router = express.Router();

router.get(
    "/api/live/test",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {

        if (!req.currentUser || !req.currentUser.companyId)
            throw new BadRequestError('Invalid Company Id');

        const companyId = req.currentUser.companyId;
        console.log(req.currentUser);
        const data = await DataRecord.find({company: companyId}).lean().count();

        let message = `This api is to verify the live backend code on date 18-06-2024.` 
        if(data) {
            message = message + ` This api call counts the data record on the company id: ${companyId}, and the count of data record is: ${data} on date 18-06-2024`
        }
        res.send({ message: message, data: data});
    }
);

export { router as livePushTest };

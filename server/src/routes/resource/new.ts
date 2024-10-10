import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Resource } from "../../models/resource";
import { Workflow } from "../../models/workflow";
import { BadRequestError } from "../../errors/bad-request-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { validateRequest } from "../../middleware/validate-request";
import {logActivity} from "../../helper/log";

const express = require('express');
const router = express.Router();


router.post(
    "/api/workflow/resource/new",
    currentUser,
    requireAuth,
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const { workflowId, resourceType, apiName, description, dataType, body, order, active, multipleAllowed, avilableForInput, availableForOutput, defaultValue, object, decimalPlaces} = req.body;
            let existingWorkflowId = await Workflow.findById(workflowId!);
            if(!existingWorkflowId){
                throw new BadRequestError('Invalid workflowId')
            }
            const resource = Resource.build({ workflowId, resourceType, apiName, description, dataType, body, order, active, multipleAllowed, avilableForInput, availableForOutput, defaultValue, object, decimalPlaces });
            await resource.save();
            res.status(201).send(resource);
        }
        catch (error) {
            console.log((error as Error).message);
            console.log((error as Error).stack);
            throw (error as Error).message;
        }
    }
);

export { router as createResourceRouter };

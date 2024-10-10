import express, { Request, Response } from "express";
import {
    NotFoundError
} from "../../errors/not-found-error";
import { BadRequestError } from "../../errors/bad-request-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { WorkflowInstance } from "../../models/workflow-instance";

const router = express.Router();
router.get(
    "/api/workflow/instance/:instance_id",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
        let company_id = req.query.company_id;
        let instance_id = req.params.instance_id;
                
        try {
            let getWorkflowInstance = await WorkflowInstance.findOne({ company: company_id, _id:instance_id}).populate('workflow');
            return res.send({ 
                WorkflowInstance: getWorkflowInstance,
            });
        }
        catch (error) {
            return res.send({ errors: [{ messages: (error as Error).message }] });
        };
    }
);

export { router as getParticularInstanceListRoute };

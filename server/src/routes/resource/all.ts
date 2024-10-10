import { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Resource } from "../../models/resource";
import {logActivity} from "../../helper/log";

// Here we will fetch all general ledger for a company
const express = require('express');
const router = express.Router();

router.get(
  "/api/workflow/resource/all/:workflowId?",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {

    try {
      const { workflowId } = req.params;
      // Get All workflow Step
      const resource = await Resource.find({workflowId})

      if (resource.length == 0) {
        return res.send([]);
      }

      return res.send(resource);

    } catch (error) {
      console.log(error);
      return res.send({ message: error });
    }
  }
);

export { router as allResourceRouter };

import { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { RuleSet } from "../../models/rule-set";
import {logActivity} from "../../helper/log";

const express = require('express');
const router = express.Router();

router.put(
  "/api/rule-set/:id",
  // currentUser,
  // requireAuth,
  // validateRequest,
  async (req: Request, res: Response) => {

    const ruleSet = await RuleSet.findById(req.params.id);

    if (!ruleSet) {
      throw new NotFoundError();
    }

    if (req.body.name !== undefined) {
      ruleSet.name = req.body.name;
    }

    if (req.body.condition !== undefined) {
      ruleSet.condition = req.body.condition;
    }

    if (req.body.isActive !== undefined) {
      ruleSet.isActive = req.body.isActive;
    }

    await ruleSet.save();

    res.send(ruleSet);
  }
);

export { router as updateRuleSetRouter };

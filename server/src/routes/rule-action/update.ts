import { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { RuleAction } from "../../models/rule-action";
import {logActivity} from "../../helper/log";

const express = require('express');
const router = express.Router();

router.put(
  "/api/rule-action/:id",
  // currentUser,
  // requireAuth,
  // validateRequest,
  async (req: Request, res: Response) => {

    const ruleAction = await RuleAction.findById(req.params.id);

    if (!ruleAction) {
      throw new NotFoundError();
    }

    if (req.body.name !== undefined) {
      ruleAction.name = req.body.name;
    }

    if (req.body.type !== undefined) {
      ruleAction.type = req.body.type;
    }

    if (req.body.inputParameter !== undefined) {
      ruleAction.inputParameter = req.body.inputParameter;
    }

    if (req.body.isActive !== undefined) {
      ruleAction.isActive = req.body.isActive;
    }

    await ruleAction.save();

    res.send(ruleAction);
  }
);

export { router as updateRuleActionRouter };

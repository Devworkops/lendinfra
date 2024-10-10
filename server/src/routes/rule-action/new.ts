import { Request, Response } from "express";
import { validationResult } from "express-validator";

// import { validateRequest } from "../../middleware/validate-request";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { BadRequestError } from "../../errors/bad-request-error";
import { RuleSet } from "../../models/rule-set";
import { RuleAction } from "../../models/rule-action";
import {logActivity} from "../../helper/log";

const express = require('express');
const router = express.Router();

router.post(
  "/api/rule-action/new",
  // currentUser,
  // requireAuth,
  // validateRequest,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    const { ruleSet, name, company, type, inputParameter, isActive } = req.body;

    // Check if existing rule set
    const existingRuleSet = await RuleSet.findOne({ _id: ruleSet, company: company});
    if (existingRuleSet == undefined) {
      throw new BadRequestError("Invalid rule set");
    }
    const ruleAction = RuleAction.build({ ruleSet, name, company, type, inputParameter, isActive });
    await ruleAction.save();
    res.status(201).send(ruleAction);
  }
);

export { router as createRuleActionRouter };

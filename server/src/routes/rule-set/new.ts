import { Request, Response } from "express";
import { body, validationResult } from "express-validator";

// import { validateRequest } from "../../middleware/validate-request";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { BadRequestError } from "../../errors/bad-request-error";
import { RuleSet } from "../../models/rule-set";
import { validateRequest } from "../../middleware/validate-request";
import {logActivity} from "../../helper/log";

const express = require('express');
const router = express.Router();

router.post(
  "/api/rule-set/new",
  // currentUser,
  // requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    const { name, company, condition, isActive , objectName} = req.body;

    // Check if existing rule set
    const existingRuleSet = await RuleSet.findOne({ name , company:company});
    if (existingRuleSet != undefined) {
      throw new BadRequestError("Duplicate rule set");
    }

    const ruleSet = RuleSet.build({ name, company, condition, isActive, objectName });
    await ruleSet.save();
    res.status(201).send(ruleSet);
  }
);

export { router as createRuleSetRouter };

import {Request, Response} from "express";
import {NotFoundError} from "../../errors/not-found-error";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {Rule} from "../../models/rule";
import {RuleSet} from "../../models/rule-set";
import {logActivity} from "../../helper/log";

const express = require("express");
const router = express.Router();

router.delete(
    "/api/rule-set/:ruleSetId",
    // currentUser,
    // requireAuth,
    async (req: Request, res: Response) => {
      const {ruleSetId} = req.params;
      const ruleSet = await RuleSet.findByIdAndDelete(ruleSetId);
      console.log(ruleSet);
      if (!ruleSet) {
        throw new NotFoundError();
      }
      res.status(204).send(ruleSet);
    }
);

export {router as deleteRuleSetRouter};

import {Request, Response} from "express";
import {NotFoundError} from "../../errors/not-found-error";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {RuleAction} from "../../models/rule-action";
import {logActivity} from "../../helper/log";

const express = require("express");
const router = express.Router();

router.delete(
    "/api/rule-action/:ruleActionId",
    // currentUser,
    // requireAuth,
    async (req: Request, res: Response) => {
      const {ruleActionId} = req.params;
      const ruleAction = await RuleAction.findByIdAndDelete(ruleActionId);
      console.log(ruleAction);
      if (!ruleAction) {
        throw new NotFoundError();
      }

      res.status(204).send(ruleAction);
    }
);

export {router as deleteRuleActionRouter};

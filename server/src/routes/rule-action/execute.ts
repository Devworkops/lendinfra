import {Request, Response} from "express";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {EligibilityCheck} from "../../classes/EligibilityCheck";
import {BadRequestError} from "../../errors/bad-request-error";
import {Rule} from "../../models/rule";
import mongoose from "mongoose";
import {RuleAction} from "../../models/rule-action";
import {logActivity} from "../../helper/log";

const express = require("express");
const router = express.Router();

router.post(
    "/api/rule-action/execute?",
    // currentUser,
    // requireAuth,
    async (req: Request, res: Response) => {
      const {company} = req.body;

      try {
        if (req.currentUser && company) {
          const {action, ruleSetIds} = req.query;
          switch (action) {
            case "ELIGIBILITY_CHECK": {
              const ec = new EligibilityCheck(company, ruleSetIds?ruleSetIds as string:undefined);
              await ec.setup();
              await ec.execute();
              break;
            }
            default: {
              break;
            }
          }

          return res.send({message: "Eligibility Check is in progress"});
        } else {
          throw new BadRequestError("Invalid Company");
        }
      } catch (error) {
        console.log(error);
        return res.status(400).send({errors: [{message: (error as Error).message}]});
      }
    }
);

export {router as executeRuleActionRouter};

import {Request, Response} from "express";
import {NotFoundError} from "../../errors/not-found-error";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {Rule} from "../../models/rule";
import {logActivity} from "../../helper/log";

const express = require("express");
const router = express.Router();

router.delete(
    "/api/rule/:ruleId",
    // currentUser,
    // requireAuth,
    async (req: Request, res: Response) => {
      const {ruleId} = req.params;
      const rule = await Rule.findByIdAndDelete(ruleId);
      console.log(rule);
      if (!rule) {
        throw new NotFoundError();
      }

      res.status(204).send(rule);
    }
);

export {router as deleteRuleRouter};

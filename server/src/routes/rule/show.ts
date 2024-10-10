import {Request, Response} from "express";
import {
  NotFoundError,
} from "../../errors/not-found-error";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {Rule} from "../../models/rule";
import {logActivity} from "../../helper/log";

const express = require("express");
const router = express.Router();

router.get(
    "/api/rule/:id",
    // currentUser,
    // requireAuth,
    async (req: Request, res: Response) => {
      const rule = await Rule.findById(req.params.id);
      if (!rule) {
        throw new NotFoundError();
      }

      res.send(rule);
    }
);

export {router as showRuleDetailRouter};

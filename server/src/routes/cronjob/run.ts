import { Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { validateRequest } from "../../middleware/validate-request";
import express from 'express';
import calculateInterest from "../../classes/InterestCalculator";
const router = express.Router();

router.get(
  "/api/cronjob/run/calculateInterest",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {

    try {
        const calculateInterests = await calculateInterest();
        return res.status(200).send({ message: 'Cronjob run successfully' });
    } catch (error) {
        return res.status(500).send({ errors: [{ message: (error as Error).message }] });
    }
  }
);

export { router as calculateInterestRouter };

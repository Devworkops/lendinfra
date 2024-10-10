import express, {Request, Response} from "express";
import {NotFoundError} from "../../errors/not-found-error";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {Integration} from "../../models/integration";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.delete(
    "/api/integration/:integrationId",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
      try{
      const {integrationId} = req.params;
      const integration = await Integration.findById(integrationId);

      if (!integration) {
        throw new NotFoundError();
      }

      integration.isActive = false;
      await integration.save();

      res.status(204).send(integration);
    }catch (err) {
      console.log(err);
      res.status(400).send({ errors: [{ message: (err as Error).message }] });
    }
    }
);

export {router as deleteIntegrationRouter};

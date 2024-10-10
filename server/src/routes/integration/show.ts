import express, {Request, Response} from "express";
import {
  NotFoundError,
} from "../../errors/not-found-error";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {Integration} from "../../models/integration";
import {logActivity} from "../../helper/log";
import { notfication } from "../../helper/notification";

const router = express.Router();

router.get(
    "/api/integration/:id",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
      const integration = await Integration.findById(req.params.id);
      
      if (!integration) {
        await notfication(req?.currentUser?.companyId, req.currentUser?.id, "intigration", "Something went wrong with "+req.body.name + "intigration", '');
        throw new NotFoundError();
      }

      res.send(integration);
    }
);

export {router as showIntegrationRouter};

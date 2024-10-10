import express, { Request, Response } from "express";
import {
    NotFoundError
} from "../../errors/not-found-error";
import { BadRequestError } from "../../errors/bad-request-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Notification } from "../../models/notifications";
import { count } from "console";

const router = express.Router();
router.get(
    "/api/notification",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
        let company_id = req.query.company_id;
        
        const perPage = parseInt(req.query.perPage as string) || 1;

        const now = new Date();
        
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const previousDate = new Date(startOfToday);
        previousDate.setDate(startOfToday.getDate() - 1);
        
        try {
            const totalDocuments = await Notification.countDocuments({ company: company_id,createdAt: { $gte: previousDate, $lte: now }
            });

            let notification = await Notification.find({ company: company_id, createdAt: { $gte: previousDate, $lte: now }}).sort({ createdAt: -1 }).limit(perPage);
            let getNotificationCount = await Notification.countDocuments({ company: company_id, is_read:0, createdAt: { $gte: previousDate, $lte: now }})
            return res.send({ 
                count: getNotificationCount, 
                messages: notification,
                total_notification: totalDocuments,
            });
        }
        catch (error) {
            return res.send({ errors: [{ messages: (error as Error).message }] });
        };
    }
);

export { router as getNotificationListRouter };

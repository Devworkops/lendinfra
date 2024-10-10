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
    "/api/notification/all/read",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
        let company_id = req.query.company_id;
        const perPage = parseInt(req.query.perPage as string) || 5;

        const now = new Date();
        
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const previousDate = new Date(startOfToday);
        previousDate.setDate(startOfToday.getDate() - 1)

        try {
            const notification = await Notification.updateMany(
                { is_read: 0 },
                { $set: { is_read: 1 } }
            );
            let getNotification = await Notification.find({ company: company_id, createdAt: { $gte: previousDate, $lte: now }}).sort({ createdAt: -1 }).limit(perPage)
            let getNotificationCount = await Notification.countDocuments({ company: company_id, is_read:0, createdAt: { $gte: previousDate, $lte: now }})

            if (!notification) {
                return res.status(404).send({ errors: 'Something went wrong with Notification' });
            }
            return res.status(200).send({ count: getNotificationCount, messages: getNotification });
        }
        catch (error) {
            return res.status(500).send({ errors: 'Something went wrong', status:false });

        };
    }
);

export { router as markNotificationRouter };

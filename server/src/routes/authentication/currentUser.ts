import express from "express";
import {currentUser} from "../../middleware/current-user";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.get("/api/users/currentuser", currentUser, (req, res) => {
    res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };

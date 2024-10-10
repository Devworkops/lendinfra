import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { BadRequestError } from "../../errors/bad-request-error";
import { validateRequest } from "../../middleware/validate-request";
import { Datamodel } from "../../models/data-model";
import { Note } from "../../models/note";
import {logActivity} from "../../helper/log";

import express from 'express';
import { activity } from "../../helper/activity";
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.post(
  "/api/note/new",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
      const { comment, reference, referenceId, recordId, company, createdBy} = req.body;
      const note = Note.build({ comment, reference, referenceId, recordId, company, createdBy});
        await logActivity(company_id, user_id, "Notes", "Note Request " + req.body.toString());
      await note.save();
      if (note) {
        console.log("note***********************************",note)
        await activity(recordId, company_id, user_id, 'Application', `New Note Created "${note.comment}"`,note );
        await logActivity(company_id, user_id, "Notes", "Note created successfully.");
      } else {
        await logActivity(company_id, user_id, "Notes", "Something went wrong with Note creaton");
      }

      res.status(201).send(note);
    } catch (error) {
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
        await logActivity(company_id, user_id, "Notes", "Error while creating notes.");
      console.log((error as Error).message);
      console.log((error as Error).stack);
      throw (error as Error).message;
    }
  }
);

export { router as createNoteRouter };

import { Request, Response } from "express";
import { FilterQuery, PaginateOptions } from "mongoose";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Note, NoteDoc } from "../../models/note";
import { logActivity } from "../../helper/log";

const defaultMaxPageSize = "100";

// Here we will fetch all general ledger for a company
import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

interface RequestParams {
  companyId?: string
}

interface RequestQuery {
  createdBy?: string,
  isActive?: boolean,
  reference?: string,
  referenceId?: string,
  recordId?: string,
  pageToken?: string,
  maxPageSize?: string,
}

router.get(
  "/api/note/all/:companyId?",
  currentUser,
  requireAuth,
  async (
    req: Request<RequestParams, unknown, unknown, RequestQuery>,
    res: Response) => {
    const { createdBy, isActive, reference, referenceId, recordId } = req.query;
    const { pageToken, maxPageSize = defaultMaxPageSize } = req.query;
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;
    const query: FilterQuery<NoteDoc> = {
      company: req.params.companyId,
      isActive: true
    };

    try {
      if (!query.company) {
        await logActivity(company_id, user_id, "Notes", "Company not found.");
        return res.sendStatus(400);
      }
      if (pageToken && parseInt(pageToken) < 1) {
        await logActivity(company_id, user_id, "Notes", "Page Token is less than 1.");
        return res.sendStatus(400);
      }

      if (maxPageSize && parseInt(maxPageSize) < 1) {
        await logActivity(company_id, user_id, "Notes", "Maximum Page Size is less than 1.");
        return res.sendStatus(400);
      }

      if (req.query.reference) {
        query.reference = req.query.reference
      }

      if (req.query.referenceId) {
        query.referenceId = req.query.referenceId
      }

      if (req.query.recordId) {
        query.recordId = req.query.recordId
      }

      const pathsToPopulate = [''];

      const offset = pageToken && parseInt(pageToken) > 1 ? (parseInt(pageToken) - 1) * parseInt(maxPageSize) : 0
      const limit = parseInt(maxPageSize)
      await logActivity(company_id, user_id, "Notes", "Request Query: " + req.query.toString());

      const paginationOptions: PaginateOptions = {
        ...(pageToken ? {
          offset,
          limit,
        } : {
          pagination: false,
        }),
        sort: {
          createdAt: -1
        },
      };

      try {
        const {
          docs,
          hasNextPage,
          totalPages,
          totalDocs,
        } = await Note.paginate(query, paginationOptions);
        await logActivity(company_id, user_id, "Notes", "Notes fetched successfully: " + totalDocs.toString());

        return res.send({
          results: docs,
          hasNextPage,
          totalPages,
          totalResults: totalDocs,
        });
      } catch {
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
        await logActivity(company_id, user_id, "Notes", "Error while fetching notes.");
        return res.sendStatus(500);
      }

    } catch (error) {
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      await logActivity(company_id, user_id, "Notes", "Error while fetching notes.");
      console.log(error);
      return res.send({ message: error });
    }
  }
);

export { router as allNoteRouter };

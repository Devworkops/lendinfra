import express, { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { DataRecord } from "../../models/data-record";

const router = express.Router();

const mappedObjectNames = (objectName: string) => {
  if (objectName === 'Account') {
      return ['IndividualAccount', 'BusinessAccount'];
  }
  return [objectName];
};

router.get(
  "/api/datarecords/search/:objectName/:qry",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const company_id = req.currentUser?.companyId;
    const { qry, objectName } = req.params;

    console.log(objectName, qry, company_id)

    if (!qry) {
        res.status(200).send({ message: 'Search query is missing' });
        return;
    }

    try {
      const searchCriteria = {
        $or: [
          { recordId: { $regex: qry, $options: 'i' } },
          { 'fields.FirstName': { $regex: qry, $options: 'i' } },
          { 'fields.LastName': { $regex: qry, $options: 'i' } },
          { 'fields.Email': { $regex: qry, $options: 'i' } },
          { 'fields.Phone': { $regex: qry, $options: 'i' } },
          { 'fields.PhoneNumber': { $regex: qry, $options: 'i' } },
        ],
        objectName: { $in: mappedObjectNames(objectName) },
        company: company_id,
      };

      const dataRecords = await DataRecord.find(searchCriteria)

      if(dataRecords.length > 100) {
        res.status(200).send({message: 'Exceeded 100 records in search results. Please refine your query to narrow down results'})
        return;
      }

      res.status(200).send(dataRecords);
    } catch (error) {
      console.error('Error fetching data records:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }
);

export { router as search };

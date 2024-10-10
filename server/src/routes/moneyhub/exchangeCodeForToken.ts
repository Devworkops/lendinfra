import { moneyHubClient } from "../../Integrations/Interface/moneyhub/MoneyhubConfig";
import express, {Request, Response} from 'express';
import {logActivity} from "../../helper/log";

const router = express.Router();

router.post('/api/moneyhub/exchangeTokens', async (req: Request, res: Response) => {
  try {
    const moneyhub = await moneyHubClient();

    const {code, id_token, state} = req.body;
    console.log(code, id_token , state)
    const { id_token: vrpIdToken } = await moneyhub.exchangeCodeForTokens({
      paramsFromCallback: {
        code: code,
        state: state,
        id_token: id_token,
      },
      localParams: {
        state: "state-value",
        nonce: "nonce-value",
      },
    });

    console.log(id_token);

    res.status(200).send({ id_token: vrpIdToken });
    return;
  } catch (error) {
    console.error('Error exchanging tokens:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export { router as exchangeCodeForToken };

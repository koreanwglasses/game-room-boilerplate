import { NextApiRequest } from "next";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {id} = req.query;
  res.status(200).send("OK");
}
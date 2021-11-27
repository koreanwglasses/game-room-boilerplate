import { NextApiRequest } from "next";
import { subscribe } from "../../../../../lib/subscriptions";
import { validateSocket } from "../../../../../lib/validate-socket-ids";
import { updateMe, validateMe } from "../../../../../models/room";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    const socketId = await validateSocket(req, res);
    if (!socketId) return;

    const dataKey = `/api/game/room/${id}/me#${socketId}`;
    if (req.query.subscribe === "true") {
      await subscribe(req, res, dataKey);
    }

    const me = await validateMe(req, res, id as string);
    return res.json({ me, dataKey });
  }

  if (req.method === "POST") {
    if (!(await updateMe(req, res, id as string, req.body.me))) return;
    
    return res.status(200).send("OK");
  }

  return res.status(501).send("Not Implemented");
}

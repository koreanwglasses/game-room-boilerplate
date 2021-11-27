import { NextApiRequest } from "next";
import { subscribe } from "../../../../../lib/subscriptions";
import { validateSocket } from "../../../../../lib/validate-socket-ids";
import { validateMe } from "../../../../../models/room";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const socketId = await validateSocket(req, res);
  if (!socketId) return;

  const dataKey = `/api/game/room/${id}/me#${socketId}`;
  if (req.query.subscribe === "true" || req.body.subscribe === "true") {
    await subscribe(req, res, dataKey);
  }

  const me = await validateMe(req, res, id as string);
  return res.json({ me, dataKey });
}

import { NextApiRequest } from "next";
import { subscribe } from "../../../../../lib/subscriptions";
import { validateRoom } from "../../../../../models/room";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const dataKey = `/api/game/room/${id}`;

  if (req.query.subscribe === "true" || req.body.subscribe === "true") {
    await subscribe(req, res, dataKey);
  }

  const room = await validateRoom(req, res, id as string);
  if (!room) return;

  return res.json({ room, dataKey });
}

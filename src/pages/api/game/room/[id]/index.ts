import { NextApiRequest } from "next";
import { subscribe } from "../../../../../lib/subscriptions";
import {
  updateRoom,
  validateMe,
  validateRoom,
} from "../../../../../models/room";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    const dataKey = `/api/game/room/${id}`;
    if (req.query.subscribe === "true") {
      await subscribe(req, res, dataKey);
    }

    const room = await validateRoom(req, res, id as string);
    if (!room) return;
    return res.json({ room, dataKey });
  }

  if (req.method === "POST") {
    const me = await validateMe(req, res, id as string);
    if (!me) return;

    if (!me.isHost)
      return res.status(403).send("Only the host can edit the room");

    if (!(await updateRoom(req, res, id as string, req.body.room))) return;
    return res.status(200).send("OK");
  }

  return res.status(501).send("Not Implemented");
}

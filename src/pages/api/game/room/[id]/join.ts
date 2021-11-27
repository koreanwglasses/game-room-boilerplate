import { NextApiRequest } from "next";
import { joinRoom, validateRoom } from "../../../../../models/room";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const room = await validateRoom(req, res, id as string);
  if (!room) return;

  const playerName = req.body.playerName;
  if (typeof playerName !== "string")
    return res.status(400).send("Invalid player name");

  if (room.players.length >= 6)
    return res.json({ status: "rejected", reason: "Room is full" });

  if (!(await joinRoom(req, res, id as string, { playerName }))) return;

  return res.json({ status: "success" });
}

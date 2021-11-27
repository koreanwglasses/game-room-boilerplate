import { NextApiRequest } from "next";
import dbConnect from "../../../../lib/database";
import { joinRoom, Room } from "../../../../models/room";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const room = new Room({});
  await room.save();

  if (!(await joinRoom(req, res, room._id, { isHost: true }))) return;

  return res.json(room);
}

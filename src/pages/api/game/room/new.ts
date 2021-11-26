import { NextApiRequest } from "next";
import dbConnect from "../../../../lib/database";
import { Room } from "../../../../models/room";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const room = new Room({});
  await room.save();

  return res.json(room);
}

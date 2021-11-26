import { NextApiRequest } from "next";
import dbConnect from "../../../../../lib/database";
import { Room } from "../../../../../models/room";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  await dbConnect();

  const room = await Room.findById(id).exec();

  if (!room) return res.status(400).send("Invalid room id");

  return res.json(room);
}

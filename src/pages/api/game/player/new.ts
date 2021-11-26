import { NextApiRequest } from "next";
import dbConnect from "../../../../lib/database";
import { getSession } from "../../../../lib/get-session";
import { Player } from "../../../../models/player";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { displayName } = req.body;

  const session = await getSession(req, res);

  await dbConnect();

  const player = new Player({ displayName });
  session.playerId = player._id;
  
  await player.save();

  return res.json(player);
}
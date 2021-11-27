import { NextApiRequest } from "next";
import dbConnect from "../../../../../lib/database";
import { notify } from "../../../../../lib/subscriptions";
import { validateSocket } from "../../../../../lib/validate-socket-ids";
import { Room, validateRoom } from "../../../../../models/room";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get params and check for validity

  const socketId = await validateSocket(req, res);
  if (!socketId) return socketId;

  await dbConnect();

  const { id } = req.query;
  const room = await validateRoom(req, res, id as string);
  if (!room) return;

  if (room.players.length >= 6)
    return res.json({ status: "rejected", reason: "Room is full" });

  const playerName = req.body.playerName;
  if (typeof playerName !== "string")
    return res.status(400).send("Invalid player name");

  // Execute changes
  {
    const dataKey = `/api/game/room/${id}`;
    const room = await Room.findByIdAndUpdate(
      id,
      {
        $push: { players: [{ name: playerName, socketId }] },
      },
      { new: true }
    )
      .lean()
      .exec();
      
    notify(res, dataKey);

    const player = room!.players.pop()!;

    const io = res.socket.server.io;
    io.sockets.sockets.get(socketId)!.on("disconnect", () => {
      Room.findByIdAndUpdate(id, {
        $pull: { players: { _id: player._id } },
      }).exec();

      notify(io, dataKey);
    });
  }

  return res.json({ status: "success" });
}

import mongoose, { Model } from "mongoose";
import { NextApiRequest } from "next";
import dbConnect from "../lib/database";

export interface Room {
  _id: string;
  name: string;
  players: {
    _id: string;
    name: string;

    socketId: string; // Private
  }[];
}

const schema = new mongoose.Schema<Room>({
  name: String,
  players: [{ name: String, socketId: String }],
});

export const Room = (mongoose.models.Room ||
  mongoose.model("Room", schema)) as Model<Room>;

export async function validateRoom(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  await dbConnect();

  const room = await Room.findById(id).exec();
  if (!room) return res.status(400).send("Invalid room id");

  // Prune disconnected players
  const io = res.socket.server.io;
  room.players = room.players.filter(
    (player) => io.sockets.sockets.get(player.socketId)?.connected
  );
  await room.save();

  return await Room.findById(id, "-player.socketId").exec();
}

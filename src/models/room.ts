import mongoose, { Model } from "mongoose";
import { NextApiRequest } from "next";
import dbConnect from "../lib/database";
import { getSession } from "../lib/get-session";
import { notify } from "../lib/subscriptions";
import { validateSocket } from "../lib/validate-socket-ids";

export interface Room {
  _id: string;
  name: string;
  players: {
    _id: string;
    name: string;

    socketId: string; // Private
    sessionId: string; // Private
    lastDisconnect: Date | null;
  }[];
}

const schema = new mongoose.Schema<Room>({
  name: String,
  players: [
    { name: String, socketId: String, sessionId: String, lastDisconnect: Date },
  ],
});

export const Room = (mongoose.models.Room ||
  mongoose.model("Room", schema)) as Model<Room>;

export async function validateRoom(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  await dbConnect();

  let room = await Room.findById(id).exec();
  if (!room) return res.status(400).send("Invalid room id");

  const session = await getSession(req, res);
  const socketId = await validateSocket(req, res);
  if (!socketId) return;

  const io = res.socket.server.io;

  let changed = false;
  room.players.forEach((player) => {
    // Timeout disconnected players
    if (
      !player.lastDisconnect &&
      !io.sockets.sockets.get(player.socketId)?.connected
    ) {
      player.lastDisconnect = new Date(Date.now());
      changed = true;
    }
    // Revive reconnected players
    if (
      player.lastDisconnect &&
      +player.lastDisconnect + 1000 * 30 > Date.now() &&
      player.sessionId === session.id
    ) {
      player.lastDisconnect = null;
      player.socketId = socketId;
      changed = true;
    }
  });

  // Prune disconnected players
  room.players = room.players.filter(
    (player) =>
      !player.lastDisconnect || +player.lastDisconnect + 1000 * 30 > Date.now()
  );
  await room.save();

  // Filter out private props
  room = await Room.findById(id)
    .select("-players.socketId -players.sessionId")
    .exec();

  // Notify subscribers if changes were made
  const dataKey = `/api/game/room/${id}`;
  if (changed) notify(io, dataKey);

  return room;
}

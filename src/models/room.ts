import mongoose, { Model } from "mongoose";
import { NextApiRequest } from "next";
import { Server } from "socket.io";
import dbConnect from "../lib/database";
import { getSession } from "../lib/get-session";
import { notify } from "../lib/subscriptions";
import { validateSocket } from "../lib/validate-socket-ids";

export interface Player {
  _id: string;
  name: string;
  isHost: boolean;

  cards: string[];
  numCards: number;

  lastDisconnect: Date | null;
  socketId?: string; // Private
  sessionId?: string; // Private
}

export interface Room {
  _id: string;
  name: string;
  players: Player[];
}

const schema = new mongoose.Schema<Room>({
  name: String,
  players: [
    {
      name: String,
      isHost: Boolean,

      cards: [String],

      lastDisconnect: Date,
      socketId: String,
      sessionId: String,
    },
  ],
});

export const Room = (mongoose.models.Room ||
  mongoose.model("Room", schema)) as Model<Room>;

function handleDisconnect(
  io: Server,
  {
    roomId,
    socketId,
    playerId,
  }: { roomId: string; socketId: string; playerId: string }
) {
  const dataKey = `/api/game/room/${roomId}`;
  io.sockets.sockets.get(socketId)!.on("disconnect", async () => {
    await Room.findByIdAndUpdate(
      roomId,
      {
        $set: { "players.$[id].lastDisconnect": new Date(Date.now()) },
      },
      { arrayFilters: [{ id: { _id: playerId } }] }
    ).exec();

    notify(io, dataKey);
  });
}

export async function validateRoom(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  includePrivateFields = false
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
      !io.sockets.sockets.get(player.socketId!)?.connected
    ) {
      player.lastDisconnect = new Date(Date.now());
      changed = true;
    }
    // Revive reconnected players
    if (
      player.lastDisconnect &&
      +player.lastDisconnect + 1000 * 30 > Date.now() &&
      player.sessionId === session.id &&
      !room!.players.find((player) => player.socketId === socketId) // Only one revive per socket
    ) {
      player.lastDisconnect = null;
      player.socketId = socketId;
      handleDisconnect(io, { roomId: id, socketId, playerId: player._id });
      changed = true;
    }
  });

  // Prune disconnected players
  room.players = room.players.filter(
    (player) =>
      !player.lastDisconnect || +player.lastDisconnect + 1000 * 30 > Date.now()
  );

  await room.save();

  if (!includePrivateFields) {
    // Filter out private props
    room = await Room.findById(id)
      .select("-players.socketId -players.sessionId -players.cards")
      .exec();
  }

  // Notify subscribers if changes were made
  const dataKey = `/api/game/room/${id}`;
  if (changed) notify(io, dataKey);

  return room;
}

export async function updateRoom(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  room: { name: string }
) {
  await dbConnect();

  await Room.findByIdAndUpdate(id, {
    $set: { name: room.name },
  }).exec();

  const dataKey = `/api/game/room/${id}`;
  notify(res, dataKey);

  return true;
}

export async function joinRoom(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  { playerName, isHost }: { playerName?: string; isHost?: boolean }
) {
  await dbConnect();

  const session = await getSession(req, res);
  const socketId = await validateSocket(req, res);
  if (!socketId) return;

  const room = await Room.findByIdAndUpdate(
    id,
    {
      $push: {
        players: [
          { name: playerName, isHost, socketId, sessionId: session.id },
        ],
      },
    },
    { new: true }
  )
    .lean()
    .exec();

  const dataKey = `/api/game/room/${id}`;
  const meDataKey = `/api/game/room/${id}/me#${socketId}`;
  notify(res, dataKey);
  notify(res, meDataKey);

  const player = room!.players.pop()!;

  const io = res.socket.server.io;
  handleDisconnect(io, { roomId: id, socketId, playerId: player._id });

  return true;
}

export async function validateMe(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  const socketId = await validateSocket(req, res);
  if (!socketId) return;

  const room = await validateRoom(req, res, id, true);
  if (!room) return;

  const me = room.players.find((player) => player.socketId === socketId);
  if (me) {
    delete me["socketId"];
    delete me["sessionId"];
  }
  return me;
}

export async function updateMe(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string,
  me: Player
) {
  await dbConnect();

  const socketId = await validateSocket(req, res);
  if (!socketId) return;

  await Room.findByIdAndUpdate(
    id,
    {
      $set: { "players.$[me].name": me.name },
    },
    { arrayFilters: [{ "me.socketId": socketId }] }
  ).exec();

  const dataKey = `/api/game/room/${id}`;
  const meDataKey = `/api/game/room/${id}/me#${socketId}`;
  notify(res, dataKey);
  notify(res, meDataKey);

  return true;
}

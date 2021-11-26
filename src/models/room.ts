import mongoose, { Model } from "mongoose";

export interface Room {
  _id: string;
  name: string;
  players: {
    _id: string;
    name: string;
  }[];
}

const schema = new mongoose.Schema<Room>({
  name: String,
  players: [{ name: String }],
});

export const Room = (mongoose.models.Room ||
  mongoose.model("Room", schema)) as Model<Room>;

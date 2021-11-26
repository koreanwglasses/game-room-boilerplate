import mongoose, { Model } from "mongoose";

export interface Player {
  _id: string;
  displayName: string;
}

const schema = new mongoose.Schema<Player>({
  displayName: String,
});

export const Player = (mongoose.models.Player ||
  mongoose.model("Player", schema)) as Model<Player>;

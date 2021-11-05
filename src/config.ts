import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL || ""
mongoose.connect(MONGO_URL);

mongoose.set("toObject", { useProjection: true })
mongoose.set("toJSON", { useProjection: true })

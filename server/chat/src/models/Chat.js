import mongoose, { Schema } from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "user is required"],
      },
    ],
    latestMsg: {
      text: { type: String },
      sender: { type: Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;

import mongoose, { Schema } from "mongoose";

const schema = new mongoose.Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "chatId is required!"],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "sender is required!"],
    },
    text: { type: String },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    messageType: { type: String, enum: ["text", "image"], default: "text" },
    seen: { type: Boolean, default: false },
    seenAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", schema);

export default Message;

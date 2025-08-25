import { getReciverSocketId, io } from "../config/socket.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import TryCatch from "../utils/TryCatch.js";
import mongoose from "mongoose";

const createNewChat = TryCatch(async (req, res) => {
  const userId = req.user?._id;
  const { otherUserId } = req.body;

  if (!otherUserId) {
    res.status(400).json({ message: "Invalid Other UserId required" });
    return;
  }

  const existingChat = await Chat.findOne({
    users: {
      $all: [
        new mongoose.Types.ObjectId(userId),
        new mongoose.Types.ObjectId(otherUserId),
      ],
      $size: 2,
    },
  });

  if (existingChat) {
    res
      .status(400)
      .json({ message: "Already Chat Exists", chatId: existingChat._id });
    return;
  }

  const newChat = await Chat.create({
    users: [
      new mongoose.Types.ObjectId(userId),
      new mongoose.Types.ObjectId(otherUserId),
    ],
  });

  res.status(201).json({ message: "new Chat created", chatId: newChat._id });
});

const getAllChats = TryCatch(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(400).json({ message: "userId Missing" });
    return;
  }

  const chats = await Chat.find({
    users: new mongoose.Types.ObjectId(userId),
  }).sort({ updatedAt: -1 });

  const chatWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find(
        (id) => id.toString() !== userId?.toString()
      );

      const unseenCount = await Message.countDocuments({
        chatId: chat._id,
        sender: { $ne: userId },
        seen: false,
      });

      try {
        // Get user data from the same database
        const otherUser = await User.findById(otherUserId);

        if (!otherUser) {
          return {
            user: { _id: otherUserId, name: "Unknown User" },
            chat: {
              ...chat.toObject(),
              latestMsg: chat.latestMsg || null,
              unseenCount,
            },
          };
        }

        return {
          user: otherUser,
          chat: {
            ...chat.toObject(),
            latestMsg: chat.latestMsg || null,
            unseenCount,
          },
        };
      } catch (error) {
        console.log("Error getting user data:", error);
        return {
          user: { _id: otherUserId, name: "Unknown User" },
          chat: {
            ...chat.toObject(),
            latestMsg: chat.latestMsg || null,
            unseenCount,
          },
        };
      }
    })
  );

  res.status(200).json({ chat: chatWithUserData });
});

const sendMessage = TryCatch(async (req, res) => {
  const senderId = req.user?._id;
  const { chatId, text } = req.body;
  const imgfile = req.file;

  if (!chatId) {
    res.status(400).json({ message: "chatId is required!" });
    return;
  }

  if (!text && !imgfile) {
    res.status(400).json({ message: "Either text & image is required!" });
    return;
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(400).json({ message: "chatId not found!" });
    return;
  }

  const isUserInChat = chat.users.some((userId) => {
    return userId.toString() === senderId?.toString();
  });

  if (!isUserInChat) {
    res
      .status(400)
      .json({ message: "you are not a participant of this chat!" });
    return;
  }

  const otherUserId = chat.users.find((userId) => {
    return userId.toString() !== senderId?.toString();
  });

  if (!otherUserId) {
    res.status(400).json({ message: "No Other User!" });
    return;
  }

  //!socket setup
  const reciverSocketId = getReciverSocketId(otherUserId.toString());
  let isReciverInChatRoom = false;

  if (reciverSocketId) {
    const reciverSocket = io.sockets.sockets.get(reciverSocketId);

    if (reciverSocket && reciverSocket.rooms.has(chatId)) {
      isReciverInChatRoom = true;
    }
  }

  let messageData = {
    chatId: chatId,
    sender: new mongoose.Types.ObjectId(senderId),
    seen: isReciverInChatRoom,
    seenAt: isReciverInChatRoom ? new Date() : undefined,
  };

  if (imgfile) {
    messageData.image = { url: imgfile.path, publicId: imgfile.filename };
    messageData.messageType = "image";
    messageData.text = text || "";
  } else {
    messageData.text = text;
    messageData.messageType = "text";
  }

  const newMessage = new Message(messageData);
  const savedMsg = await newMessage.save();

  const latestMsg = imgfile ? "Image 📸" : text;

  await Chat.findByIdAndUpdate(
    chatId,
    {
      latestMsg: {
        text: latestMsg,
        sender: new mongoose.Types.ObjectId(senderId),
      },
      updatedAt: new Date(),
    },
    { new: true }
  );

  //! socket emit - only emit to chat room to prevent duplicates
  io.to(chatId).emit("newMessage", savedMsg);

  // Remove duplicate emissions - the chat room emission is sufficient
  // if (reciverSocketId) {
  //   io.to(reciverSocketId).emit("newMessage", savedMsg);
  // }

  // const senderSocketId = getReciverSocketId(senderId?.toString() || "");

  // if (senderSocketId) {
  //   io.to(senderSocketId).emit("newMessage", savedMsg);
  // }

  // Simplified seen status - will be handled when user opens the chat
  // if (isReciverInChatRoom && senderSocketId) {
  //   io.to(senderSocketId).emit("messageseen", {
  //     chatId: chatId,
  //     seenBy: otherUserId,
  //     messageIds: [savedMsg._id],
  //   });
  // }

  res.status(201).json({ message: savedMsg, sender: senderId });
});

const getMessageByChat = TryCatch(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user?._id;

  if (!chatId) {
    res.status(400).json({ message: "chatId is required!" });
    return;
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404).json({ message: "chatId not found!" });
    return;
  }

  const isUserInChat = chat.users.some((user) => {
    return user.toString() === userId?.toString();
  });
  if (!isUserInChat) {
    res
      .status(400)
      .json({ message: "you are not a participant of this chat!" });
    return;
  }

  const messageToMarkSeen = await Message.find({
    chatId: chatId,
    sender: { $ne: new mongoose.Types.ObjectId(userId) },
    seen: false,
  });

  await Message.updateMany(
    {
      chatId: chatId,
      sender: { $ne: new mongoose.Types.ObjectId(userId) },
      seen: false,
    },
    {
      seen: true,
      seenAt: new Date(),
    }
  );

  const msgs = await Message.find({ chatId }).sort({ createdAt: 1 });

  const otherUserId = chat.users.find(
    (id) => id.toString() !== userId?.toString()
  );

  try {
    const otherUser = await User.findById(otherUserId);

    if (!otherUser) {
      res.status(400).json({ message: "No Other User!" });
      return;
    }

    //!socket
    if (messageToMarkSeen.length > 0) {
      const otherUserSocketId = getReciverSocketId(
        otherUserId?.toString() || ""
      );

      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit("messageSeen", {
          chatId: chatId,
          seenBy: userId,
          messageIds: messageToMarkSeen.map((msg) => msg._id),
        });
      }
    }

    res.status(200).json({ message: msgs, user: otherUser });
  } catch (error) {
    console.log(error);
    res
      .status(200)
      .json({ message: msgs, user: { _id: otherUserId, name: "unknown" } });
  }
});

export { createNewChat, getAllChats, sendMessage, getMessageByChat };

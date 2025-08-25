import { Socket, Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const userSocketMap = {};

export const getReciverSocketId = (reciverId) => {
  return userSocketMap[reciverId];
};

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to Socket ${socket.id}`);
  }

  io.emit("getOnlineUser", Object.keys(userSocketMap));

  if (userId) {
    socket.join(userId);
  }

  socket.on("typing", (data) => {
    console.log(`User ${data.userId} is typing n chat ${data.chatId}`);
    socket.to(data.chatId).emit("userTyping", {
      chatId: data.chatId,
      userId: data.userId,
    });
  });

  socket.on("stopTyping", (data) => {
    console.log(`user ${data.userId} Stopped Typing in Chat ${data.chatId}`);
    socket.to(data.chatId).emit("userStoppedTyping", {
      chatId: data.chatId,
      userId: data.userId,
    });
  });

  socket.on("jionChat", (chatId) => {
    socket.join(chatId);
    console.log(`user ${userId} jion chat joined room ${chatId}`);
  });

  socket.on("leaveChat", (chatId) => {
    socket.leave(chatId);
    console.log(`user ${userId} jion chat left room ${chatId}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);

    if (userId) {
      delete userSocketMap[userId];
      console.log(`UserId Removed from online user`);

      io.emit("getOnlineUser", Object.keys(userSocketMap));
    }
  });

  socket.on("connect_error", (err) => {
    console.log("Connection Error with Scoket:", err);
  });
});

export { app, server };

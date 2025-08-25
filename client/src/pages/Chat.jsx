import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import ChatSideBar from "../components/ChatSideBar";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import apiRoutes from "../utils/apiRoutes";
import { useSocket } from "../context/SocketProvider";
import { assets } from "../assets/assets";

function Chat() {
  const {
    isAuth,
    logout,
    chats,
    user: loginUser,
    users,
    fetchChat,
  } = useAuth();

  const [selectedUser, setSelectedUser] = useState(null);
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const { socket, onlineUsers } = useSocket();

  useEffect(() => {
    if (selectedChatId) {
      singlefetchChat();
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on("newMessage", (newMessage) => {
      if (newMessage.chatId === selectedChatId) {
        // Check if message already exists to prevent duplicates
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }
      // Refresh chat list to update latest message
      fetchChat();
    });

    // Listen for typing indicators
    socket.on("userTyping", (data) => {
      if (data.chatId === selectedChatId) {
        setIsTyping(true);
      }
    });

    socket.on("userStoppedTyping", (data) => {
      if (data.chatId === selectedChatId) {
        setIsTyping(false);
      }
    });

    // Listen for message seen updates
    socket.on("messageSeen", (data) => {
      if (data.chatId === selectedChatId) {
        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg._id)
              ? { ...msg, seen: true, seenAt: new Date() }
              : msg
          )
        );
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("messageSeen");
    };
  }, [socket, selectedChatId, fetchChat]);

  function handleLogoutUser() {
    logout();
  }

  async function createChat(user) {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        apiRoutes.createChat,
        { userId: loginUser?._id, otherUserId: user?._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedChatId(data.chatId);
      setSelectedUser(user);
      setShowAllUsers(false);
      await fetchChat();
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error.message;
      toast.error(errorMsg);
    }
  }

  async function singlefetchChat() {
    try {
      const token = Cookies.get("token");

      const { data } = await axios.get(
        `${apiRoutes.singleChatURI}/${selectedChatId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(data.messages || []);
      setSelectedUser(data.user);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error.message;
      toast.error(errorMsg);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!message.trim() || !selectedChatId) return;

    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        apiRoutes.sendMessage,
        { chatId: selectedChatId, text: message.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("");

      // Join chat room for real-time updates
      if (socket) {
        socket.emit("jionChat", selectedChatId);
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error.message;
      toast.error(errorMsg);
    }
  }

  function handleTyping() {
    if (socket && selectedChatId) {
      socket.emit("typing", { userId: loginUser?._id, chatId: selectedChatId });

      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout to stop typing indicator
      const timeout = setTimeout(() => {
        socket.emit("stopTyping", {
          userId: loginUser?._id,
          chatId: selectedChatId,
        });
        setIsTyping(false);
      }, 1000);

      setTypingTimeout(timeout);
    }
  }

  function handleChatSelect(chatId, user) {
    setSelectedChatId(chatId);
    setSelectedUser(user);
    setSideBarOpen(false);

    // Join chat room
    if (socket) {
      socket.emit("jionChat", chatId);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-900 overflow-hidden relative">
      <ChatSideBar
        sideBarOpen={sideBarOpen}
        setSideBarOpen={setSideBarOpen}
        showAllUsers={showAllUsers}
        setShowAllUsers={setShowAllUsers}
        users={users}
        loginUser={loginUser}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogoutUser={handleLogoutUser}
        createChat={createChat}
        onChatSelect={handleChatSelect}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-1 border-white/10">
        {selectedChatId && selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <img src={assets.circleIcon} alt="user" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    {selectedUser.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {onlineUsers.includes(selectedUser._id)
                      ? "🟢 Online"
                      : "⚫ Offline"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSideBarOpen(true)}
                className="sm:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                <img src={assets.menuIcon} alt="menu" className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  // Convert both IDs to strings for comparison
                  const msgSenderId = msg.sender?.toString();
                  const loginUserId = loginUser?._id?.toString();
                  const isOwnMessage = msgSenderId === loginUserId;

                  // Debug logging to see what's happening
                  console.log("Message alignment debug:", {
                    messageId: msg._id,
                    msgSender: msg.sender,
                    msgSenderId: msgSenderId,
                    loginUserId: loginUserId,
                    isOwnMessage: isOwnMessage,
                    msgText: msg.text,
                    comparison: `${msgSenderId} === ${loginUserId} = ${isOwnMessage}`,
                  });

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-200"
                        }`}
                      >
                        {msg.messageType === "image" && msg.image && (
                          <img
                            src={msg.image.url}
                            alt="message"
                            className="max-w-full rounded mb-2"
                          />
                        )}
                        {msg.text && <p>{msg.text}</p>}
                        <div className="text-xs mt-1 opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {isOwnMessage && (
                            <span className="ml-2">
                              {msg.seen ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400 mt-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg">
                    <p className="text-sm">Typing...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={sendMessage}
              className="p-4 border-t border-gray-700"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src={assets.messageCircle}
                  alt="chat"
                  className="w-8 h-8"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Welcome to ChatApp</h3>
              <p>
                Select a chat or start a new conversation to begin messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;

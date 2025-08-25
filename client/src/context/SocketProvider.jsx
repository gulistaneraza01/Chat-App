import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { io } from "socket.io-client";
import { chatServerURL } from "../utils/constraints";

const SocketContext = createContext({ socket: null });

function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io(chatServerURL, { query: { userId: user?._id } });
    setSocket(newSocket);

    newSocket.on("getOnlineUser", (users) => {
      console.log(users);
      setOnlineUsers(users);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

export default SocketProvider;

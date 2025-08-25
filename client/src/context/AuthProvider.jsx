import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiRoutes from "../utils/apiRoutes";
import Cookies from "js-cookie";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState(null);

  async function fetchUser() {
    try {
      const token = Cookies.get("token");

      const { data } = await axios(apiRoutes.profileURl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(data?.user);
      setIsAuth(true);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error.message;
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);
  }

  async function fetchChat() {
    try {
      const token = Cookies.get("token");

      const { data } = await axios(apiRoutes.allChatsURI, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(data.chat);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error.message;
      toast.error(errorMsg);
    }
  }

  async function fetchUsers() {
    try {
      const token = Cookies.get("token");
      const { data } = await axios(apiRoutes.usersURL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data.users);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error.message;
      toast.error(errorMsg);
    }
  }

  useEffect(() => {
    fetchUser();
    fetchChat();
    fetchUsers();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        loading,
        logout,
        fetchUsers,
        fetchChat,
        chats,
        setChats,
        users,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;

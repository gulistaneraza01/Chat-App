import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

function RequiedAuth({ children }) {
  const { isAuth } = useAuth();

  if (isAuth) {
    return children;
  }

  return <Navigate to={"/login"} replace />;
}

export default RequiedAuth;

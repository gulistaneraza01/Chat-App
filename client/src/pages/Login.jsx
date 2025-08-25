import { useState } from "react";
import { toast } from "react-toastify";
import apiRoutes from "../utils/apiRoutes";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import Loading from "../components/Loading";

function Login() {
  const { isAuth, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoader(true);

    try {
      const { data } = await axios.post(apiRoutes.loginURL, { email });

      toast.success(data.message);
      setEmail("");

      navigate(`/verifyemail?email=${email}`);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error.message;
      toast.error(errorMsg);
    } finally {
      setLoader(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (isAuth) {
    return navigate("/chat");
  }

  return (
    <div className="text-white min-h-screen flex justify-center items-center">
      <div className=" p-8 rounded-xl bg-gray-800 shadow-2xl">
        <form onSubmit={handleSubmit}>
          <h1 className="text-4xl font-bold ">Welcome To ChatApp</h1>
          <p className="text-gray-400 text-center mt-2 mb-6">
            Enter your email to continue your journey
          </p>
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Email</label>
            <input
              className="outline-none rounded text-lg p-2 bg-gray-700"
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              autoComplete="off"
              required
            />
          </div>
          <input
            className="mt-6 bg-blue-700 w-full rounded text-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            value="Send Verification Code"
            disabled={loader}
          />
        </form>
      </div>
    </div>
  );
}

export default Login;

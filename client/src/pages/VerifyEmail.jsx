import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiRoutes from "../utils/apiRoutes";
import Cookies from "js-cookie";
import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthProvider";
import Loading from "../components/Loading";

function VerifyEmail() {
  const { isAuth, setIsAuth, setUser, loading, fetchUsers, fetchChat } =
    useAuth();
  const [loader, setLoader] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef([]);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  function handleInput(index, value) {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasedData = e.clipboardData.getData("text");
    const digits = pasedData.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      const newOtp = digits.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("plz enter all input");
      toast.error("plz enter all input");
      return;
    }

    setError("");
    setLoader(true);

    try {
      const { data } = await axios.post(apiRoutes.verifyURL, {
        email,
        otp: otpString,
      });

      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 15,
        secure: true,
        path: "/",
      });

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      setUser(data.user);
      setIsAuth(true);
      fetchUsers();
      fetchChat();
      toast.success("verify otp");
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error.message;
      toast.error(errorMsg);
    } finally {
      setLoader(false);
    }
  }

  async function handleResendOtp() {
    setResendLoading(true);
    setError("");

    try {
      const { data } = await axios.post(apiRoutes.loginURL, {
        email,
      });
      toast.success(data.message);

      setTimer(60);
      console.log(data);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error.message;
      toast.error(errorMsg);
    } finally {
      setResendLoading(false);
    }
  }

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [timer]);

  if (loading) {
    return <Loading />;
  }

  if (isAuth) {
    return navigate("/chat");
  }

  return (
    <div className="text-white min-h-screen flex justify-center items-center">
      <div className=" p-8 rounded-xl bg-gray-800 shadow-2xl">
        <div className="relative">
          <p className="text-3xl absolute -top-3 left-1/2 cursor-pointer text-gray-200">
            <img
              src={assets.arrowLeft}
              alt="arrow left"
              onClick={() => {
                return navigate("/login");
              }}
            />
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8">
          <h1 className="text-4xl font-bold ">Verify Your Email</h1>
          <p className="text-gray-400 text-center mt-2 mb-6">
            we have send 6-digit code to
            <br />
            <span className="text-blue-500">{email}</span>
          </p>
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Enter your 6-digit input here</label>
            <div className="flex justify-center in-checked:space-x-3 gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInput(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12  text-center text-xl font-bold border-2 border-gray-600 rounded-lg bg-gray-700"
                />
              ))}
            </div>
          </div>
          {error && (
            <div className="mt-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          <input
            className="mt-6 bg-blue-700 w-full rounded text-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            value="Send Verification Code"
            disabled={loader}
          />
        </form>
        <div className="mt-6 text-gray-500 text-center">
          <p className="mb-2">Don't recive the code?</p>
          {timer > 0 ? (
            <p>Resend Code in {timer} seconds</p>
          ) : (
            <button
              disabled={resendLoading}
              className="text-blue-600"
              onClick={handleResendOtp}
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;

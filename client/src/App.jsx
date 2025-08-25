import {
  Route,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";
import { Chat, Error, Login, VerifyEmail, Home } from "./pages";
import RootElement from "./layouts/RootElement";
import { ToastContainer } from "react-toastify";
import RequiedAuth from "./hooks/RequiedAuth";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootElement />}>
      <Route
        index
        element={
          <RequiedAuth>
            <Home />
          </RequiedAuth>
        }
      />
      <Route
        path="/chat"
        element={
          <RequiedAuth>
            <Chat />
          </RequiedAuth>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/verifyemail" element={<VerifyEmail />} />
      <Route path="*" element={<Error />} />
    </Route>
  )
);

function App() {
  return (
    <div>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}

export default App;

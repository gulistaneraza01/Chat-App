import { Outlet } from "react-router-dom";

function RootElement() {
  return <div className="bg-gray-900 text-gray-200">{<Outlet />}</div>;
}

export default RootElement;

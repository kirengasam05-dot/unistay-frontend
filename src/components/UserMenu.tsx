import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleUserRound, Globe } from "lucide-react";
import { getUser, logoutUser } from "../lib/authStorage";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = getUser();

  function logout() {
    logoutUser();
    navigate("/login");
  }

  return (
    <div className="relative flex items-center gap-4">
      <button className="flex items-center gap-2 rounded-full border bg-white px-7 py-3 font-bold shadow-sm">
        <Globe size={18} />
        USD
      </button>

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center rounded-full border bg-white px-7 py-3 shadow-sm"
      >
        <CircleUserRound size={28} className="text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 top-16 z-50 w-80 rounded-3xl bg-white p-5 shadow-xl">
          <div className="rounded-2xl bg-gray-50 p-4">
            <h3 className="font-bold text-gray-900">
              {user?.fullName || "Not logged in"}
            </h3>
            <p className="mt-1 text-sm uppercase text-gray-500">
              {user?.role || "GUEST"}
            </p>
          </div>

          <div className="mt-5 space-y-2">
            <Link className="block rounded-2xl px-4 py-3 font-bold hover:bg-gray-100" to="/">
              Home
            </Link>

            {user && (
              <Link className="block rounded-2xl bg-gray-100 px-4 py-3 font-bold" to="/dashboard">
                Dashboard
              </Link>
            )}

            {!user ? (
              <Link className="block rounded-2xl px-4 py-3 font-bold hover:bg-gray-100" to="/login">
                Login
              </Link>
            ) : (
              <button onClick={logout} className="w-full rounded-2xl px-4 py-3 text-left font-bold hover:bg-gray-100">
                Logout
              </button>
            )}
          </div>

          <div className="my-5 border-t" />

          <Link className="block px-4 py-3 font-bold" to="/help">
            Help Center
          </Link>
        </div>
      )}
    </div>
  );
}
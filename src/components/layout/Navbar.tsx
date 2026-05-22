import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, User } from "lucide-react";
import { getUser, logoutUser } from "../../lib/authStorage";

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const logout = () => {
    logoutUser();
    setMenuOpen(false);
    navigate("/login");
    window.location.reload();
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-black">
          UniStay+
        </Link>

        <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <NavLink to="/housing">Housing</NavLink>
          <NavLink to="/jobs">Jobs</NavLink>
          <NavLink to="/skills">Skills</NavLink>
          <NavLink to="/process">Process</NavLink>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm transition hover:shadow-md"
            aria-label="Open menu"
          >
            {menuOpen
              ? <Menu size={18} />
              : user
                ? <span className="text-sm font-bold">{user.fullName.charAt(0).toUpperCase()}</span>
                : <User size={18} />
            }
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
              {user ? (
                <>
                  <div className="flex items-center gap-3 bg-neutral-50 px-5 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-neutral-900">{user.fullName}</p>
                      <p className="truncate text-xs text-neutral-500">{user.email}</p>
                      <span className="mt-1 inline-block rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-semibold uppercase text-neutral-700">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </button>

                    <div className="my-2 border-t border-neutral-100" />

                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-2">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
                  >
                    Create an account
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
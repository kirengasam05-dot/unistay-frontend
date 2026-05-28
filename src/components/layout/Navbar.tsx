import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { getUser, logoutUser } from "../../lib/authStorage";
import { useTheme } from "../../lib/themeContext";

const NAV_LINKS = ["Housing", "Jobs", "Skills", "Process"] as const;

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
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
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="text-xl font-black text-neutral-900 dark:text-white sm:text-2xl">
          UniStay+
        </Link>

        {/* desktop nav links */}
        <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
          {NAV_LINKS.map((label) => (
            <NavLink
              key={label}
              to={`/${label.toLowerCase()}`}
              className={({ isActive }) =>
                isActive
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* dark mode toggle */}
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* avatar / burger */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm transition hover:shadow-md dark:bg-white dark:text-neutral-900"
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
              <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">

                {/* mobile-only nav links */}
                <div className="border-b border-neutral-100 p-2 dark:border-neutral-800 md:hidden">
                  {NAV_LINKS.map((label) => (
                    <NavLink
                      key={label}
                      to={`/${label.toLowerCase()}`}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          isActive
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                            : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
                </div>

                {/* user section */}
                {user ? (
                  <>
                    <div className="flex items-center gap-3 bg-neutral-50 px-5 py-4 dark:bg-neutral-800">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white dark:bg-white dark:text-neutral-900">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-neutral-900 dark:text-white">{user.fullName}</p>
                        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                        <span className="mt-1 inline-block rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-semibold uppercase text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        <LayoutDashboard size={18} />
                        Dashboard
                      </button>

                      <div className="my-2 border-t border-neutral-100 dark:border-neutral-700" />

                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40"
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
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      Create an account
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

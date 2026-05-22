import { Link, NavLink, useNavigate } from "react-router-dom";
import { getUser, logoutUser } from "../../lib/authStorage";

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();

  const logout = () => {
    logoutUser();
    navigate("/login");
    window.location.reload();
  };

  const requireLogin = (path: string) => {
    if (!user) {
      alert("Please login first, or create an account if you do not have one.");
      navigate("/login");
      return;
    }

    navigate(path);
  };

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

        <div className="flex items-center gap-3">
          <button onClick={() => requireLogin("/dashboard")} className="btn-white">
            Dashboard
          </button>

          {user ? (
            <>
              <span className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold">
                {user.role}
              </span>

              <button onClick={logout} className="btn-black">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn-white" to="/login">
                Login
              </Link>
              <Link className="btn-black" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 bg-clip-text text-transparent tracking-wide"
          >
            FreeLanceHub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">

            <NavLink to="/" label="Home" />
            <NavLink to="/projects" label="Projects" />

            {isAuthenticated && user?.role === "client" && (
              <NavLink to="/add-project" label="Add Project" />
            )}

            {!isAuthenticated ? (
              <>
                <NavLink to="/login" label="Login" />

                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium shadow-lg hover:shadow-indigo-400/40 hover:scale-105 transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <NavLink to="/profile" label={`Hi, ${user?.name}`} />

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-red-400/40 hover:scale-105"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-3xl text-gray-700 dark:text-gray-200 transition-transform duration-300 hover:scale-110"
            >
              {isOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl px-6 py-6 space-y-5 shadow-xl border-t border-gray-200 dark:border-gray-700">

          <MobileLink to="/" label="Home" setIsOpen={setIsOpen} />
          <MobileLink to="/projects" label="Projects" setIsOpen={setIsOpen} />

          {isAuthenticated && user?.role === "client" && (
            <MobileLink to="/add-project" label="Add Project" setIsOpen={setIsOpen} />
          )}

          {!isAuthenticated ? (
            <>
              <MobileLink to="/login" label="Login" setIsOpen={setIsOpen} />
              <MobileLink to="/signup" label="Signup" setIsOpen={setIsOpen} />
            </>
          ) : (
            <>
              <MobileLink
                to="/profile"
                label={`Hi, ${user?.name}`}
                setIsOpen={setIsOpen}
              />

              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-400 font-semibold hover:text-red-500"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* Desktop Nav Link */
function NavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="relative font-medium text-gray-700 dark:text-gray-300 transition-all duration-300 hover:text-indigo-500 dark:hover:text-indigo-400 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-indigo-500 after:to-blue-500 after:transition-all after:duration-300 hover:after:w-full"
    >
      {label}
    </Link>
  );
}

/* Mobile Link */
function MobileLink({ to, label, setIsOpen }) {
  return (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className="block text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
    >
      {label}
    </Link>
  );
}
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
    navigate("/");
  };

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* LEFT: Branding/Feed Anchor */}
          <Link
            to={isAuthenticated ? "/explore" : "/"}
            className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent tracking-tighter"
          >
            FreeLanceHub
          </Link>

          {/* RIGHT: Menu Items */}
          <div className="hidden md:flex items-center space-x-6">
            {!isAuthenticated ? (
              <>
                <NavLink to="/explore" label="Explore" />
                <NavLink to="/login" label="Login" />
                <Link
                  to="/signup"
                  className="px-6 py-2 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-md"
                >
                  Join Now
                </Link>
              </>
            ) : (
              <>

                {/* Role-Based Discovery Link */}
                {user?.role === "freelancer" ? (
                  <NavLink to="/projects" label="Find Work" />
                ) : (
                <NavLink to="/freelancers" label="Find Talent" />
                )}

                {/* Everyone sees the "Add Post" button now */}
                <Link 
                  to="/explore" 
                  className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-all"
                >
                  + Create Post
                </Link>

                {/* Dashboard (Redirects to their specific Cockpit) */}
                <NavLink to="/dashboard" label="Dashboard" />
                
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-1.5 border border-red-500 text-red-500 rounded-md text-sm font-bold hover:bg-red-50 transition-all"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 text-2xl">
              {isOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-6 space-y-4 shadow-xl">
          {!isAuthenticated ? (
            <>
              <MobileLink to="/explore" label="Explore" setIsOpen={setIsOpen} />
              <MobileLink to="/login" label="Login" setIsOpen={setIsOpen} />
              <MobileLink to="/signup" label="Join Now" setIsOpen={setIsOpen} />
            </>
          ) : (
            <>
              <MobileLink to="/explore" label="+ Create Post" setIsOpen={setIsOpen} />
              <MobileLink to="/dashboard" label="Dashboard" setIsOpen={setIsOpen} />
              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-600 font-bold pt-2 border-t border-gray-100 mt-2"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors"
    >
      {label}
    </Link>
  );
}

function MobileLink({ to, label, setIsOpen }) {
  return (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className="block text-base font-bold text-gray-700 hover:text-indigo-600"
    >
      {label}
    </Link>
  );
}
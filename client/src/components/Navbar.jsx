import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import CreatePostModal from "./CreatePostModal"; // Import your Post Modal

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      <nav className="fixed w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
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

                  {/* Dashboard */}
                  <NavLink to="/dashboard" label="Dashboard" />

                  {/* Create Post Button (Triggers Modal) */}
                  <button 
                    onClick={() => setIsPostModalOpen(true)}
                    className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full transition-all shadow-sm"
                  >
                    + Create Post
                  </button>

                  {/* Profile Icon linking to their unified profile */}
                  <Link to={`/profile/${user?.id}`} className="relative group cursor-pointer ml-2">
                    <div className="w-10 h-10 bg-indigo-50 border-2 border-indigo-600 rounded-full flex items-center justify-center text-indigo-700 font-black shadow-sm group-hover:scale-105 transition-transform uppercase">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  </Link>
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
                <MobileLink to="/dashboard" label="Dashboard" setIsOpen={setIsOpen} />
                <MobileLink to={`/profile/${user?.id}`} label="My Profile" setIsOpen={setIsOpen} />
                <button
                  onClick={() => { setIsPostModalOpen(true); setIsOpen(false); }}
                  className="block w-full text-left text-base font-bold text-indigo-600 hover:text-indigo-700 pt-2 border-t border-gray-100 mt-2"
                >
                  + Create Post
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Render the Modal outside the Nav flow so z-index works cleanly */}
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />
    </>
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
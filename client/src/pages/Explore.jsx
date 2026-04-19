import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../features/postSlice";
import { fetchProjects } from "../features/projectSlice"; // Added this
import CreatePostModal from "../components/CreatePostModal";

export default function Explore() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State
  const { posts = [], loading = false } = useSelector((state) => state.posts || {});
  const { projects = [] } = useSelector((state) => state.projects || {});
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Trending Logic: Take top 3 most recent projects
  const trendingProjects = projects.slice(0, 3);

  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchProjects()); // Ensure projects are loaded for the sidebar
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#F3F2EF] pt-24 pb-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 px-4">
        
        {/* LEFT: Profile & Discovery */}
        <aside className="md:col-span-3 space-y-4">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="h-16 bg-indigo-600"></div>
            <div className="p-4 -mt-10 text-center border-b border-gray-100">
              <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-white shadow-sm">
                {isAuthenticated ? user?.name[0] : "?"}
              </div>
              <h2 className="mt-3 font-bold text-gray-900">{isAuthenticated ? user?.name : "Guest"}</h2>
              <p className="text-xs text-gray-500 capitalize">{isAuthenticated ? user?.role : "Join to connect"}</p>
            </div>
            <div className="p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">About</p>
              <p className="text-sm text-gray-600 mt-2 italic">Connecting talent with opportunity.</p>
            </div>
          </div>

          {/* Discovery Card (The one below profile) */}
          {isAuthenticated && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm sticky top-24">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">Discovery</h3>
              </div>
              <div className="p-2">
                {user?.role === "freelancer" ? (
                  <Link 
                    to="/projects" 
                    className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-indigo-50 transition-colors group"
                  >
                    <span className="text-xl">🔍</span>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600">Find Projects</span>
                  </Link>
                ) : (
                  <Link 
                    to="/freelancers" 
                    className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-indigo-50 transition-colors group"
                  >
                    <span className="text-xl">👥</span>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600">Find Freelancers</span>
                  </Link>
                )}
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-xl">📊</span>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600">My Dashboard</span>
                </Link>
              </div>
            </div>
          )}
        </aside>

        {/* CENTER: The Social Feed */}
        <main className="md:col-span-6 space-y-4">
          {/* Post Trigger Box */}
          {isAuthenticated && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex space-x-4 items-center shadow-sm">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white shadow-inner">
                {user?.name[0]}
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-full py-3 px-5 text-gray-500 text-left font-semibold hover:bg-gray-100 transition shadow-sm"
              >
                Start a post
              </button>
            </div>
          )}

          {/* Social Feed Posts */}
          {loading ? (
            <div className="text-center py-10 font-bold text-gray-500 animate-pulse">Loading your feed...</div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition-colors">
                <div className="p-4 flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center font-bold text-indigo-600">
                    {post.author_name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{post.author_name}</h3>
                    <p className="text-[11px] text-gray-500 capitalize">{post.author_role} • {new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{post.content}</p>
                </div>
                <div className="border-t border-gray-100 px-2 py-1 flex justify-around">
                  <button className="flex-1 py-2 hover:bg-gray-50 rounded-md font-bold text-gray-500 text-sm flex items-center justify-center space-x-2 transition">
                    <span>👍</span><span>Like</span>
                  </button>
                  <button className="flex-1 py-2 hover:bg-gray-50 rounded-md font-bold text-gray-500 text-sm flex items-center justify-center space-x-2 transition">
                    <span>💬</span><span>Comment</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No posts to show. Be the first to start a conversation!</p>
            </div>
          )}
        </main>

        {/* RIGHT: Trending Projects */}
        <aside className="md:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex justify-between items-center">
              Trending Projects 
              <Link to="/projects" className="text-indigo-600 text-xs font-bold hover:underline">View All</Link>
            </h3>
            <ul className="space-y-4">
              {trendingProjects.length > 0 ? (
                trendingProjects.map((p) => (
                  <li 
                    key={p.id} 
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="group cursor-pointer border-b border-gray-50 pb-2 last:border-0 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition">
                      {p.title}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">Budget: ₹{p.price_max}</p>
                  </li>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No trending projects found.</p>
              )}
            </ul>
          </div>
        </aside>

        <CreatePostModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
      </div>
    </div>
  );
}
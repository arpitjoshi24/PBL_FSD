import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, toggleLikePost } from "../features/postSlice";
import { fetchProjects } from "../features/projectSlice";
import CreatePostModal from "../components/CreatePostModal";
import axios from "axios";

export default function Explore() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeComments, setActiveComments] = useState({}); 
  const [commentInputs, setCommentInputs] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { posts = [], loading = false } = useSelector((state) => state.posts || {});
  const { projects = [] } = useSelector((state) => state.projects || {});
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);

  const trendingProjects = projects.slice(0, 3);
  const API_BASE = "http://localhost:5000"; // Hardcoded for Vite safety

  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleLike = (postId) => {
    dispatch(toggleLikePost(postId));
  };

  const handleToggleComments = async (postId) => {
    if (activeComments[postId]) {
      const newState = { ...activeComments };
      delete newState[postId];
      setActiveComments(newState);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/api/posts/${postId}/comments`);
      setActiveComments({ ...activeComments, [postId]: res.data });
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  const handlePostComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content || !content.trim()) return;

    try {
      const res = await axios.post(
        `${API_BASE}/api/posts/${postId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setActiveComments({
        ...activeComments,
        [postId]: [...(activeComments[postId] || []), res.data]
      });
      
      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  const renderMedia = (mediaString) => {
    if (!mediaString) return null;
    try {
      const files = typeof mediaString === 'string' ? JSON.parse(mediaString) : mediaString;
      if (!Array.isArray(files) || files.length === 0) return null;

      return (
        <div className={`mt-4 grid gap-2 ${files.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {files.map((file, idx) => (
            <div key={idx} className={`rounded-xl overflow-hidden border border-gray-100 bg-gray-50 ${files.length === 1 ? 'max-h-[500px]' : 'aspect-square'}`}>
              {file.type === 'video' ? (
                <video src={`${API_BASE}${file.url}`} controls className="w-full h-full object-cover" />
              ) : (
                <img 
                  src={`${API_BASE}${file.url}`} 
                  alt="post content" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => window.open(`${API_BASE}${file.url}`, '_blank')}
                />
              )}
            </div>
          ))}
        </div>
      );
    } catch (e) {
      console.error("Media parsing error", e);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2EF] pt-24 pb-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 px-4">
        
        {/* LEFT: Profile & Discovery */}
        <aside className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="h-16 bg-indigo-600"></div>
            <div className="p-4 -mt-10 text-center border-b border-gray-100">
              <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-3xl font-black text-indigo-600 border-4 border-white shadow-sm">
                {isAuthenticated ? user?.name[0] : "?"}
              </div>
              <h2 className="mt-3 font-black text-gray-900">{isAuthenticated ? user?.name : "Guest"}</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{isAuthenticated ? user?.role : "Join to connect"}</p>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">About</p>
              <p className="text-sm text-gray-600 mt-2 italic">Connecting talent with opportunity.</p>
            </div>
          </div>

          {isAuthenticated && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm sticky top-24">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Discovery</h3>
              </div>
              <div className="p-2">
                <Link to={user?.role === "freelancer" ? "/projects" : "/freelancers"} className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-indigo-50 transition-colors group">
                  <span className="text-xl">{user?.role === "freelancer" ? "🔍" : "👥"}</span>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600">
                    {user?.role === "freelancer" ? "Find Projects" : "Find Freelancers"}
                  </span>
                </Link>
                <Link to="/dashboard" className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <span className="text-xl">📊</span>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600">My Dashboard</span>
                </Link>
              </div>
            </div>
          )}
        </aside>

        {/* CENTER: The Social Feed */}
        <main className="md:col-span-6 space-y-4">
          {isAuthenticated && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex space-x-4 items-center shadow-sm">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center font-black text-white shadow-lg shrink-0">
                {user?.name[0]}
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full py-3 px-6 text-gray-500 text-left font-bold hover:bg-gray-100 transition shadow-sm truncate"
              >
                What's your latest project insight?
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 font-black text-gray-400 animate-pulse uppercase tracking-widest text-xs">Loading your feed...</div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition-all duration-300">
                
                {/* Post Header */}
                <div className="p-4 flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center font-black text-indigo-600 shadow-inner shrink-0">
                    {post.author_name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-sm">{post.author_name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{post.author_role} • {new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-2">
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{post.content}</p>
                </div>

                {/* Post Media */}
                <div className="px-4 pb-4">
                  {renderMedia(post.media_files)}
                </div>

                {/* Interaction Buttons */}
                <div className="border-t border-gray-50 px-2 py-1 flex justify-around">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex-1 py-3 rounded-lg font-black text-xs flex items-center justify-center space-x-2 transition uppercase tracking-widest ${
                      post.liked_by_me ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span>{post.liked_by_me ? '❤️' : '👍'}</span>
                    <span>{post.like_count || 0} Like{post.like_count !== '1' && 's'}</span>
                  </button>
                  
                  <button 
                    onClick={() => handleToggleComments(post.id)}
                    className={`flex-1 py-3 rounded-lg font-black text-xs flex items-center justify-center space-x-2 transition uppercase tracking-widest ${
                      activeComments[post.id] ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span>💬</span>
                    <span>Comment</span>
                  </button>
                </div>

                {/* EXPANDABLE COMMENT SECTION */}
                {activeComments[post.id] && (
                  <div className="px-4 pb-4 bg-gray-50/50 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                    
                    <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {activeComments[post.id].length > 0 ? (
                        activeComments[post.id].map(c => (
                          <div key={c.id} className="flex flex-col bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{c.author_name}</span>
                              <span className="text-[9px] text-gray-400 font-bold">{new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-700">{c.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic text-center py-2">No comments yet. Be the first!</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-black text-white text-xs shrink-0">
                        {user?.name[0]}
                      </div>
                      <input 
                        type="text" 
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') handlePostComment(post.id); }}
                        placeholder="Write a comment..."
                        className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button 
                        onClick={() => handlePostComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold italic">The feed is quiet. Start a conversation!</p>
            </div>
          )}
        </main>

        {/* RIGHT: Trending Projects */}
        <aside className="md:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24 shadow-sm">
            <h3 className="font-black text-[11px] uppercase tracking-widest text-gray-400 mb-4 flex justify-between items-center">
              Trending Projects 
              <Link to="/projects" className="text-indigo-600 hover:underline">View All</Link>
            </h3>
            <ul className="space-y-4">
              {trendingProjects.length > 0 ? (
                trendingProjects.map((p) => (
                  <li 
                    key={p.id} 
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="group cursor-pointer border-b border-gray-50 pb-3 last:border-0 hover:bg-indigo-50/50 p-2 rounded-xl transition-all"
                  >
                    <p className="text-xs font-black text-gray-800 group-hover:text-indigo-600 transition truncate">
                      {p.title}
                    </p>
                    <p className="text-[9px] font-black uppercase text-green-600 mt-1">Budget: ₹{p.price_max}</p>
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
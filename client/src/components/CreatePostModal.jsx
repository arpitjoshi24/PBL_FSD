import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPost } from "../features/postSlice";

export default function CreatePostModal({ isOpen, setIsOpen }) {
  const [content, setContent] = useState("");
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      dispatch(addPost({ content }));
      setContent("");
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Create a post</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name[0]}
            </div>
            <div>
              <p className="font-bold text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500">Post to Anyone</p>
            </div>
          </div>
          
          <textarea
            className="w-full h-40 border-none focus:ring-0 text-lg placeholder-gray-400 resize-none"
            placeholder="What do you want to talk about?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={!content.trim()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold disabled:opacity-50 hover:bg-indigo-700 transition"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchSingleUser } from "../features/userSlice"; // We'll add this action

export default function FreelancerDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { singleUser: freelancer, loading } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchSingleUser(id));
  }, [dispatch, id]);

  if (loading && !freelancer) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-bold text-gray-400 animate-pulse">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6 pb-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-indigo-600 rounded-full flex items-center justify-center text-5xl font-black text-white shadow-xl shadow-indigo-100">
            {freelancer?.name?.[0]}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-gray-900">{freelancer?.name}</h1>
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest self-center md:self-auto">
                {freelancer?.role}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-500 mb-6">{freelancer?.company || "Independent Freelancer"}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="font-bold text-indigo-600">★ 4.9</span> 
                <span>(24 Reviews)</span>
              </div>
              <div className="text-gray-300">|</div>
              <div className="text-gray-600">
                <span className="font-bold">12</span> Projects Completed
              </div>
            </div>
          </div>

          {currentUser?.role === "client" && (
            <div className="w-full md:w-auto">
              <Link 
                to={`/dashboard?contact=${freelancer?.id}`}
                className="block w-full text-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Invite to Project
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Skills & Info */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Core Skills</h2>
              <div className="flex flex-wrap gap-2">
                {freelancer?.skills?.split(",").map((skill, index) => (
                  <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Verified Contact</h2>
              <p className="text-gray-700 font-bold break-all">{freelancer?.email}</p>
            </div>
          </div>

          {/* Right Column: Bio & Portfolio */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-4">Professional Bio</h2>
              <p className="text-gray-600 leading-relaxed text-lg italic">
                "{freelancer?.about || "This freelancer hasn't shared their story yet."}"
              </p>
            </div>

            {/* Placeholder for Reviews - Enhances the "Detailed" feel */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Latest Client Reviews</h2>
              <div className="space-y-6">
                <div className="border-b border-gray-50 pb-6">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-gray-800">Excellent Work on React Dashboard</span>
                    <span className="text-indigo-600 font-bold">★ 5.0</span>
                  </div>
                  <p className="text-sm text-gray-500">"Delivered the project 2 days ahead of schedule. Very communicative!"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
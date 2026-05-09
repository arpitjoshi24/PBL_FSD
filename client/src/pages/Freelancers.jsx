import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFreelancers } from "../features/userSlice";

export default function Freelancers() {
  const dispatch = useDispatch();
  const { freelancers, loading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchFreelancers());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black mb-8 text-gray-900 text-center md:text-left">Find Expert Talent</h1>
        
        {loading ? (
          <p className="text-gray-500">Loading freelancers...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map((f) => (
              <div key={f.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white uppercase">
                    {f.name[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{f.name}</h2>
                    <p className="text-sm font-medium text-indigo-600">{f.skills || "Creative Professional"}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-6 h-15">{f.about || "Experienced freelancer available for new projects."}</p>
                <Link 
                  to={`/profile/${f.id}`} 
                  className="block w-full text-center py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-indigo-600 transition-colors"
                >
                  View Full Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
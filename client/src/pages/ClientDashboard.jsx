import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyProjects } from "../features/projectSlice";

export default function ClientDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myProjects, loading } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchMyProjects());
  }, [dispatch]);

  // Quick stats calculation
  const stats = {
    total: myProjects.length,
    open: myProjects.filter((p) => p.status === "open").length,
    assigned: myProjects.filter((p) => p.status === "assigned").length,
    completed: myProjects.filter((p) => p.status === "completed").length,
  };

  if (loading && myProjects.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-left">Welcome, {user?.name}!</h1>
            <p className="text-gray-600 text-left">
              You are currently managing <span className="font-bold text-indigo-600">{myProjects.length}</span> projects.
            </p>
          </div>
          
          {/* THE INTEGRATED ACTION BUTTON */}
          <Link
            to="/add-project"
            className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all duration-300"
          >
            + Post a New Project
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Projects", value: stats.total, color: "bg-white text-gray-800" },
            { label: "Open for Bids", value: stats.open, color: "bg-green-50 text-green-700" },
            { label: "In Progress", value: stats.assigned, color: "bg-blue-50 text-blue-700" },
            { label: "Completed", value: stats.completed, color: "bg-indigo-50 text-indigo-700" },
          ].map((stat, i) => (
            <div key={i} className={`p-6 rounded-2xl shadow-sm border border-gray-100 ${stat.color}`}>
              <p className="text-xs uppercase font-bold opacity-70 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Your Project Postings</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-8 py-4">Project Title</th>
                  <th className="px-8 py-4">Budget Range</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Date Posted</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myProjects.length > 0 ? (
                  myProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-semibold text-gray-900">{project.title}</p>
                      </td>
                      <td className="px-8 py-5 text-gray-600">
                        ₹{project.price_min} - ₹{project.price_max}
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            project.status === "open"
                              ? "bg-green-100 text-green-700"
                              : project.status === "assigned"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-500">
                        {new Date(project.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link
                          to={`/project/${project.id}`}
                          className="text-indigo-600 font-bold hover:text-indigo-800 text-sm"
                        >
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center text-gray-400 italic">
                      You haven't posted any projects yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
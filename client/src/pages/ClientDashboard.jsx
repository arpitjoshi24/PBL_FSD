import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyProjects } from "../features/projectSlice";
import ReviewModal from "../components/ReviewModal"; // 1. Import the Modal

import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";

export default function ClientDashboard() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { myProjects, loading } = useSelector((state) => state.projects);
  const [stats, setStats] = useState(null);

  // 2. Add Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    dispatch(fetchMyProjects());
    
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/stats/client", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Analytics fetch failed", err);
      }
    };
    if (token) fetchAnalytics();
  }, [dispatch, token]);

  // 3. Helper to open modal
  const handleOpenReview = (project) => {
    console.log("Project Data for Review:", project); // Check if assigned_to is here
    setSelectedProject(project);
    setIsReviewModalOpen(true);
  };

  if (loading && myProjects.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6 text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Business Intelligence</h1>
            <p className="text-gray-500 mt-1">Manage your workforce and project capital.</p>
          </div>
          <Link
            to="/add-project"
            className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] transition-all"
          >
            + Post New Project
          </Link>
        </div>

        {/* VISUAL ANALYTICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">Posting Frequency</h3>
            <div className="h-64">
              {stats?.activity?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.activity}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                    <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
                  Loading activity data...
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-gray-800 mb-6 w-full">Project Lifecycle</h3>
            <div className="h-48 w-full">
              {stats?.summary ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed", value: Number(stats?.summary?.completed_projects || 0) },
                        { name: "Active", value: Number((stats?.summary?.total_projects || 0) - (stats?.summary?.completed_projects || 0)) }
                      ]}
                      innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value"
                    >
                      <Cell fill="#4F46E5" />
                      <Cell fill="#F3F4F6" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">
                  No data available
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2 w-full">
               <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400 uppercase tracking-tighter">Completed Rate</span>
                  <span className="text-indigo-600">
                    {stats?.summary ? Math.round((stats.summary.completed_projects / stats.summary.total_projects) * 100) : 0}%
                  </span>
               </div>
               <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-1000" 
                    style={{ width: `${(stats?.summary?.completed_projects / stats?.summary?.total_projects) * 100 || 0}%` }}
                  ></div>
               </div>
            </div>
          </div>
        </div>

        {/* PROJECTS MANAGEMENT TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-gray-800">Operational Log</h2>
            <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase tracking-widest">
              {myProjects.length} Entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-4">Title</th>
                  <th className="px-8 py-4">Financials</th>
                  <th className="px-8 py-4">Phase</th>
                  <th className="px-8 py-4">Posted On</th>
                  <th className="px-8 py-4 text-right">System</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myProjects.length > 0 ? (
                  myProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{project.title}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-700">₹{project.price_min} - ₹{project.price_max}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                            project.status === "open" ? "bg-green-100 text-green-700" : 
                            project.status === "assigned" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                        {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-5 text-right">
  <div className="flex justify-end items-center gap-3">
    {/* REVIEW BUTTON */}
    {project.status === "completed" && (
      <button
        onClick={() => handleOpenReview(project)}
        className="relative z-10 px-4 py-1.5 bg-yellow-400 text-yellow-900 text-[10px] font-black rounded-lg hover:bg-yellow-500 transition-all shadow-sm active:scale-95 flex-shrink-0"
      >
        ⭐ REVIEW
      </button>
    )}

    {/* DETAILS BUTTON - Ensuring Singular Route */}
    <Link
      to={`/projects/${project.id}`} 
      className="relative z-10 inline-block px-5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:border-indigo-600 hover:text-indigo-600 hover:bg-white transition-all active:scale-95 flex-shrink-0"
    >
      Details
    </Link>
  </div>
</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-gray-400 italic font-medium">
                      No projects found in the system log.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Render Review Modal */}
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        project={selectedProject} 
        onReviewSuccess={() => dispatch(fetchMyProjects())} 
      />
    </div>
  );
}
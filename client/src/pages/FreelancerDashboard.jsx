import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyProposals } from "../features/proposalSlice";
import axios from "axios";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid 
} from "recharts";

export default function FreelancerDashboard() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { myProposals, loading } = useSelector((state) => state.proposals);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dispatch(fetchMyProposals());
    
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/stats/freelancer", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Freelancer analytics failed", err);
      }
    };
    if (token) fetchAnalytics();
  }, [dispatch, token]);

  // Statistics calculation for the quick-view cards
  const summary = {
  totalBids: myProposals.length,
  
  // 1. ACTIVE: Proposal is accepted AND the project is NOT yet completed
  activeWork: myProposals.filter((p) => 
    p.current_proposal_status === "accepted" && 
    p.current_project_status !== "completed"
  ).length,
  
  // 2. PENDING: Proposal is still waiting
  pending: myProposals.filter((p) => 
    p.current_proposal_status === "pending"
  ).length,
  
  // 3. SUCCESS: Proposal was accepted AND the project is now completed
  success: myProposals.filter((p) => 
    p.current_proposal_status === "accepted" && 
    p.current_project_status === "completed"
  ).length,
};

  if (loading && myProposals.length === 0) {
    return <div className="flex justify-center items-center h-screen animate-pulse text-indigo-600 font-bold">Initializing Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6 text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Professional Overview</h1>
          <p className="text-gray-500">Welcome back, {user?.name}. Manage your growth and active contracts.</p>
        </div>

        {/* ANALYTICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* Earnings Line Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">Revenue Growth (₹)</h3>
            <div className="h-64">
              {stats?.earnings?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.earnings}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} dy={10} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Line 
  type="monotone" 
  dataKey="amount" 
  stroke="#4F46E5" 
  strokeWidth={4} 
  dot={{ r: 6, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} 
  activeDot={{ r: 8 }}
/>
</LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">No revenue data recorded yet</div>
              )}
            </div>
          </div>

          {/* Proposal Status Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-gray-800 mb-6 w-full text-center">Bid Success Rate</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
  data={stats?.breakdown?.length > 0 
    ? stats.breakdown.map(item => ({
        status: item.status,
        count: Number(item.count) // Force it to be a Number
      })) 
    : [{status: 'None', count: 1}]
  }
  innerRadius={60} 
  outerRadius={80} 
  paddingAngle={8} 
  dataKey="count"
>
                    {stats?.breakdown?.map((entry, index) => (
                      <Cell key={index} fill={entry.status === 'accepted' ? '#4F46E5' : entry.status === 'pending' ? '#F59E0B' : '#E5E7EB'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between w-full text-[10px] font-black uppercase text-gray-400">
               <span>Pending</span>
               <span>Accepted</span>
               <span>Rejected</span>
            </div>
          </div>
        </div>

        {/* STATS QUICK CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Bids" value={summary.totalBids} icon="send" />
          <StatCard label="Active Work" value={summary.activeWork} icon="work" />
          <StatCard label="Pending" value={summary.pending} icon="time" />
          <StatCard label="Success" value={summary.success} icon="check" />
        </div>

        {/* PROPOSALS TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-gray-800">Bidding History</h2>
            <Link to="/projects" className="text-xs font-black text-indigo-600 hover:underline">BROWSE MORE →</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-4">Project</th>
                  <th className="px-8 py-4">My Bid</th>
                  <th className="px-8 py-4">Proposal</th>
                  <th className="px-8 py-4">Current Project Status</th>
                  <th className="px-8 py-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myProposals.length > 0 ? (
                  myProposals.map((item) => (
                    <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
    <td className="px-8 py-5">
      <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.project_title}</p>
      <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Submitted {new Date(item.created_at).toLocaleDateString()}</p>
    </td>
    <td className="px-8 py-5 font-bold text-gray-700">₹{item.bid_amount}</td>
    <td className="px-8 py-5">
      <StatusBadge status={item.current_proposal_status} />
    </td>
    <td className="px-8 py-5">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {item.current_project_status}
      </span>
    </td>
    <td className="px-8 py-5 text-right">
      <Link to={`/projects/${item.project_id}`} className="inline-block px-4 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-all">
        Details
      </Link>
    </td>
  </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-medium">No proposals found in history.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable UI Components
function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
      <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-orange-100 text-orange-700",
    accepted: "bg-green-100 text-green-700", // This matches your object's "accepted"
    rejected: "bg-red-100 text-red-700",
  };
  
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${styles[status] || "bg-gray-100 text-gray-400"}`}>
      {status || "Unknown"}
    </span>
  );
}
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyProposals } from "../features/proposalSlice";

export default function FreelancerDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myProposals, loading } = useSelector((state) => state.proposals);

  useEffect(() => {
    dispatch(fetchMyProposals());
  }, [dispatch]);

  // Statistics calculation
  const stats = {
    totalBids: myProposals.length,
    activeWork: myProposals.filter((p) => p.status === "accepted").length,
    pending: myProposals.filter((p) => p.status === "pending").length,
    completed: myProposals.filter((p) => p.project_status === "completed" && p.status === "accepted").length,
  };

  if (loading && myProposals.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Freelancer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}. Track your applications and active contracts.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Bids" value={stats.totalBids} color="text-gray-800" />
          <StatCard label="Active Contracts" value={stats.activeWork} color="text-blue-600" />
          <StatCard label="Pending Bids" value={stats.pending} color="text-orange-600" />
          <StatCard label="Completed Jobs" value={stats.completed} color="text-green-600" />
        </div>

        {/* Proposals Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-white">
            <h2 className="text-xl font-bold text-gray-800">My Bidding History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                <tr>
                  <th className="px-8 py-4">Project</th>
                  <th className="px-8 py-4">My Bid</th>
                  <th className="px-8 py-4">Proposal Status</th>
                  <th className="px-8 py-4">Project Status</th>
                  <th className="px-8 py-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myProposals.length > 0 ? (
                  myProposals.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-semibold text-gray-900">{item.project_title}</p>
                        <p className="text-xs text-gray-400">Submitted on {new Date(item.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-5 font-medium text-gray-700">₹{item.bid_amount}</td>
                      <td className="px-8 py-5">
  <StatusBadge status={item.proposal_status} />
</td>
<td className="px-8 py-5">
  <span className="text-sm font-medium text-gray-500 uppercase">
    {item.current_project_status}
  </span>
</td>
                      <td className="px-8 py-5 text-right">
                        <Link
                          to={`/project/${item.project_id}`}
                          className="text-indigo-600 font-bold hover:underline text-sm"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-16 text-center">
                      <p className="text-gray-400 italic mb-4">You haven't applied to any projects yet.</p>
                      <Link to="/projects" className="text-indigo-600 font-bold border border-indigo-600 px-6 py-2 rounded-full hover:bg-indigo-600 hover:text-white transition">
                        Browse Projects
                      </Link>
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

// Internal UI Components
function StatCard({ label, value, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <p className="text-xs uppercase font-bold text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-orange-100 text-orange-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
}
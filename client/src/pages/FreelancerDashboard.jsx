import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyProposals, createProposal } from "../features/proposalSlice"; // <-- Ensure createProposal is imported
import { fetchFreelancerStats } from "../features/statSlice"; 
import { fetchFreelancerInvites, updateInviteStatus } from "../features/inviteSlice"; // <-- NEW IMPORT
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid 
} from "recharts";

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6'];

export default function FreelancerDashboard() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  
  const { myProposals, loading: proposalsLoading } = useSelector((state) => state.proposals);
  const { data: stats, loading: statsLoading } = useSelector((state) => state.stats);
  
  // NEW: Invites State
  const { receivedInvites, loading: invitesLoading } = useSelector((state) => state.invites);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  
  // NEW: Invite Acceptance Form State
  const [acceptingInvite, setAcceptingInvite] = useState(null);
  const [proposalForm, setProposalForm] = useState({ bid_amount: "", delivery_days: "", cover_letter: "" });
  
  useEffect(() => {
    dispatch(fetchMyProposals());
    dispatch(fetchFreelancerInvites()); // <-- Fetch Received Invites
    if (token) dispatch(fetchFreelancerStats());
  }, [dispatch, token]);

  const wonProjects = myProposals.filter(p => p.current_proposal_status === 'accepted');
  const allBids = myProposals;

  const summary = {
    totalBids: allBids.length,
    activeWork: wonProjects.filter(p => p.current_project_status !== "completed").length,
    pending: allBids.filter((p) => p.current_proposal_status === "pending").length,
    success: wonProjects.filter(p => p.current_project_status === "completed").length,
  };

  const calculateDays = (date1, date2) => {
    const diffTime = new Date(date1) - new Date(date2);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // <-- NEW: Handler for accepting an invite and submitting the proposal -->
  const handleAcceptInvite = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createProposal({
        project_id: acceptingInvite.project_id,
        bid_amount: proposalForm.bid_amount,
        delivery_days: proposalForm.delivery_days,
        cover_letter: proposalForm.cover_letter
      })).unwrap();
      
      alert("Proposal submitted and invite accepted!");
      setAcceptingInvite(null);
      setProposalForm({ bid_amount: "", delivery_days: "", cover_letter: "" });
      
      // Refresh Tables
      dispatch(fetchFreelancerInvites());
      dispatch(fetchMyProposals());
    } catch (err) {
      alert(err || "Failed to submit proposal");
    }
  };

  if (proposalsLoading && myProposals.length === 0) {
    return <div className="flex justify-center items-center h-screen animate-pulse text-indigo-600 font-bold">Initializing BI Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6 text-left relative">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Intelligence Hub</h1>
            <p className="text-gray-500">Welcome back, {user?.name}. Manage your CRM, Projects, and Proposals.</p>
          </div>
        </div>

        {/* STATS QUICK CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Proposals" value={summary.totalBids} />
          <StatCard label="Active Projects" value={summary.activeWork} />
          <StatCard label="Pending Bids" value={summary.pending} />
          <StatCard label="Completed Jobs" value={summary.success} />
        </div>

        {/* VISUAL ANALYTICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">Revenue Trajectory (₹)</h3>
            <div className="h-64">
              {statsLoading ? (
                 <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">Fetching revenue data...</div>
              ) : stats?.earnings?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.earnings}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} dy={10} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                    <Line type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={4} dot={{ r: 6, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">No revenue data recorded yet</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-gray-800 mb-6 w-full text-center">Proven Tech Stack</h3>
            <div className="h-48 w-full">
              {stats?.techStack?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.techStack} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                      {stats.techStack.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} Projects`, name.toUpperCase()]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic text-sm text-center">
                  Complete projects to build your stack profile.
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 w-full text-[10px] font-black uppercase">
               {stats?.techStack?.map((tech, idx) => (
                 <span key={idx} style={{color: COLORS[idx % COLORS.length]}}>{tech.name} ({tech.value})</span>
               ))}
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: CRM & WON PROJECTS */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10 items-start">
          
          {/* 1. CLIENT CRM */}
          <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
              <h2 className="text-lg font-bold text-gray-800">Client CRM</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Your Professional Network</p>
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {stats?.clients?.length > 0 ? stats.clients.map(client => (
                <div key={client.client_id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-2xl transition-colors mb-1 border border-transparent hover:border-gray-100">
                  <div className="truncate pr-4">
                    <Link to={`/profile/${client.client_id}`} className="font-bold text-sm text-indigo-600 hover:underline truncate block">
                      {client.client_name}
                    </Link>
                    <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{client.company || 'Independent'}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedClient(client)}
                    className="shrink-0 text-[10px] px-3 py-1.5 bg-indigo-50 text-indigo-700 font-black rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    HISTORY
                  </button>
                </div>
              )) : (
                <p className="text-center text-gray-400 text-sm py-8 italic px-4">No completed client contracts yet.</p>
              )}
            </div>
          </div>

          {/* 2. WON PROJECTS DESK */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-800">My Workspace</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Active & Completed Projects</p>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest sticky top-0 z-10">
                  <tr>
                    <th className="px-8 py-4 whitespace-nowrap">Project & Client</th>
                    <th className="px-8 py-4 whitespace-nowrap">Tech Stack & Promise</th>
                    <th className="px-8 py-4 whitespace-nowrap">Earnings</th>
                    <th className="px-8 py-4 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {wonProjects.length > 0 ? (
                    wonProjects.map((item) => (
                      <tr key={`won-${item.id}`} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-8 py-5">
                          <Link to={`/projects/${item.project_id}`} className="font-bold text-gray-900 text-sm hover:text-indigo-600 transition-colors">
                            {item.project_title}
                          </Link>
                          <p className="text-[10px] text-gray-500 font-bold mt-1 tracking-widest uppercase">
                            Client: {item.client_name}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-gray-700">{item.delivery_days} Days Promised</p>
                          <div className="flex gap-1 mt-1 flex-wrap max-w-[180px]">
                            {item.skills_required?.split(",").slice(0, 3).map((s, i) => (
                              <span key={i} className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase font-bold">{s.trim()}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <p className="font-black text-green-600 mb-2">₹{item.bid_amount}</p>
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                              item.current_project_status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                           }`}>
                             {item.current_project_status}
                           </span>
                        </td>
                        
                        <td className="px-8 py-5 text-right relative">
                          <div className="group/menu inline-block">
                            <button className="px-3 py-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-bold text-xl">
                              ⋮
                            </button>
                            <div className="absolute right-8 top-10 w-40 bg-white border border-gray-100 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50">
                              <Link
                                to={`/projects/${item.project_id}`}
                                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left font-bold"
                              >
                                View Details
                              </Link>
                              <button
                                onClick={() => setSelectedTimeline(item)}
                                className="block w-full px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 text-left font-bold"
                              >
                                🕒 Timelines
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="px-8 py-16 text-center text-gray-400 font-medium italic">You haven't secured any projects yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* =========================================
            NEW: RECEIVED DIRECT INVITES TRACKER
        ========================================= */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/30">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Direct Project Invites</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Exclusive opportunities from clients</p>
            </div>
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-md">
              {receivedInvites?.length || 0} Invites
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-8 py-4 whitespace-nowrap">Client</th>
                  <th className="px-8 py-4 whitespace-nowrap">Target Project</th>
                  <th className="px-8 py-4 whitespace-nowrap">Budget Range</th>
                  <th className="px-8 py-4 whitespace-nowrap">Status</th>
                  <th className="px-8 py-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invitesLoading ? (
                  <tr><td colSpan="5" className="px-8 py-12 text-center text-gray-400 font-medium italic animate-pulse">Loading your invites...</td></tr>
                ) : receivedInvites?.length > 0 ? (
                  receivedInvites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <Link to={`/profile/${invite.client_id}`} className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors block mb-1">
                          {invite.client_name} ↗
                        </Link>
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">
                          Received: {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <Link to={`/projects/${invite.project_id}`} className="font-bold text-gray-700 text-sm hover:text-indigo-600 truncate block max-w-[200px]">
                          {invite.project_title}
                        </Link>
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-black text-gray-800">₹{invite.price_min} - ₹{invite.price_max}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest
                          ${invite.dynamic_status === 'Invited' ? 'bg-blue-100 text-blue-700' : 
                            invite.dynamic_status === 'Accepted' ? 'bg-green-100 text-green-700' : 
                            invite.dynamic_status === 'Project Assigned' ? 'bg-indigo-100 text-indigo-700' : 
                            invite.dynamic_status === 'Rejected' || invite.dynamic_status === 'Not Hired' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-500'}`}
                        >
                          {invite.dynamic_status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {invite.dynamic_status === 'Invited' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setAcceptingInvite(invite)}
                              className="text-[10px] font-black bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 tracking-widest uppercase transition-all shadow-sm"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => {
                                if(window.confirm("Are you sure you want to reject this invite?")) {
                                  dispatch(updateInviteStatus({ inviteId: invite.id, status: 'rejected' }))
                                    .then(() => dispatch(fetchFreelancerInvites()));
                                }
                              }}
                              className="text-[10px] font-black bg-white border border-gray-200 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-200 tracking-widest uppercase transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="px-8 py-16 text-center text-gray-400 font-medium italic">You haven't received any direct invites yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM ROW: ALL BIDDING PROPOSALS */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Proposal Log</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Every bid you have submitted</p>
            </div>
            <Link to="/projects" className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 tracking-widest uppercase transition-colors">
              Find More Work
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-4 whitespace-nowrap">Target Project</th>
                  <th className="px-8 py-4 whitespace-nowrap">My Bid Details</th>
                  <th className="px-8 py-4 whitespace-nowrap">Submitted On</th>
                  <th className="px-8 py-4 whitespace-nowrap">Outcome</th>
                  <th className="px-8 py-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allBids.length > 0 ? (
                  allBids.map((item) => (
                    <tr key={`bid-${item.id}`} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {item.project_title}
                        </p>
                        <p className="text-[10px] text-gray-500 font-bold mt-1 tracking-widest uppercase">
                          Project Status: {item.current_project_status}
                        </p>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <p className="font-black text-gray-800 mb-1">₹{item.bid_amount}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">In {item.delivery_days} Days</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-600">
                           {new Date(item.proposal_date).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <StatusBadge status={item.current_proposal_status} />
                      </td>
                      <td className="px-8 py-5 text-right relative">
                        <div className="group/menu inline-block">
                          <button className="px-3 py-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-bold text-xl">
                            ⋮
                          </button>
                          <div className="absolute right-8 top-10 w-32 bg-white border border-gray-100 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 text-left">
                            <button
                              onClick={() => setSelectedProposal(item)}
                              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left font-bold"
                            >
                              View My Bid
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-medium italic">Your bidding history is empty.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 1. DEEP CLIENT HISTORY MODAL */}
      {selectedClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setSelectedClient(null)} 
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-full font-bold transition-colors"
            >✕</button>
            
            <div className="shrink-0 mb-6 border-b border-gray-100 pb-6">
              <Link to={`/profile/${selectedClient.client_id}`} className="text-2xl font-black text-indigo-600 hover:underline mb-1 pr-6 block">
                {selectedClient.client_name}
              </Link>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{selectedClient.company || "Independent Client"}</p>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar pr-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                  <span className="block text-xl font-black text-indigo-600">{selectedClient.projects_completed}</span>
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest">Won</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <span className="block text-xl font-black text-gray-400">{selectedClient.rejected_bids || 0}</span>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Rejected</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100">
                <span className="text-sm font-bold text-green-700">Total Revenue Generated</span>
                <span className="text-xl font-black text-green-700">₹{selectedClient.total_earned}</span>
              </div>
              
              {selectedClient.client_avg_rating && (
                <div className="text-center bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <p className="text-[10px] text-yellow-600 uppercase font-black tracking-widest mb-1">Average Client Rating</p>
                  <p className="text-yellow-500 font-bold text-xl">★ {Number(selectedClient.client_avg_rating).toFixed(1)}</p>
                </div>
              )}

              <div className="pt-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Interaction History</h4>
                <div className="space-y-3">
                  {allBids.filter(b => b.client_id === selectedClient.client_id).map(bid => (
                    <div key={bid.id} className="p-3 border border-gray-100 rounded-xl bg-white">
                      <p className="text-xs font-bold text-gray-800 mb-1">{bid.project_title}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold">{new Date(bid.proposal_date).toLocaleDateString()}</span>
                        <StatusBadge status={bid.current_proposal_status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TIMELINE METRICS MODAL */}
      {selectedTimeline && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedTimeline(null)} 
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-full font-bold transition-colors"
            >✕</button>
            <h2 className="text-xl font-black text-gray-900 mb-1 pr-6">Project Timelines</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 truncate pr-4">{selectedTimeline.project_title}</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <span className="text-sm font-bold text-gray-600">Assigned/Bid Date</span>
                <span className="text-sm font-black text-gray-800">{new Date(selectedTimeline.proposal_date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border-l-4 border-indigo-400">
                <span className="text-sm font-bold text-gray-600">Hard Deadline</span>
                <span className="text-sm font-black text-indigo-600">
                  {selectedTimeline.deadline ? new Date(selectedTimeline.deadline).toLocaleDateString() : 'Not Set'}
                </span>
              </div>

              {selectedTimeline.current_project_status === 'completed' ? (
                <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100">
                  <span className="text-sm font-bold text-green-700">Completed On</span>
                  <div className="text-right">
                    <span className="block text-sm font-black text-green-700">{new Date(selectedTimeline.project_updated_at).toLocaleDateString()}</span>
                    {selectedTimeline.deadline && (
                      <span className="text-[10px] font-black uppercase text-green-600">
                        {calculateDays(selectedTimeline.deadline, selectedTimeline.project_updated_at) >= 0 
                          ? `${calculateDays(selectedTimeline.deadline, selectedTimeline.project_updated_at)} Days Early`
                          : `${Math.abs(calculateDays(selectedTimeline.deadline, selectedTimeline.project_updated_at))} Days Late`}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <span className="text-sm font-bold text-orange-700">Time Remaining</span>
                  <span className="text-sm font-black text-orange-700">
                    {selectedTimeline.deadline 
                      ? `${Math.max(0, calculateDays(selectedTimeline.deadline, new Date()))} Days Left` 
                      : 'Active'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. PROPOSAL ARCHIVE MODAL */}
      {selectedProposal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setSelectedProposal(null)} 
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-full font-bold transition-colors"
            >✕</button>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 mb-1">Proposal Archive</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                Submitted for: <span className="text-indigo-600">{selectedProposal.project_title}</span>
              </p>
            </div>

            <div className="overflow-y-auto custom-scrollbar pr-2 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                  <span className="block text-[10px] font-black text-gray-400 uppercase">Your Bid</span>
                  <span className="text-lg font-black text-gray-800">₹{selectedProposal.bid_amount}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                  <span className="block text-[10px] font-black text-gray-400 uppercase">Timeline</span>
                  <span className="text-lg font-black text-gray-800">{selectedProposal.delivery_days}d</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center flex flex-col justify-center">
                  <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Status</span>
                  <StatusBadge status={selectedProposal.current_proposal_status} />
                </div>
              </div>

              <div className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-50">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Your Cover Letter</h4>
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  "{selectedProposal.cover_letter || "No cover letter was recorded for this bid."}"
                </p>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Project Context</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedProposal.skills_required?.split(",").map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 font-bold">
                  PROPOSAL SUBMITTED ON: {new Date(selectedProposal.proposal_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link 
                to={`/projects/${selectedProposal.project_id}`}
                className="w-full inline-block bg-gray-900 text-white text-center py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors"
              >
                Go to Full Project Page
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACCEPT INVITE / BID SUBMISSION MODAL */}
      {acceptingInvite && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => setAcceptingInvite(null)} 
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-full font-bold transition-colors"
            >✕</button>
            
            <h2 className="text-xl font-black text-gray-900 mb-1 pr-6">Accept & Bid</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">
              Target: {acceptingInvite.project_title}
            </p>

            <form onSubmit={handleAcceptInvite} className="space-y-4">
              <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-xl border border-indigo-50 mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Budget</span>
                <span className="text-sm font-black text-indigo-600">₹{acceptingInvite.price_min} - ₹{acceptingInvite.price_max}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">My Bid (₹)</label>
                  <input 
                    type="number" 
                    required 
                    min={1}
                    value={proposalForm.bid_amount} 
                    onChange={(e) => setProposalForm({...proposalForm, bid_amount: e.target.value})} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700" 
                    placeholder="e.g. 25000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivery (Days)</label>
                  <input 
                    type="number" 
                    required 
                    min={1}
                    value={proposalForm.delivery_days} 
                    onChange={(e) => setProposalForm({...proposalForm, delivery_days: e.target.value})} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700" 
                    placeholder="e.g. 14"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cover Letter</label>
                <textarea 
                  required 
                  rows="4" 
                  value={proposalForm.cover_letter} 
                  onChange={(e) => setProposalForm({...proposalForm, cover_letter: e.target.value})} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-700 custom-scrollbar" 
                  placeholder="Pitch why you are the best fit for this project..."
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full bg-indigo-600 text-white text-center py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Submit Proposal & Accept
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Reusable UI Components
function StatCard({ label, value }) {
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
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${styles[status] || "bg-gray-100 text-gray-400"}`}>
      {status || "Unknown"}
    </span>
  );
}
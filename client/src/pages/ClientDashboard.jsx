import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchMyProjects } from "../features/projectSlice";
import { fetchClientStats } from "../features/statSlice";
import { fetchProjectProposals, acceptProposal } from "../features/proposalSlice";
import { fetchClientInvites, updateInviteStatus } from "../features/inviteSlice";
import ReviewModal from "../components/ReviewModal";
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell 
} from "recharts";

const COLORS = ['#F59E0B', '#6366F1', '#10B981']; 

export default function ClientDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  
  const { myProjects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { data: stats, loading: statsLoading } = useSelector((state) => state.stats);
  const { proposals, loading: proposalsLoading } = useSelector((state) => state.proposals);

  const { sentInvites, loading: invitesLoading } = useSelector((state) => state.invites);

  // --- Modal States ---
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null); // For Reviews
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Workspace Modals
  const [activeContractView, setActiveContractView] = useState(null); 
  const [closeOutView, setCloseOutView] = useState(null);
  
  // Funnel Modals
  const [reviewCandidatesList, setReviewCandidatesList] = useState(null); 
  const [selectedProposalDetail, setSelectedProposalDetail] = useState(null);
  const [findCandidatesModal, setFindCandidatesModal] = useState(null); // <-- ADD THIS

  //Timeframe state for stats filtering
  const [timeframe, setTimeframe] = useState('monthly');

  useEffect(() => {
    dispatch(fetchMyProjects());
    dispatch(fetchClientInvites()); // <-- Add this
    if (token) dispatch(fetchClientStats(timeframe));
  }, [dispatch, token, timeframe]);

  const activeAndCompleted = myProjects.filter(p => p.status !== 'open');
  const openFunnels = myProjects.filter(p => p.status === 'open');

  const statusCounts = myProjects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = [
    { name: 'Open (Bidding)', value: statusCounts['open'] || 0 },
    { name: 'Assigned (Active)', value: statusCounts['assigned'] || 0 },
    { name: 'Completed (Settled)', value: statusCounts['completed'] || 0 },
  ].filter(d => d.value > 0);

  const calculateDays = (date1, date2) => {
    const diffTime = new Date(date1) - new Date(date2);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDeadlineRisk = (deadline, status) => {
    if (status === 'completed') return { text: "Delivered", color: "text-green-600" };
    if (!deadline) return { text: "No Deadline", color: "text-gray-400" };
    const hoursLeft = (new Date(deadline) - new Date()) / (1000 * 60 * 60);
    const daysLeft = Math.ceil(hoursLeft / 24);
    if (hoursLeft <= 48 && hoursLeft > 0) return { text: "CRITICAL: < 48h", color: "text-red-600 font-black animate-pulse" };
    if (hoursLeft <= 0) return { text: "OVERDUE", color: "text-red-800 font-black" };
    return { text: `${daysLeft} days left`, color: "text-gray-500 font-bold" };
  };

  if (projectsLoading && myProjects.length === 0) {
    return <div className="flex justify-center items-center h-screen animate-pulse text-indigo-600 font-bold">Initializing COO Intelligence...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6 text-left relative">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Executive Command</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.name}. Capital flow and resource reliability telemetry.</p>
          </div>
          <Link to="/add-project" className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 transition-colors">+ Post Project</Link>
        </div>

        {/* 1. STATS QUICK CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Actual Spent" value={`₹${stats?.summary?.spent_capital || 0}`} sub="Settled Capital" color="text-green-600" />
          <StatCard label="Committed Escrow" value={`₹${stats?.summary?.committed_capital || 0}`} sub="Locked in Active Work" color="text-indigo-600" />
          <StatCard label="Projected Burn" value={`₹${Math.round(stats?.summary?.projected_budget || 0)}`} sub="Market Forecast" color="text-gray-400" />
          <StatCard label="Hiring Velocity" value={`${Math.round(stats?.summary?.avg_hiring_velocity || 0)}d`} sub="Avg. Time-to-Value" color="text-blue-600" />
        </div>

        {/* 2. VISUAL ANALYTICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Capital Allocation Flow (₹)</h3>
              
              {/* THE TIMEFRAME FILTER */}
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg font-bold text-gray-600 bg-gray-50 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="overall">Overall</option>
              </select>
            </div>
            
            <div className="h-64">
              {statsLoading ? (
                 <div className="h-full flex items-center justify-center text-gray-400 italic text-sm animate-pulse">Recalculating timeline...</div>
              ) : stats?.flow?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {/* STAYING WITH AREA CHART */}
                  <AreaChart data={stats.flow}>
                    <defs>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    {/* CRITICAL FIX: dataKey is now 'label' to support daily/yearly changes */}
                    <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={12} dy={10} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    
                    <Area type="monotone" dataKey="spent" stroke="#10B981" fillOpacity={1} fill="url(#colorSpent)" strokeWidth={3} name="Spent Capital" />
                    <Area type="monotone" dataKey="committed" stroke="#6366F1" fill="transparent" strokeWidth={3} strokeDasharray="5 5" name="Committed Escrow" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic text-sm border-2 border-dashed border-gray-100 rounded-2xl">
                  No transaction history recorded for this timeframe.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-gray-800 mb-6 w-full text-center">Operational Capacity</h3>
            <div className="h-48 w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} Projects`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic text-sm text-center">Post projects to track capacity.</div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 w-full text-[10px] font-black uppercase">
               {pieData.map((status, idx) => (
                 <span key={idx} style={{color: COLORS[idx % COLORS.length]}}>{status.name} ({status.value})</span>
               ))}
            </div>
          </div>
        </div>

        {/* 3. MIDDLE ROW: CRM & WORKSPACE */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10 items-start">
          
          {/* TALENT CRM */}
          <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
              <h2 className="text-lg font-bold text-gray-800">Preferred Talent</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Vetted Resource Network</p>
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {/* TABLE HEADER ADDED FOR MORE COLUMNS */}
              <div className="flex justify-between px-4 py-2 border-b border-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-400">
                <span>Freelancer</span>
                <span className="text-right">Financials & Score</span>
              </div>
              
              {stats?.talent?.length > 0 ? stats.talent.map(f => (
                <div key={f.freelancer_id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-2xl transition-colors mb-1 border border-transparent hover:border-gray-100 cursor-pointer" onClick={() => setSelectedTalent(f)}>
                  <div className="truncate pr-4">
                    <p className="font-bold text-sm text-gray-900 truncate group-hover:text-indigo-600 block">
                      {f.freelancer_name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase truncate mt-1">
                      {f.projects_with_them} Projects Done
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-gray-800 mb-1">₹{f.total_paid}</p>
                    <span className={`text-[9px] px-2 py-1 font-black rounded-lg transition-colors ${f.reliability_score >= 80 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                      {f.reliability_score}% RELIABLE
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-400 text-sm py-8 italic px-4">Hire talent to build your CRM.</p>
              )}
            </div>
          </div>

          {/* MY WORKSPACE (Assigned & Completed ONLY) */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Operational Workspace</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Active execution and settled deliveries</p>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest sticky top-0 z-10">
                  <tr>
                    <th className="px-8 py-4 whitespace-nowrap">Project & Status</th>
                    <th className="px-8 py-4 whitespace-nowrap">Due Date & Payment</th>
                    <th className="px-8 py-4 whitespace-nowrap">Financials</th>
                    <th className="px-8 py-4 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeAndCompleted.length > 0 ? (
                    activeAndCompleted.map((item) => {
                      const risk = getDeadlineRisk(item.deadline, item.status);
                      return (
                        <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                          <td className="px-8 py-5">
                            <Link to={`/projects/${item.id}`} className="font-bold text-gray-900 text-sm hover:text-indigo-600 transition-colors block mb-1">
                              {item.title}
                            </Link>
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <p className="text-sm font-bold text-gray-800 mb-1">
                              {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Unset'}
                            </p>
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${item.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                              Payment {item.status === 'completed' ? 'Done' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <p className="font-black text-gray-800 mb-1">₹{item.price_max}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Max Budget</p>
                          </td>
                          <td className="px-8 py-5 text-right relative">
                            <div className="group/menu inline-block">
                              <button className="px-3 py-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-bold text-xl">⋮</button>
                              <div className="absolute right-8 top-10 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50">
                                {/* Contextual Actions based on Status */}
                                {item.status === 'assigned' && (
                                  <button onClick={() => setActiveContractView(item)} className="block w-full px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 text-left font-bold border-b border-gray-50">
                                    ⚙️ Active Contract
                                  </button>
                                )}
                                {item.status === 'completed' && (
                                  <button onClick={() => setCloseOutView(item)} className="block w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 text-left font-bold border-b border-gray-50">
                                    🧾 Close-out Receipt
                                  </button>
                                )}
                                
                                <Link to={`/projects/${item.id}`} className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left font-bold">Manage Details</Link>
                                
                                {item.status === 'completed' && item.assigned_to && (
                                  <button onClick={() => { setSelectedProject(item); setIsReviewModalOpen(true); }} className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 font-bold border-t border-gray-50">
                                    {item.review_id ? "Edit Review" : "Leave Review"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="4" className="px-8 py-16 text-center text-gray-400 font-medium italic">No active or completed projects.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM ROW: TALENT FUNNEL (Open Projects ONLY) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Talent Funnel</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Market engagement on your open bids</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-4 whitespace-nowrap">Target Project</th>
                  <th className="px-8 py-4 whitespace-nowrap">Bid Density</th>
                  <th className="px-8 py-4 whitespace-nowrap">Market Projection</th>
                  <th className="px-8 py-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {openFunnels.length > 0 ? (
                  openFunnels.map((item) => {
                    const funnel = stats?.funnel?.find(f => f.id === item.id);
                    const proposalCount = Number(funnel?.proposal_count) || 0;
                    return (
                      <tr key={`funnel-${item.id}`} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <Link to={`/projects/${item.id}`} className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors block mb-1">
                            {item.title}
                          </Link>
                          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Posted: {new Date(item.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${proposalCount >= 10 ? 'bg-orange-100 text-orange-700' : proposalCount >= 5 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                            {proposalCount} Proposals
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-black text-gray-800 mb-1">Max: ₹{item.price_max}</p>
                        </td>
                        <td className="px-8 py-5 text-right relative">
                           {/* Funnel Routing Logic */}
                           {proposalCount === 0 ? (
                              <button 
                                onClick={() => setFindCandidatesModal(item)} 
                                className="text-[10px] font-black bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 tracking-widest uppercase transition-colors shadow-md shadow-indigo-100"
                              >
                                Find Candidates
                              </button>
                           ) : (
                              <button 
                                onClick={() => { 
                                  setReviewCandidatesList(item);
                                  dispatch(fetchProjectProposals(item.id)); 
                                }} 
                                className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 tracking-widest uppercase transition-colors"
                              >
                                Review Candidates
                              </button>
                           )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-medium italic">You have no open projects seeking talent.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* =========================================
              NEW: SENT DIRECT INVITES TRACKER
          ========================================= */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-black text-gray-900">Sent Direct Invites</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Outbound Recruitment Pipeline</p>
              </div>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">
                {sentInvites?.length || 0} Total
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invited Talent</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Project</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invitesLoading ? (
                    <tr><td colSpan="4" className="px-8 py-12 text-center text-gray-400 font-medium italic animate-pulse">Loading invites...</td></tr>
                  ) : sentInvites?.length > 0 ? (
                    sentInvites.map((invite) => (
                      <tr key={invite.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <Link to={`/profile/${invite.freelancer_id}`} className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors block mb-1">
                            {invite.freelancer_name} ↗
                          </Link>
                          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">
                            Sent: {new Date(invite.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <Link to={`/projects/${invite.project_id}`} className="font-bold text-gray-700 text-sm hover:text-indigo-600">
                            {invite.project_title}
                          </Link>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                            ${invite.status === 'open' ? 'bg-blue-50 text-blue-600' : 
                              invite.status === 'accepted' ? 'bg-green-50 text-green-600' : 
                              invite.status === 'rejected' ? 'bg-red-50 text-red-600' : 
                              'bg-gray-100 text-gray-500'}`}
                          >
                            {invite.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {invite.status === 'open' ? (
                            <button 
                              onClick={() => {
                                if(window.confirm("Are you sure you want to revoke this invite?")) {
                                  dispatch(updateInviteStatus({ inviteId: invite.id, status: 'expired' }))
                                    .then(() => dispatch(fetchClientInvites())); // Refresh list after update
                                }
                              }}
                              className="text-[10px] font-black bg-white border border-gray-200 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-200 tracking-widest uppercase transition-all"
                            >
                              Expire Invite
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Closed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="px-8 py-16 text-center text-gray-400 font-medium italic">You haven't sent any direct invites yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. ACTIVE CONTRACT MODAL */}
      {activeContractView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setActiveContractView(null)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-full font-bold transition-colors">✕</button>
            <h2 className="text-xl font-black text-gray-900 mb-1 pr-6">Active Contract</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 truncate pr-4">{activeContractView.title}</p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned To</span>
                <Link to={`/profile/${activeContractView.assigned_to}`} className="text-sm font-black text-indigo-600 hover:underline">
                  {activeContractView.freelancer_name || "Name Loading..."} ↗
                </Link>
              </div>

              {/* SPACIOUS FINANCIAL NUMBER LINE */}
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-50 mt-4 mb-6">
                <div className="flex justify-between items-end mb-4">
                  <div className="text-left">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Min Budget</span>
                    <span className="text-sm font-bold text-gray-600">₹{activeContractView.price_min || 0}</span>
                  </div>
                  <div className="text-center px-4">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Agreed Bid</span>
                    <span className="text-2xl font-black text-indigo-700">₹{activeContractView.bid_amount || activeContractView.price_min}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Max Budget</span>
                    <span className="text-sm font-bold text-gray-600">₹{activeContractView.price_max}</span>
                  </div>
                </div>

                {/* The Visual Number Line */}
                <div className="relative w-full h-2 bg-gray-200 rounded-full flex items-center mt-2">
                  {(() => {
                    const min = activeContractView.price_min || 0;
                    const max = activeContractView.price_max || 0;
                    const bid = activeContractView.bid_amount || min;
                    const percent = max > min ? Math.max(0, Math.min(((bid - min) / (max - min)) * 100, 100)) : 0;
                    
                    return (
                      <>
                        <div className="absolute h-full bg-indigo-200 rounded-full" style={{ width: `${percent}%` }}></div>
                        {/* The Indicator Dot */}
                        <div className="absolute w-4 h-4 bg-indigo-600 border-2 border-white rounded-full shadow-md z-10 transform -translate-x-1/2 transition-all duration-500" style={{ left: `${percent}%` }}></div>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <span className="block text-[10px] font-black text-blue-600 uppercase mb-1">Time Left</span>
                  <span className="text-lg font-black text-blue-800">
                    {activeContractView.deadline ? `${Math.max(0, calculateDays(activeContractView.deadline, new Date()))} Days` : 'Not Set'}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Hiring Velocity</span>
                  <span className="text-lg font-black text-gray-800">{calculateDays(activeContractView.updated_at, activeContractView.created_at)} Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROJECT CLOSE-OUT MODAL */}
      {closeOutView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setCloseOutView(null)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-full font-bold transition-colors">✕</button>
            <h2 className="text-xl font-black text-gray-900 mb-1 pr-6">Close-out Receipt</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 truncate pr-4">{closeOutView.title}</p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivered By</span>
                <Link to={`/profile/${closeOutView.assigned_to}`} className="text-sm font-black text-indigo-600 hover:underline">
                  {closeOutView.freelancer_name || "Name Loading..."} ↗
                </Link>
              </div>

              {/* SPACIOUS FINANCIAL NUMBER LINE */}
              <div className="bg-green-50/50 p-5 rounded-2xl border border-green-50 mt-4 mb-6">
                <div className="flex justify-between items-end mb-4">
                  <div className="text-left">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Min Budget</span>
                    <span className="text-sm font-bold text-gray-600">₹{closeOutView.price_min || 0}</span>
                  </div>
                  <div className="text-center px-4">
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest block mb-1">Final Payout</span>
                    <span className="text-2xl font-black text-green-700">₹{closeOutView.bid_amount || closeOutView.price_min}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Max Budget</span>
                    <span className="text-sm font-bold text-gray-600">₹{closeOutView.price_max}</span>
                  </div>
                </div>

                {/* The Visual Number Line */}
                <div className="relative w-full h-2 bg-gray-200 rounded-full flex items-center mt-2">
                  {(() => {
                    const min = closeOutView.price_min || 0;
                    const max = closeOutView.price_max || 0;
                    const bid = closeOutView.bid_amount || min;
                    const percent = max > min ? Math.max(0, Math.min(((bid - min) / (max - min)) * 100, 100)) : 0;
                    
                    return (
                      <>
                        <div className="absolute h-full bg-green-200 rounded-full" style={{ width: `${percent}%` }}></div>
                        {/* The Indicator Dot */}
                        <div className="absolute w-4 h-4 bg-green-600 border-2 border-white rounded-full shadow-md z-10 transform -translate-x-1/2 transition-all duration-500" style={{ left: `${percent}%` }}></div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Delivery Status</span>
                  {(() => {
                    if (!closeOutView.deadline) return <span className="text-lg font-black text-gray-600">Delivered</span>;
                    const daysDiff = calculateDays(closeOutView.deadline, closeOutView.updated_at);
                    if (daysDiff > 0) return <span className="text-lg font-black text-green-600">Early</span>;
                    if (daysDiff === 0) return <span className="text-lg font-black text-blue-600">On-Time</span>;
                    return <span className="text-lg font-black text-red-600">Delayed</span>;
                  })()}
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Hiring Velocity</span>
                  <span className="text-lg font-black text-gray-800">{calculateDays(closeOutView.updated_at, closeOutView.created_at)} Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW BUG B FIX: FIND CANDIDATES MODAL */}
      {findCandidatesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative flex flex-col max-h-[85vh]">
            <button onClick={() => setFindCandidatesModal(null)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full font-bold">✕</button>
            <h2 className="text-2xl font-black text-gray-900 mb-1 pr-6">Invite Network</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Target: {findCandidatesModal.title}</p>
            
            <div className="overflow-y-auto custom-scrollbar pr-2 space-y-3 mb-6">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preferred CRM Talent</h4>
              {stats?.talent?.length > 0 ? stats.talent.map(f => (
                <div key={f.freelancer_id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center hover:border-indigo-200 transition-colors bg-gray-50/50">
                  <div>
                    <Link to={`/profile/${f.freelancer_id}`} className="font-bold text-gray-900 text-sm hover:text-indigo-600 transition-colors">
                      {f.freelancer_name} ↗
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase">
                      <span className="text-indigo-600">{f.projects_with_them} Past Projects</span>
                      <span className={`${f.reliability_score >= 80 ? 'text-green-600' : 'text-orange-500'}`}>{f.reliability_score}% Reliable</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center text-xs font-bold text-gray-400 italic py-8 border border-dashed border-gray-200 rounded-xl">
                  No preferred talent in your CRM yet.
                </div>
              )}
            </div>

            <button 
              onClick={() => navigate('/freelancers')}
              className="w-full bg-indigo-600 text-white text-center py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Browse & Hire New Freelancer
            </button>
          </div>
        </div>
      )}

      {/* 3. FUNNEL MODAL 1: LIST OF PROPOSALS */}
      {reviewCandidatesList && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button onClick={() => setReviewCandidatesList(null)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full font-bold">✕</button>
            <h2 className="text-2xl font-black text-gray-900 mb-1 pr-6">Candidate Pool</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">For: {reviewCandidatesList.title}</p>
            
            <div className="overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {proposalsLoading ? (
                <div className="text-center text-sm font-bold text-indigo-600 animate-pulse py-8">Fetching Live Proposals...</div>
              ) : proposals.length > 0 ? (
                proposals.map((proposal) => (
                  <div key={proposal.id} className="border border-gray-100 rounded-xl p-4 flex justify-between items-center hover:border-indigo-200 transition-colors bg-gray-50/50">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{proposal.freelancer_name}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase">
                        <span className="text-green-600">Bid: ₹{proposal.bid_amount}</span>
                        <span className="text-indigo-500">{proposal.delivery_days} Days Promise</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setReviewCandidatesList(null);
                        setSelectedProposalDetail({ 
                           ...proposal, 
                           projectTitle: reviewCandidatesList.title 
                        });
                      }} 
                      className="bg-white border border-gray-200 text-indigo-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 shadow-sm"
                    >
                      Show Proposal
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs font-bold text-gray-400 italic py-8">No proposals found for this project.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. FUNNEL MODAL 2: DEEP DIVE PROPOSAL */}
      {selectedProposalDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative flex flex-col">
            <button onClick={() => setSelectedProposalDetail(null)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full font-bold">✕</button>
            
            <Link to={`/profile/${selectedProposalDetail.freelancer_id}`} className="text-2xl font-black text-indigo-600 hover:underline mb-1 pr-6 block w-fit">
              {selectedProposalDetail.freelancer_name} ↗
            </Link>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Proposal Details</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                <span className="block text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Proposed Bid</span>
                <span className="text-xl font-black text-green-700">₹{selectedProposalDetail.bid_amount}</span>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                <span className="block text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-1">Delivery Timeline</span>
                <span className="text-xl font-black text-indigo-700">{selectedProposalDetail.delivery_days} Days</span>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6 max-h-48 overflow-y-auto custom-scrollbar">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cover Letter</h4>
              <p className="text-sm text-gray-700 leading-relaxed italic whitespace-pre-wrap">
                "{selectedProposalDetail.cover_letter}"
              </p>
            </div>

            <button 
              onClick={() => {
                // Clicking Hire Now redirects to the Project Details page
                navigate(`/projects/${selectedProposalDetail.project_id}`);
              }}
              className="w-full bg-indigo-600 text-white text-center py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Hire Now
            </button>
          </div>
        </div>
      )}

      {/* 1. TALENT CRM MODAL (High-Definition Deep Dive) */}
      {selectedTalent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative flex flex-col max-h-[90vh]">
            <button onClick={() => setSelectedTalent(null)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-full font-bold transition-colors">✕</button>
            
            {/* Header: Name & Skills */}
            <div className="shrink-0 mb-6 border-b border-gray-100 pb-6">
              <Link to={`/profile/${selectedTalent.freelancer_id}`} className="text-2xl font-black text-indigo-600 hover:underline mb-1 pr-6 block">
                {selectedTalent.freelancer_name} ↗
              </Link>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTalent.freelancer_skills ? selectedTalent.freelancer_skills.split(',').map((skill, i) => (
                  <span key={i} className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase font-bold">{skill.trim()}</span>
                )) : <span className="text-[9px] text-gray-400 font-bold uppercase">No skills listed</span>}
              </div>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar pr-2 space-y-6">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-center flex flex-col justify-center">
                  <span className="block text-xl font-black text-indigo-600">{selectedTalent.projects_with_them}</span>
                  <span className="text-[9px] font-bold text-indigo-800 uppercase tracking-widest mt-1">Projects</span>
                </div>
                <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-center flex flex-col justify-center">
                  <span className="block text-xl font-black text-green-700">₹{selectedTalent.total_paid}</span>
                  <span className="text-[9px] font-bold text-green-800 uppercase tracking-widest mt-1">Total Paid</span>
                </div>
                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-center flex flex-col justify-center">
                  <span className="block text-xl font-black text-yellow-600">
                    {selectedTalent.avg_rating ? `★ ${Number(selectedTalent.avg_rating).toFixed(1)}` : 'N/A'}
                  </span>
                  <span className="text-[9px] font-bold text-yellow-800 uppercase tracking-widest mt-1">Avg Rating</span>
                </div>
              </div>

              {/* Delivery Speed Indicator */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg. Delivery Speed</span>
                <span className={`text-sm font-black ${selectedTalent.avg_delivery_delta <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                   {selectedTalent.avg_delivery_delta <= 0 ? `${Math.abs(selectedTalent.avg_delivery_delta).toFixed(1)} Days Early` : `${Number(selectedTalent.avg_delivery_delta).toFixed(1)} Days Late`}
                </span>
              </div>

              {/* Project History List */}
              <div className="pt-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Project History</h4>
                <div className="space-y-2">
                  {selectedTalent.project_history && selectedTalent.project_history.map((proj, idx) => (
                    <div key={idx} className="p-3 border border-gray-100 rounded-xl bg-white flex justify-between items-center hover:border-indigo-100 transition-colors">
                      <div className="truncate pr-4">
                        <Link to={`/projects/${proj.id}`} className="text-xs font-bold text-gray-800 hover:text-indigo-600 truncate block">{proj.title}</Link>
                        <span className="text-[9px] font-black text-green-600">₹{proj.amount}</span>
                      </div>
                      <StatusBadge status={proj.status} />
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}

      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} project={selectedProject} onReviewSuccess={() => dispatch(fetchMyProjects())} />
    </div>
  );
}

function StatCard({ label, value, sub, color = "text-gray-900" }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
      <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="text-[9px] font-bold text-gray-300 uppercase mt-2">{sub}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = { open: "bg-orange-100 text-orange-700", assigned: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700" };
  return <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${styles[status] || "bg-gray-100 text-gray-400"}`}>{status || "Unknown"}</span>;
}
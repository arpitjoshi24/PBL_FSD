import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchSingleProject, resetProjectState, updateProjectStatus } from "../features/projectSlice";
import { 
  createProposal, 
  fetchProjectProposals, 
  acceptProposal, 
  resetProposalState 
} from "../features/proposalSlice";

export default function ProjectDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();

  // Local state for freelancer bidding
  const [bidAmount, setBidAmount] = useState("");
  const [proposalText, setProposalText] = useState("");

  // Get state from multiple slices
  const { user } = useSelector((state) => state.auth);
  const { singleProject, loading: projectLoading } = useSelector((state) => state.projects);
  const { proposals, success: acceptSuccess, loading: proposalLoading } = useSelector((state) => state.proposals);

  const isOwner = user?.id === singleProject?.client_id;
  const isFreelancer = user?.role === "freelancer";

  // Check if the current freelancer has already bid on this project
  const hasBidded = proposals.find(p => p.freelancer_id === user?.id);

  useEffect(() => {
    dispatch(fetchSingleProject(id));
  }, [dispatch, id]);

  // Fetch proposals only if the logged-in user is the owner
  useEffect(() => {
    if (isOwner) {
      dispatch(fetchProjectProposals(id));
    }
  }, [dispatch, id, isOwner]);

  // Handle successful hiring
  useEffect(() => {
    if (acceptSuccess) {
      alert("Hired successfully!");
      dispatch(fetchSingleProject(id)); 
      dispatch(fetchProjectProposals(id)); 
      dispatch(resetProposalState());
    }
  }, [acceptSuccess, dispatch, id]);

  const handleBidSubmit = async () => {
    if (!bidAmount || !proposalText) {
      alert("Please fill all fields");
      return;
    }

    const result = await dispatch(
      createProposal({
        project_id: id,
        bid_amount: bidAmount,
        cover_letter: proposalText,
      })
    );

    if (createProposal.fulfilled.match(result)) {
      alert("Proposal submitted successfully");
      setBidAmount("");
      setProposalText("");
      dispatch(resetProjectState());
      // Refresh proposals to update the 'hasBidded' check immediately
      if (isFreelancer) dispatch(fetchProjectProposals(id)); 
    }
  };

  const handleAccept = (proposalId) => {
    if (window.confirm("Are you sure you want to hire this freelancer?")) {
      dispatch(acceptProposal(proposalId));
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (window.confirm(`Are you sure you want to mark this project as ${newStatus}?`)) {
      const result = await dispatch(updateProjectStatus({ id, status: newStatus }));
      
      if (updateProjectStatus.fulfilled.match(result)) {
        alert(`Project successfully marked as ${newStatus}`);
        dispatch(fetchSingleProject(id));
      }
    }
  };

  if (projectLoading && !singleProject) {
    return <div className="flex justify-center items-center h-screen text-xl font-medium text-gray-600">Loading Project...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        
        {/* Left Side: Project Details */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-4xl font-bold text-gray-800 tracking-tight">{singleProject?.title}</h1>
              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                singleProject?.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {singleProject?.status}
              </span>
            </div>
            
            <p className="text-gray-500 mb-6 italic">
              Posted by <span className="font-semibold text-indigo-600 not-italic">{singleProject?.client_name}</span>
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Budget Range</p>
                <p className="text-xl font-bold text-gray-800">₹{singleProject?.price_min} - ₹{singleProject?.price_max}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Expected Deadline</p>
                <p className="text-xl font-bold text-gray-800">{singleProject?.deadline?.split("T")[0]}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {singleProject?.skills_required?.split(",").map((skill, index) => (
                  <span key={index} className="bg-white border border-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Project Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{singleProject?.description}</p>
            </div>
          </div>

          {/* Client View: List of Applicants */}
          {isOwner && (
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Received Proposals ({proposals.length})</h2>
              <div className="space-y-6">
                {proposals.length > 0 ? proposals.map((p) => (
                  <div key={p.id} className="p-5 rounded-2xl border border-gray-50 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">{p.freelancer_name}</h4>
                        <p className="text-indigo-600 font-bold">Bid: ₹{p.bid_amount}</p>
                      </div>
                      {singleProject?.status === 'open' && (
                        <button 
                          onClick={() => handleAccept(p.id)}
                          className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                        >
                          Hire Now
                        </button>
                      )}
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                       <p className="text-gray-600 text-sm leading-relaxed">"{p.cover_letter}"</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10">
                    <p className="text-gray-400 italic">No proposals received yet. Your project is still visible to freelancers!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Column */}
        <div className="md:col-span-1">
          
          {/* 1. Freelancer Bid Form */}
          {isFreelancer && singleProject?.status === 'open' && !isOwner && !hasBidded && (
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Place a Bid</h2>
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-400 uppercase">Bid Amount (₹)</label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full mt-2 border-gray-100 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                  placeholder="Enter amount"
                />
              </div>
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-400 uppercase">Proposal / Cover Letter</label>
                <textarea
                  rows="6"
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  className="w-full mt-2 border-gray-100 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                  placeholder="Why should the client hire you?"
                />
              </div>
              <button
                onClick={handleBidSubmit}
                disabled={proposalLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {proposalLoading ? "Submitting..." : "Send Proposal"}
              </button>
            </div>
          )}

          {/* 2. Bid Status for Freelancers (Only if they bidded and project isn't open) */}
          {isFreelancer && hasBidded && singleProject?.status !== 'open' && (
            <div className="bg-indigo-600 rounded-2xl shadow-xl p-8 sticky top-24 text-white">
              <h3 className="text-xl font-bold mb-2">Project Status Update</h3>
              <p className="opacity-90 mb-6 leading-relaxed text-sm">This project has transitioned to the <strong>{singleProject?.status}</strong> phase.</p>
              <div className="bg-white/10 p-4 rounded-xl">
                <p className="text-xs uppercase font-bold opacity-70 mb-1">Your Bid Outcome</p>
                <p className="text-lg font-bold capitalize">{hasBidded.status}</p>
              </div>
            </div>
          )}

          {/* 3. Owner Management Actions */}
          {isOwner && singleProject?.status !== 'open' && (
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24 border-t-4 border-indigo-600">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Manage Project</h2>
              <div className="mb-6 bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Work Flow Status</p>
                <p className="text-lg font-bold text-indigo-600 uppercase tracking-tight">{singleProject?.status}</p>
              </div>
              
              {singleProject?.status === 'assigned' && (
                <button 
                  onClick={() => handleUpdateStatus('completed')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-green-100"
                >
                  Mark as Completed
                </button>
              )}

              {singleProject?.status === 'completed' && (
                <div className="text-center p-4 bg-green-50 rounded-xl text-green-700 font-bold border border-green-100">
                   🏆 Project Finished
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchSingleUser } from "../features/userSlice"; 
import { fetchUserReviews } from "../features/reviewSlice";
import { updateUserProfile } from "../features/authSlice";
import { fetchMyProjects } from "../features/projectSlice"; 
import { sendInvite } from "../features/inviteSlice"; 
import ContributionHeatmap from "../components/ContributionHeatmap";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6'];

export default function Profile() {
  const { id } = useParams(); // ID from URL
  const dispatch = useDispatch();

  const { user: currentUser } = useSelector((state) => state.auth);
  const { singleUser: profileUser, loading: userLoading } = useSelector((state) => state.users);
  const { list: reviews, loading: reviewsLoading } = useSelector((state) => state.reviews);
  
  // REDUX SELECTORS FOR INVITE WORKFLOW
  const { myProjects } = useSelector((state) => state.projects);
  const { loading: inviteLoading } = useSelector((state) => state.invites);
  
  // Determine whose profile we are looking at. If no ID in URL, default to self.
  const cleanId = id === "undefined" ? null : id;
  const targetId = cleanId || currentUser?.id;
  const isMyProfile = currentUser?.id === Number(targetId);
  const displayUser = isMyProfile ? currentUser : profileUser;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitingProjectId, setInvitingProjectId] = useState(null);

  useEffect(() => {
    if (targetId && targetId !== "undefined") {
      if (!isMyProfile) {
        dispatch(fetchSingleUser(targetId));
      }
      dispatch(fetchUserReviews(targetId));
    }
  }, [dispatch, targetId, isMyProfile]);

  // FETCH CLIENT PROJECTS QUIETLY
  useEffect(() => {
    if (currentUser && currentUser.role === 'client') {
      dispatch(fetchMyProjects());
    }
  }, [dispatch, currentUser]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateUserProfile(formData));
    if (updateUserProfile.fulfilled.match(result)) setIsEditing(false);
  };

  if ((userLoading && !isMyProfile) || !displayUser) {
    return <div className="flex justify-center items-center h-screen text-xl font-bold text-gray-400 animate-pulse">Loading Profile...</div>;
  }

  // Calculate Average Rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) 
    : "New";

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6 pb-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-indigo-600 rounded-full flex items-center justify-center text-5xl font-black text-white shadow-xl shadow-indigo-100">
            {displayUser?.name?.[0]}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
              <h1 className="text-4xl font-black text-gray-900">{displayUser?.name}</h1>
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                {displayUser?.role}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-500 mb-6">{displayUser?.company || "Independent Professional"}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="font-bold text-indigo-600">★ {avgRating}</span> 
                <span>({reviews.length} Reviews)</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-3">
            {/* Contextual Action Button */}
            {isMyProfile ? (
              <button 
                onClick={() => {
                  // If opening the form, prepopulate immediately to avoid cascading renders
                  if (!isEditing) {
                    setFormData({
                      name: displayUser.name || "",
                      about: displayUser.about || "",
                      skills: displayUser.skills || "",
                      company: displayUser.company || "",
                    });
                  }
                  setIsEditing(!isEditing);
                }}
                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-lg hover:bg-gray-800 transition-all"
              >
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </button>
            ) : currentUser?.role === "client" ? (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="block text-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all"
              >
                Invite to Project
              </button>
            ) : null}
          </div>
        </div>

        {/* EDIT MODE vs VIEW MODE */}
        {isEditing ? (
           <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
             <h2 className="text-2xl font-black mb-6">Edit Your Details</h2>
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                {displayUser.role === "client" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Company Name</label>
                    <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                )}
                {displayUser.role === "freelancer" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Skills (Comma Separated)</label>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                )}
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-500 mb-2">Professional Bio</label>
                <textarea name="about" rows="4" value={formData.about} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" />
             </div>
             <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700">Save Changes</button>
           </form>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column: Skills & Info */}
            <div className="md:col-span-1 space-y-8">
              {displayUser?.role === "freelancer" && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Core Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {displayUser?.skills ? displayUser.skills.split(",").map((skill, index) => (
                      <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                        {skill.trim()}
                      </span>
                    )) : <p className="text-sm text-gray-400">No skills listed.</p>}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Contact Info</h2>
                {isMyProfile || currentUser?.role === "client" ? (
                  <p className="text-gray-700 font-bold break-all">{displayUser?.email}</p>
                ) : (
                  <p className="text-gray-400 italic text-sm">Hidden for privacy</p>
                )}
              </div>
            </div>

            {/* Right Column: Bio, Stats & Reviews */}
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black text-gray-900 mb-4">Professional Bio</h2>
                <p className="text-gray-600 leading-relaxed text-lg italic">
                  {displayUser?.about ? `"${displayUser.about}"` : "This user hasn't shared their story yet."}
                </p>
              </div>
              
              {/* NEW: THE HEATMAP COMPONENT */}
  {displayUser?.role === "freelancer" && (
    <ContributionHeatmap dates={displayUser?.contribution_dates} />
  )}

              {/* VERIFIED EXPERTISE GRAPH */}
              {displayUser?.role === "freelancer" && displayUser?.techStack?.length > 0 && (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 w-full">
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Verified Expertise</h2>
                    <p className="text-sm text-gray-500 mb-4">Based on successfully completed platform projects.</p>
                    <div className="flex flex-wrap gap-2">
                       {displayUser.techStack.map((tech, idx) => (
                         <span key={idx} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-black uppercase" style={{color: COLORS[idx % COLORS.length]}}>
                           {tech.name} ({tech.value})
                         </span>
                       ))}
                    </div>
                  </div>
                  <div className="w-full md:w-48 h-48 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={displayUser.techStack} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                          {displayUser.techStack.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} Projects`, name.toUpperCase()]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Dynamic Database Reviews */}
              {displayUser?.role === "freelancer" && (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-2xl font-black text-gray-900 mb-6">Client Testimonials</h2>
                  <div className="space-y-6">
                    {reviewsLoading ? (
                      <p className="text-gray-400 animate-pulse">Loading reviews...</p>
                    ) : reviews.length > 0 ? (
                      reviews.map((rev) => (
                        <div key={rev.id} className="border-b border-gray-50 pb-6 last:border-0">
                          <div className="flex justify-between mb-2">
                            <span className="font-bold text-gray-800">{rev.project_title || "Project Review"}</span>
                            <span className="text-indigo-600 font-bold">★ {rev.rating}.0</span>
                          </div>
                          <p className="text-[11px] text-gray-400 mb-3 uppercase tracking-wider font-bold">
                            Client: <span className="text-gray-700">{rev.client_name}</span> | Tech: <span className="text-indigo-500">{rev.project_skills}</span>
                          </p>
                          <p className="text-sm text-gray-600 leading-relaxed">"{rev.comment}"</p>
                          <p className="text-[10px] text-gray-400 mt-3 uppercase font-bold tracking-widest">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No reviews yet. Hire them to be the first!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- DIRECT INVITE MODAL --- */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative max-h-[80vh] flex flex-col">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-full font-bold transition-colors">✕</button>
            <h2 className="text-xl font-black text-gray-900 mb-1 pr-6">Direct Invite</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Select an Open Project</p>
            
            <div className="overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {myProjects && myProjects.filter(p => p.status === 'open').length > 0 ? (
                myProjects.filter(p => p.status === 'open').map((project) => (
                  <div key={project.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors bg-gray-50/50 group">
                    <p className="font-bold text-gray-900 text-sm mb-1">{project.title}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Budget: ₹{project.price_min} - ₹{project.price_max}
                      </span>
                      <button 
                        disabled={inviteLoading}
                        onClick={async () => {
                          setInvitingProjectId(project.id);
                          try {
                            // .unwrap() allows us to catch the exact success/fail moment without a useEffect
                            await dispatch(sendInvite({ project_id: project.id, freelancer_id: displayUser.id })).unwrap();
                            alert("Invite sent successfully!");
                            setShowInviteModal(false);
                          } catch (err) {
                            alert(err || "Failed to send invite");
                          } finally {
                            setInvitingProjectId(null); // Clears the loading text on this specific button
                          }
                        }}
                        className="text-[10px] font-black bg-white border border-gray-200 text-indigo-600 px-4 py-2 rounded-lg uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm transition-all disabled:opacity-50"
                      >
                        {inviteLoading && invitingProjectId === project.id ? 'Sending...' : 'Send Invite'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs font-bold text-gray-400 italic py-8 border-2 border-dashed border-gray-100 rounded-2xl">
                  You have no open projects available for invites.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
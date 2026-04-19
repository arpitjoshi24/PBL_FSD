import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile, clearError } from "../features/authSlice";

export default function Profile() {
  const { user, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    skills: "",
    company: "",
  });

  // Sync local state when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        about: user.about || "",
        skills: user.skills || "",
        company: user.company || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateUserProfile(formData));
    if (updateUserProfile.fulfilled.match(result)) {
      setIsEditing(false);
    }
  };

  if (!user) return <div className="pt-24 text-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-indigo-600 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-sm">
              {user.name?.charAt(0)}
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            <button 
              onClick={() => {
                setIsEditing(!isEditing);
                dispatch(clearError());
              }}
              className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <hr className="my-8 border-gray-100" />

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full mt-2 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                {user.role === "client" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Company Name</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full mt-2 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}
                {user.role === "freelancer" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Skills (Comma Separated)</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="React, Node.js, SQL..."
                      className="w-full mt-2 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">About / Bio</label>
                <textarea
                  name="about"
                  rows="4"
                  value={formData.about}
                  onChange={handleChange}
                  className="w-full mt-2 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <button 
                type="submit" 
                disabled={loading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              {user.role === "client" && user.company && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Company</h3>
                  <p className="text-lg text-gray-800 font-medium">{user.company}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">
                  {user.about || "No bio added yet."}
                </p>
              </div>

              {user.role === "freelancer" && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills ? user.skills.split(",").map((skill, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium">
                        {skill.trim()}
                      </span>
                    )) : <p className="text-gray-500 italic">No skills listed.</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProject, resetProjectState } from "../features/projectSlice";

export default function AddProjects() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.projects);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price_min: "",
    price_max: "",
    skills_required: "",
    deadline: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resultAction = await dispatch(createProject(formData));

    if (createProject.fulfilled.match(resultAction)) {
      alert("Project Created Successfully 🚀");

      // Reset form safely here
      setFormData({
        title: "",
        description: "",
        price_min: "",
        price_max: "",
        skills_required: "",
        deadline: "",
      });

      dispatch(resetProjectState());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex justify-center items-center p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Create New Project
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            name="title"
            placeholder="Project Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none"
            required
          />

          <textarea
            name="description"
            placeholder="Project Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none"
            required
          />

          <div className="flex gap-4">
            <input
              type="number"
              name="price_min"
              placeholder="Min Budget"
              value={formData.price_min}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />

            <input
              type="number"
              name="price_max"
              placeholder="Max Budget"
              value={formData.price_max}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          <input
            type="text"
            name="skills_required"
            placeholder="Skills Required (comma separated)"
            value={formData.skills_required}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-indigo-400 outline-none"
            required
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Submit Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSingleProject,
  createProposal,
  resetProjectState,
} from "../features/projectSlice";
import { useParams } from "react-router-dom";

export default function ProjectDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [bidAmount, setBidAmount] = useState("");
  const [proposal, setProposal] = useState("");

  const { singleProject, loading, error } = useSelector(
    (state) => state.projects
  );

  useEffect(() => {
    dispatch(fetchSingleProject(id));
  }, [dispatch, id]);

  const handleBidSubmit = async () => {
    if (!bidAmount || !proposal) {
      alert("Please fill all fields");
      return;
    }

    const result = await dispatch(
      createProposal({
        project_id: id,
        bid_amount: bidAmount,
        cover_letter: proposal,
      })
    );

    if (createProposal.fulfilled.match(result)) {
      alert("Proposal submitted successfully ");

      setBidAmount("");
      setProposal("");

      dispatch(resetProjectState());
    }
  };

  if (loading && !singleProject) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading Project...
      </div>
    );
  }

  if (error && !singleProject) {
    return (
      <div className="text-center text-red-500 mt-10">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">

        {/* Left Side */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-md p-8">

          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            {singleProject?.title}
          </h1>

          <p className="text-gray-500 mb-6">
            Posted by{" "}
            <span className="font-semibold text-indigo-600">
              {singleProject?.client_name}
            </span>
          </p>

          {/* Budget + Deadline */}
          <div className="grid grid-cols-2 gap-4 mb-8">

            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-sm text-gray-500">Budget</p>
              <p className="text-xl font-semibold">
                ₹{singleProject?.price_min} - ₹{singleProject?.price_max}
              </p>
            </div>

            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-sm text-gray-500">Deadline</p>
              <p className="text-xl font-semibold">
                {singleProject?.deadline?.split("T")[0]}
              </p>
            </div>

          </div>

          {/* Skills */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">
              Skills Required
            </h2>

            <div className="flex flex-wrap gap-3">
              {singleProject?.skills_required
                ?.split(",")
                .map((skill, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Project Description
            </h2>

            <p className="text-gray-700 leading-relaxed">
              {singleProject?.description}
            </p>
          </div>
        </div>

        {/* Right Side Proposal Form */}
        <div className="bg-white rounded-2xl shadow-md p-6 h-fit sticky top-24">

          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Submit Your Proposal
          </h2>

          {/* Bid Amount */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600">
              Bid Amount
            </label>

            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
              placeholder="₹ Enter bid amount"
            />
          </div>

          {/* Proposal */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-600">
              Proposal
            </label>

            <textarea
              rows="5"
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
              placeholder="Write your proposal..."
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleBidSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
          >
            Submit Proposal
          </button>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm mt-4">
              {error}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
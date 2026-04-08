import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchProjects } from "../features/projectSlice";

export default function Filter() {
  const dispatch = useDispatch();

  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [skills, setSkills] = useState("");
  const [deadline, setDeadline] = useState("");

  // Auto filter with debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      dispatch(
        fetchProjects({
          minBudget,
          maxBudget,
          skills,
          deadline,
        })
      );
    }, 500); // 500ms delay

    return () => clearTimeout(delay);
  }, [minBudget, maxBudget, skills, deadline, dispatch]);

  const clearFilters = () => {
    setMinBudget("");
    setMaxBudget("");
    setSkills("");
    setDeadline("");
    dispatch(fetchProjects()); // reload all
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 sticky top-24">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        Filter Projects
      </h2>

      {/* Min Budget */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600">
          Min Budget
        </label>
        <input
          type="number"
          value={minBudget}
          onChange={(e) => setMinBudget(e.target.value)}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          placeholder="₹ 1000"
        />
      </div>

      {/* Max Budget */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600">
          Max Budget
        </label>
        <input
          type="number"
          value={maxBudget}
          onChange={(e) => setMaxBudget(e.target.value)}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          placeholder="₹ 50000"
        />
      </div>

      {/* Skills */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-600">
          Skills (comma separated)
        </label>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          placeholder="React, Node"
        />
      </div>

      {/* Deadline */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-600">
          Deadline Before
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Clear Button */}
      <button
        onClick={clearFilters}
        className="w-full border border-gray-300 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
      >
        Clear Filters
      </button>
    </div>
  );
}
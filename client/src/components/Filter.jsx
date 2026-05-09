import React from "react";

export default function Filter({ filters, setFilters, clearFilters }) {
  
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Guard clause just in case it renders before props are passed
  if (!filters) return null;

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
          value={filters.minBudget || ""}
          onChange={(e) => handleChange("minBudget", e.target.value)}
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
          value={filters.maxBudget || ""}
          onChange={(e) => handleChange("maxBudget", e.target.value)}
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
          value={filters.skills || ""}
          onChange={(e) => handleChange("skills", e.target.value)}
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
          value={filters.deadline || ""}
          onChange={(e) => handleChange("deadline", e.target.value)}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Clear Button */}
      <button
        onClick={clearFilters}
        className="w-full border border-gray-300 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition font-bold"
      >
        Clear Filters
      </button>
    </div>
  );
}
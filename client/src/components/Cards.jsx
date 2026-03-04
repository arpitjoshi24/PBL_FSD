import React from "react";
import { useNavigate } from "react-router-dom";

export default function Cards({ project }) {
  const navigate = useNavigate();

  const formattedDate = new Date(project.deadline).toLocaleDateString();

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:-translate-y-1">

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {project.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {project.description}
      </p>

      {/* Budget + Deadline */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          ₹ {project.price_min} - ₹ {project.price_max}
        </span>

        <span className="text-sm text-gray-500">
          ⏳ {formattedDate}
        </span>
      </div>

      {/* Skills */}
      {project.skills_required && (
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills_required.split(",").map((skill, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {skill.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Button */}
      <button
        onClick={() => navigate(`/projects/${project.id}`)}
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-2 rounded-xl font-medium hover:scale-105 transition-transform duration-300"
      >
        View Details
      </button>
    </div>
  );
}
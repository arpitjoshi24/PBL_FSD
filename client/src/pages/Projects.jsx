import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../features/projectSlice";
import Cards from "../components/Cards";
import Filter from "../components/Filter";

export default function Projects() {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector(
    (state) => state.projects
  );

  // Load all projects initially
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">

        {/* Filter Sidebar */}
        <div className="md:w-1/4">
          <Filter />
        </div>

        {/* Projects Section */}
        <div className="md:w-3/4">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Available Projects
          </h1>

          {/* Loading */}
          {loading && (
            <p className="text-gray-500 animate-pulse">
              Loading projects...
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-500 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          {/* Empty State */}
          {!loading && projects.length === 0 && (
            <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
              No projects found matching your filters.
            </div>
          )}

          {/* Projects Grid */}
          {!loading && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Cards key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
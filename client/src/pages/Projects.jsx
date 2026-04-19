import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../features/projectSlice";
import Cards from "../components/Cards";
import Filter from "../components/Filter";

export default function Projects() {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <Filter /> {/* Your existing filter logic */}
        </div>
        <div className="md:w-3/4">
          <h1 className="text-3xl font-black mb-6 text-gray-900">Available Projects</h1>
          {loading && <p className="text-gray-500 animate-pulse">Scanning marketplace...</p>}
          {!loading && projects.length === 0 && (
            <div className="bg-white p-10 rounded-xl shadow-sm border text-center text-gray-500">
              No projects match your current filters.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!loading && projects.map((project) => (
              <Cards key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
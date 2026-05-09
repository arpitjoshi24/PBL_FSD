import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../features/projectSlice";
import Cards from "../components/Cards";
import Filter from "../components/Filter";

export default function Projects() {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state) => state.projects);
  
  // 1. Master Filter State (Combines Search + Sidebar Filters)
  const [filters, setFilters] = useState({
    search: "",
    minBudget: "",
    maxBudget: "",
    skills: "",
    deadline: ""
  });

  // 2. The Debounce Effect (Fires automatically when ANY filter changes)
  useEffect(() => {
    const delay = setTimeout(() => {
      dispatch(fetchProjects(filters));
    }, 500); // 500ms delay

    return () => clearTimeout(delay);
  }, [filters, dispatch]);

  // 3. Clear all filters
  const handleClearFilters = () => {
    setFilters({ search: "", minBudget: "", maxBudget: "", skills: "", deadline: "" });
  };

  return (
    <div className="min-h-screen bg-[#F3F2EF] pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* LEFT: The Filter Sidebar (Passing state down as props) */}
        <div className="md:w-1/4">
          <Filter 
            filters={filters} 
            setFilters={setFilters} 
            clearFilters={handleClearFilters} 
          />
        </div>

        {/* RIGHT: Search Bar & Project List */}
        <div className="md:w-3/4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-black text-gray-900">Available Projects</h1>
            
            {/* The Unified Search Bar */}
            <div className="flex gap-2 max-w-md w-full relative">
              <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search keywords or titles..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="flex-1 bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              />
              {filters.search && (
                <button 
                  onClick={() => setFilters({ ...filters, search: "" })}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Error / Loading States */}
          {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
          {loading && <p className="text-indigo-600 font-black uppercase tracking-widest text-xs animate-pulse mb-6">Scanning marketplace...</p>}
          
          {/* Empty State */}
          {!loading && projects.length === 0 && (
            <div className="bg-white p-16 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center mt-4">
              <span className="text-5xl mb-4">🏜️</span>
              <p className="text-gray-500 font-bold text-lg">No projects match your criteria.</p>
              <p className="text-gray-400 text-sm mt-1 mb-6">Try adjusting your filters or search terms.</p>
              <button 
                onClick={handleClearFilters} 
                className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Project Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
            {!loading && projects.map((project) => (
              <Cards key={project.id} project={project} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
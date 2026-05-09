import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [loading, isAuthenticated, user, navigate]);

  return (
    <div className="bg-white overflow-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 flex items-center min-h-[90vh]">
        {/* Modern Ambient Background Blobs */}
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-100/60 blur-3xl opacity-60 mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-50/80 blur-3xl opacity-60 mix-blend-multiply"></div>
        </div>

        <div className="container mx-auto px-6 flex flex-col-reverse lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold tracking-wide uppercase mb-6 border border-indigo-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              The #1 Freelance Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Hire the best talent <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                for any job, online.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Outline project requirements, select reputable professionals, and thoroughly vet candidates' profiles to ensure a seamless collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/projects" 
                className="inline-flex justify-center items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5" 
              >
                Browse Projects
              </Link>
              
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex justify-center items-center px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-100 font-bold rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm" 
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex justify-center items-center px-8 py-4 bg-white text-gray-700 border-2 border-gray-100 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm" 
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
          
          <div className="lg:w-1/2 flex justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-transparent rounded-full blur-3xl opacity-50"></div>
            <img src="/hero.png" alt="Freelancing Illustration" className="w-full max-w-lg relative z-10 drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500" />
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">  
              About <span className="text-indigo-600">Us</span> 
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're on a mission to transform how businesses connect with top freelance talent worldwide.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Card 1 */}
            <div className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-100 hover:-translate-y-2">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300 shadow-inner">
                <svg className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Connect</h3>
              <p className="text-gray-600 leading-relaxed">
                We bridge the gap between businesses and skilled freelancers, creating meaningful professional relationships that drive success.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-100 hover:-translate-y-2">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300 shadow-inner">
                <svg className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Collaborate</h3>
              <p className="text-gray-600 leading-relaxed">
                Our platform enables seamless collaboration with tools designed to make remote work efficient, transparent, and productive.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-100 hover:-translate-y-2">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300 shadow-inner">
                <svg className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Create</h3>
              <p className="text-gray-600 leading-relaxed">
                We help bring ideas to life by matching projects with the perfect freelancers who have the exact skills needed.
              </p>
            </div>
          </div>

          {/* Mission Banner */}
          <div className="relative bg-indigo-600 rounded-3xl p-10 md:p-16 text-center overflow-hidden shadow-2xl shadow-indigo-600/20">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <h3 className="relative z-10 text-3xl md:text-4xl font-black text-white mb-6">Our Mission</h3>
            <p className="relative z-10 text-xl text-indigo-100 max-w-4xl mx-auto leading-relaxed">
              To empower businesses and freelancers by creating a trusted platform where talent meets opportunity, 
              fostering innovation, growth, and success in the digital economy.
            </p>
          </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF & STATS --- */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-10">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                Make it all happen with <br/>
                <span className="text-indigo-600">expert freelancers.</span>
              </h2>
              
              <div className="space-y-6">
                {[
                  "Access a pool of top talent across 20+ categories",
                  "Enjoy a simple, easy-to-use matching experience",
                  "Get quality work done quickly and within budget",
                  "Only pay when you're 100% happy with the result"
                ].map((text, i) => (
                  <div key={i} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      ✓
                    </div>
                    <p className="text-lg text-gray-700 font-medium">{text}</p>
                  </div>
                ))}
              </div>

              {!isAuthenticated && (
                <div className="pt-4">
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-8 py-4 bg-gray-900 text-white text-lg font-bold rounded-2xl hover:bg-gray-800 transition-all transform hover:-translate-y-1 shadow-xl hover:shadow-2xl">
                    Join the Platform Free    
                  </Link>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2.5rem] p-10 shadow-lg border border-white relative z-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div className="text-center bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                    <div className="text-4xl font-black text-indigo-600 mb-1">10+</div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Projects Done</div>
                  </div>
                  <div className="text-center bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                    <div className="text-4xl font-black text-indigo-600 mb-1">10+</div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Freelancers</div>
                  </div>
                  <div className="text-center bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                    <div className="text-4xl font-black text-indigo-600 mb-1">30+</div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Clients</div>
                  </div>
                  <div className="text-center bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                    <div className="text-4xl font-black text-indigo-600 mb-1">95%</div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Satisfaction</div>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-900/5 border border-indigo-50 relative">
                  <div className="absolute -top-5 left-8 text-5xl text-indigo-200">"</div>
                  <div className="flex items-center space-x-1 text-amber-400 mb-4 relative z-10">
                    ★ ★ ★ ★ ★
                  </div>
                  <p className="text-gray-700 text-lg font-medium leading-relaxed mb-6 relative z-10">
                    Found an amazing developer in just 24 hours. The quality of work exceeded our expectations entirely!
                  </p>
                  <div className="flex items-center space-x-4 border-t border-gray-100 pt-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      R
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Ravi Dubey</p>
                      <p className="text-sm text-indigo-600 font-medium">Startup Founder</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements behind the right card */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
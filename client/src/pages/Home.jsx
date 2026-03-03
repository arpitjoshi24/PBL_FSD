import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-r from-blue-50 to-indigo-100 flex items-center pt-16">
        <div className="container mx-auto px-6 py-16 flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Hire the best freelancers
              <span className="block text-indigo-600 mt-2">
                for any job, online.
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              For optimal online freelancing here, precisely outline project 
              requirements, select reputable platforms, and thoroughly vet 
              candidates' profiles, ensuring a seamless collaboration.
            </p>
            <Link
              to="/projects" 
              className="inline-block px-8 py-3.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg" >
              Find The Freelancer
            </Link>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <img src="/hero.png" alt="Freelancing Illustration" className="w-full max-w-md drop-shadow-xl" />
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">  About <span className="text-indigo-600">Us</span> </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to transform how businesses connect with top freelance talent worldwide </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Connect</h3>
              <p className="text-gray-600">
                We bridge the gap between businesses and skilled freelancers, creating meaningful professional relationships that drive success.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Collaborate</h3>
              <p className="text-gray-600">
                Our platform enables seamless collaboration with tools designed to make remote work efficient, transparent, and productive.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Create</h3>
              <p className="text-gray-600">
                We help bring ideas to life by matching projects with the perfect freelancers who have the exact skills needed.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">1+</div>
              <div className="text-sm text-gray-600">Years of Excellence</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">10+</div>
              <div className="text-sm text-gray-600">Projects Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">12+</div>
              <div className="text-sm text-gray-600">Expert Freelancers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">5+</div>
              <div className="text-sm text-gray-600">Countries Reached</div>
            </div>
          </div>
          <div className="mt-16 bg-indigo-50 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              To empower businesses and freelancers by creating a trusted platform where talent meets opportunity, 
              fostering innovation, growth, and success in the digital economy.
            </p>
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Make it all happen with{" "}
                <span className="text-indigo-600">freelancers</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                  </div>
                  <div>
                    <p className="text-xl text-gray-700">
                      <span className="font-semibold">Access a pool of top talent</span> across 20+ categories
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0"> 
                  </div>
                  <div>
                    <p className="text-xl text-gray-700">
                      Enjoy a <span className="font-semibold">simple, easy-to-use</span> matching experience
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">  
                  </div>
                  <div>
                    <p className="text-xl text-gray-700">
                      Get <span className="font-semibold">quality work done</span> quickly and within budget
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">  
                  </div>
                  <div>
                    <p className="text-xl text-gray-700">
                      <span className="font-semibold">Only pay</span> when you're happy
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Join now    
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-indigo-50 rounded-2xl p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">10+</div>
                    <div className="text-sm text-gray-600">Projects Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">10+</div>
                    <div className="text-sm text-gray-600">Happy Freelancers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">30+</div>
                    <div className="text-sm text-gray-600">Active Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">95%</div>
                    <div className="text-sm text-gray-600">Satisfaction Rate</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center space-x-2 text-yellow-400 mb-3">
                    <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                  </div>
                  <p className="text-gray-700 italic mb-4">
                    "Found an amazing developer in just 24 hours. The quality of work exceeded our expectations!"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-semibold text-gray-900">Ravi dubey</p>
                      <p className="text-sm text-gray-500">Startup Founder</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-200 rounded-full opacity-20"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-300 rounded-full opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
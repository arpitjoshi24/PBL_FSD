import React from "react";

export default function Landing() {
  return (
    <main className="text-white">
      {/* Hero Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="text-center md:text-left md:w-1/2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"> Empower Your Business with Top Freelance Talent</h1>
            <p className="text-base md:text-lg text-gray-300 mt-4"> Find the perfect freelancers for your projects and grow your business.</p>
            <a href="/register" className="inline-block mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition">Get Started</a>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img src="hero.png" alt="Freelancer illustration" className="w-full max-w-md md:max-w-lg"/>
          </div>
        </div>
      </section>
      {/* Why Us Section */}
      <section className="py-16 text-black bg-white">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-red-900">WHY US</h2>
         <h3 className="text-lg md:text-4xl font-sans font-semibold  mt-2">Boost Your Brand with</h3>
        <h3 className="text-lg md:text-4xl font-sans font-semibold  mt-2"> Top Freelancers </h3>
        <div className="flex flex-col md:flex-row justify-center gap-6 py-8 md:mx-20">
  <div className="relative group w-full md:w-1/3 max-w-sm h-96 overflow-hidden rounded-2xl shadow-lg cursor-pointer">
    <img src="whyUs1.png" alt="Collaboration" className="w-full h-full object-cover"/>
    <div className="absolute inset-0 bg-black/70 flex items-end transform translate-y-full group-hover:translate-y-0 transition-all duration-500">
      <div className="p-5 text-white">
        <h3 className="text-lg font-bold mb-1">Expert Collaboration</h3>
        <p className="text-sm text-gray-300"> Work with experienced freelancers who understand your business goals.</p>
      </div>
    </div>
  </div>
  <div className="relative group w-full md:w-1/3 max-w-sm h-96 overflow-hidden rounded-2xl shadow-lg cursor-pointer">
    <img src="whyUs2.png" alt="Team Work" className="w-full h-full object-cover"/>
    <div className="absolute inset-0 bg-black/70 flex items-end transform translate-y-full group-hover:translate-y-0 transition-all duration-500">
      <div className="p-5 text-white">
        <h3 className="text-lg font-bold mb-1">Verified Talent</h3>
        <p className="text-sm text-gray-300"> Hire trusted professionals across design, development, and marketing. </p>
      </div>
    </div>
  </div>
  <div className="relative group w-full md:w-1/3 max-w-sm h-96 overflow-hidden rounded-2xl shadow-lg cursor-pointer">
    <img src="whyUs3.png" alt="Productivity" className="w-full h-full object-cover"/>
    <div className="absolute inset-0 bg-black/70 flex items-end transform translate-y-full group-hover:translate-y-0 transition-all duration-500">
      <div className="p-5 text-white">
        <h3 className="text-lg font-bold mb-1">Fast Delivery</h3>
        <p className="text-sm text-gray-300"> Get quality work delivered on time with transparent communication. </p>
      </div>
    </div>
  </div>
</div>
        </div>
      </section>
     {/* How It Works */}
<section className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-6">
    <div className="text-center mb-14">
      <h2 className="text-4xl font-bold text-red-900">
        How It Works
      </h2>
      <p className="mt-4 text-black text-3xl max-w-2xl mx-auto">
      Find talent, get work done, and move faster.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">     
      <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg">
        <div className="text-5xl font-bold text-red-500 mb-4">01</div>
        <h3 className="text-xl font-semibold mb-3">Post a Job</h3>
        <p className="text-black"> Tell us what you need done. Describe your project and set your budget.</p>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition">
        <div className="text-5xl font-bold text-red-500 mb-4">02</div>
        <h3 className="text-xl font-semibold mb-3">Hire a Freelancer</h3>
        <p className="text-black"> Get proposals from skilled freelancers and choose the best fit. </p>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition">
        <div className="text-5xl font-bold text-red-500 mb-4">03</div>
        <h3 className="text-xl font-semibold mb-3">Get Work Done</h3>
        <p className="text-black"> Collaborate, track progress, and receive high-quality results on time. </p>
      </div>
    </div>
  </div>
</section>

    </main>
  );
}

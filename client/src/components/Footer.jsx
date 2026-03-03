import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Logo & Description */}
          <div>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              FreeLanceHub
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Connecting talented freelancers with amazing clients worldwide.
              Build projects, grow careers, and scale businesses effortlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/projects" label="Projects" />
              <FooterLink to="/login" label="Login" />
              <FooterLink to="/signup" label="Sign Up" />
            </ul>
          </div>

          {/* Contact / Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Contact
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Email: support@freelancehub.com
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              © {new Date().getFullYear()} FreeLanceHub. All rights reserved.
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}

/* Footer Link Component */
function FooterLink({ to, label }) {
  return (
    <li>
      <Link
        to={to}
        className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 text-sm"
      >
        {label}
      </Link>
    </li>
  );
}
import React, { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl tracking-wide">Freelancer</h1>
        <ul className="hidden md:flex gap-6 items-center">
          <li className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer ">
            <span className="text-lg font-bold">+</span> Post a Project</li>
          <li className="hover:text-gray-300 cursor-pointer ">Projects</li>
          <li className="hover:text-gray-300 cursor-pointer "> Profile</li>
        </ul>
        <button
          className="md:hidden text-2xl focus:outline-none" onClick={() => setOpen(!open)}> ☰ </button>
      </div>
      {open && (
        <ul className="md:hidden mt-4 flex flex-col gap-4 bg-zinc-900 p-4 rounded-lg">
          <li className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition">
            <span className="text-lg font-bold">+</span> Post a Project </li>
          <li className="hover:text-gray-300 cursor-pointer text-center"> Projects</li>
          <li className="hover:text-gray-300 cursor-pointer text-center"> Profile </li>
        </ul>
      )}
    </nav>
  );
}

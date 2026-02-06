import React from "react";

export default function Footer() {
  return (
    <footer className="relative w-full h-[200px] md:h-[250px]">
      <img src="footer.jpg" alt="Footer background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/70"></div>
      <div className="relative z-10 h-full flex flex-col justify-between px-6 md:px-20 py-12 text-white">
        <div>
          <h2 className="text-2xl md:text-4xl font-semibold leading-snug max-w-xl"> Looking For The Best <br /> Freelance Talent Solution</h2>
        </div>
      </div>
      <div className="text-center text-sm md:text-lg font-bold bg-black text-white py-4 ">© 2026. All rights reserved.</div>
    </footer>
  );
}

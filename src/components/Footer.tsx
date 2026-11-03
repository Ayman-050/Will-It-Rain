import React from "react";

const Footer = () => (
  <footer className="bg-gray-900 py-8 mt-16 border-t border-gray-800">
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-white tracking-wide mb-2">
          Baroonauts™
        </span>
        <span className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Baroonauts. All rights reserved.
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
import React from "react";
import { CopyrightIcon, Github, Linkedin, Twitter, Bot } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="relative bg-slate-950 border-t border-white/5 py-10 mt-auto overflow-hidden">
      {/* Glow Backdrop */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo and branding */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-indigo-400">
            <Bot size={20} />
          </div>
          <span className="text-sm font-bold tracking-wider text-gray-400">
            MOCKMATE AI
          </span>
        </div>

        {/* Copyright Section */}
        <div className="flex items-center text-xs text-gray-500">
          <CopyrightIcon className="mr-1.5 h-4 w-4" />
          <span>{new Date().getFullYear()} MockMate AI Studio. All rights reserved.</span>
        </div>

        {/* Social Media Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/architsrivastava123"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all duration-300 hover:scale-110"
            aria-label="GitHub"
          >
            <Github className="h-4.5 w-4.5" />
          </a>
          <a
            href="https://linkedin.com/in/architsrivastava12"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all duration-300 hover:scale-110"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-4.5 w-4.5" />
          </a>
          <a
            href="https://twitter.com/architsrivastava123"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all duration-300 hover:scale-110"
            aria-label="Twitter"
          >
            <Twitter className="h-4.5 w-4.5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

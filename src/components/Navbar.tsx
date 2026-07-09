import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ExternalLink, BarChart3, RefreshCw, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar = ({ onRefresh, isRefreshing = false }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isDashboard = location.pathname === "/dashboard";

  const navLinks = [
    { name: "Workflows Monitor", path: "/", active: isHome },
    { name: "Performance Insights", path: "/dashboard", active: isDashboard },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#d9d9dd] transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-[#17171c] group-hover:bg-[#ff7759] flex items-center justify-center text-white font-mono font-bold text-xs transition-colors duration-300 shadow-sm">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-extrabold text-sm tracking-tight text-black uppercase">
              COHERE <span className="text-[#93939f] font-mono font-normal text-[10px] ml-1 tracking-widest">// PIPELINE</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="relative py-2 text-xs font-mono font-bold uppercase tracking-wider text-[#75758a] hover:text-black transition-colors duration-200"
            >
              {link.name}
              {link.active && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff7759]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-[#75758a] hover:text-black transition-colors duration-200"
          >
            GitHub Source
            <ExternalLink className="h-3 w-3 text-[#93939f]" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-[#75758a] hover:text-black focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="md:hidden border-t border-[#d9d9dd] bg-white w-full py-4 px-6 absolute left-0 right-0 shadow-lg z-50 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`py-2 text-xs font-mono font-bold uppercase tracking-wider block border-b border-neutral-100 pb-2 ${
                    link.active ? "text-[#ff7759]" : "text-[#75758a] hover:text-black"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="py-2 text-xs font-mono font-bold uppercase tracking-wider text-[#75758a] hover:text-black block flex items-center gap-1.5"
              >
                GitHub Source
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

"use client";
import { SignInButton, UserButton, SignedOut, SignedIn } from "@clerk/nextjs";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bot, Sparkles } from "lucide-react";

function Header() {
  const path = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const controlNavbar = useCallback(() => {
    if (typeof window !== "undefined") {
      const currentScrollY = window.scrollY;

      // Check if user has scrolled down past 20px for design depth
      if (currentScrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    }
  }, [lastScrollY]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);
      return () => window.removeEventListener("scroll", controlNavbar);
    }
  }, [controlNavbar]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/about-us", label: "About Us" },
  ];

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 
          flex justify-between items-center 
          px-6 py-4 sm:px-12 sm:py-5 
          z-50 
          transition-all duration-500 ease-in-out
          ${isVisible ? "translate-y-0" : "-translate-y-full"}
          ${scrolled 
            ? "bg-slate-950/65 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3.5 sm:py-4" 
            : "bg-transparent border-b border-transparent"
          }
        `}
      >
        {/* Glow behind Header */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10 opacity-30 pointer-events-none blur-xl -z-10" />

        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group relative"
          aria-label="MockMate AI Home"
          onClick={closeMobileMenu}
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/35 transition-all duration-300 transform group-hover:scale-110">
            <Bot className="text-white group-hover:rotate-12 transition-transform duration-300" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              MOCKMATE AI
            </span>
            <span className="text-[10px] tracking-widest text-indigo-400/80 font-bold -mt-0.5">
              INTERVIEW STUDIO
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav 
          className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              path={path}
              href={item.href}
              label={item.label}
              onClick={closeMobileMenu}
            />
          ))}
        </nav>

        {/* Desktop Authentication */}
        <div className="hidden md:flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button 
                className="
                  relative overflow-hidden group
                  px-5 py-2.5 
                  bg-gradient-to-r from-indigo-500 to-purple-600
                  text-white text-sm font-bold
                  rounded-xl
                  shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35
                  hover:scale-105
                  transition-all duration-300
                  focus:outline-none 
                "
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="animate-pulse" />
                  Sign In
                </span>
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="p-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 border border-indigo-400/30",
                  },
                }} 
              />
            </div>
          </SignedIn>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <SignedIn>
            <div className="p-0.5 rounded-full border border-white/10 bg-white/5">
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8",
                  },
                }} 
              />
            </div>
          </SignedIn>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all focus:outline-none"
            aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="
            fixed inset-0 
            bg-slate-950/95 backdrop-blur-2xl 
            z-40 md:hidden 
            flex flex-col
            pt-24 px-6 pb-12
            animate-in fade-in slide-in-from-top-6 duration-300
          "
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          {/* Cyber lines decor */}
          <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none -z-10" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

          <nav className="flex-grow flex flex-col justify-center items-center gap-6">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                path={path}
                href={item.href}
                label={item.label}
                mobile
                onClick={closeMobileMenu}
              />
            ))}
          </nav>

          <div className="border-t border-white/10 pt-6 flex flex-col gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button 
                  className="
                    w-full py-4.5 text-center
                    bg-gradient-to-r from-indigo-500 to-purple-600
                    text-white text-base font-bold
                    rounded-2xl shadow-xl shadow-indigo-500/20
                  "
                  onClick={closeMobileMenu}
                >
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      )}
    </>
  );
}

function NavItem({ path, href, label, mobile, onClick }) {
  const isActive = path === href;
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`
        relative block 
        transition-all duration-300 ease-out 
        cursor-pointer 
        rounded-full 
        font-medium
        focus:outline-none 
        ${mobile
          ? "text-2xl font-bold tracking-wide py-2.5 text-center hover:scale-105"
          : "text-sm px-4.5 py-2"
        }
        ${isActive
          ? mobile 
            ? "text-indigo-400" 
            : "text-white bg-white/10 shadow-sm"
          : mobile 
            ? "text-gray-400 hover:text-white" 
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }
      `}
    >
      {label}
      {isActive && !mobile && (
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full blur-[1px] animate-pulse" />
      )}
    </Link>
  );
}

export default Header;
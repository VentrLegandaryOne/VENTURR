import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, FileCheck, Users, BarChart3, Upload, LogIn, ChevronRight, BookOpen } from "lucide-react";
import { TriangleLogo } from "@/components/branding/TriangleLogo";
import NotificationBell from "@/components/common/NotificationBell";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useCallback } from "react";

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close menu on escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setMobileMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Navigation with icons for mobile
  const publicNavLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/how-it-works", label: "How It Works", icon: FileCheck },
    { href: "/pricing", label: "Pricing", icon: BarChart3 },
  ];

  const authNavLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/contractors", label: "Contractors", icon: Users },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  ];

  const navLinks = isAuthenticated ? authNavLinks : publicNavLinks;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? "bg-background/95 backdrop-blur-xl shadow-lg border-b border-border/50"
            : "glass-strong"
        }`}
      >
        <div className="container">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <Link href={isAuthenticated ? "/dashboard" : "/"}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <TriangleLogo size={32} withHalo={true} animated={false} className="sm:w-10 sm:h-10" />
                <div className="flex flex-col">
                  <span className="venturr-wordmark text-base sm:text-lg leading-none text-foreground">VENTURR</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground leading-none tracking-widest">VALDT</span>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`text-sm font-medium transition-colors cursor-pointer relative py-2 ${
                      location === link.href
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    {location === link.href && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </motion.span>
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              {isAuthenticated ? (
                <>
                  <NotificationBell />
                  <Link href="/quote/upload">
                    <Button size="sm" className="shadow-md shadow-primary/20 gap-2">
                      <Upload className="w-4 h-4" />
                      Verify Quote
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                  </a>
                  <Link href="/quote/upload">
                    <Button size="sm" className="shadow-md shadow-primary/20">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button - larger touch target */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 -mr-2 text-foreground rounded-lg active:bg-muted/50 touch-manipulation"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-14 sm:top-16 right-0 bottom-0 z-50 w-full max-w-sm bg-background border-l border-border shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Navigation links */}
                <nav className="flex-1 p-4">
                  <div className="space-y-1">
                    {navLinks.map((link, index) => {
                      const Icon = link.icon;
                      const isActive = location === link.href;
                      return (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link href={link.href}>
                            <motion.div
                              whileTap={{ scale: 0.98 }}
                              className={`flex items-center gap-4 p-4 rounded-xl transition-colors touch-manipulation ${
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-muted active:bg-muted"
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                              <span className="flex-1 font-medium">{link.label}</span>
                              <ChevronRight className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                            </motion.div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </nav>

                {/* CTA buttons */}
                <div className="p-4 border-t border-border bg-muted/30">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                  >
                    {isAuthenticated ? (
                      <Link href="/quote/upload">
                        <Button size="lg" className="w-full gap-2 h-12 text-base">
                          <Upload className="w-5 h-5" />
                          Verify Quote
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Link href="/quote/upload">
                          <Button size="lg" className="w-full gap-2 h-12 text-base">
                            <Upload className="w-5 h-5" />
                            Get Started Free
                          </Button>
                        </Link>
                        <a href={getLoginUrl()} className="block">
                          <Button variant="outline" size="lg" className="w-full gap-2 h-12 text-base">
                            <LogIn className="w-5 h-5" />
                            Sign In
                          </Button>
                        </a>
                      </>
                    )}
                  </motion.div>

                  {/* App info */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 pt-4 border-t border-border"
                  >
                    <p className="text-xs text-muted-foreground text-center">
                      AI-powered quote verification for Australian construction
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-14 sm:h-16 md:h-20" />
    </>
  );
}

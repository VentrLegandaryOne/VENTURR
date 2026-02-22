import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  Camera, 
  FileText, 
  LayoutDashboard, 
  User,
  Plus
} from "lucide-react";
import { useState } from "react";

export default function MobileQuickActions() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [showFab, setShowFab] = useState(false);

  // Don't show on certain pages
  const hiddenPaths = ["/quote/upload", "/login", "/"];
  if (hiddenPaths.includes(location)) return null;

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
      active: location === "/dashboard"
    },
    {
      icon: FileText,
      label: "Reports",
      href: "/dashboard",
      active: location.includes("/report")
    },
    {
      icon: Camera,
      label: "Upload",
      href: "/quote/upload",
      active: location === "/quote/upload",
      primary: true
    },
    {
      icon: User,
      label: user ? "Account" : "Sign In",
      href: user ? "/dashboard" : "/login",
      active: false
    }
  ];

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item, index) => (
            <motion.button
              key={index}
              onClick={() => setLocation(item.href)}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center justify-center w-16 h-full ${
                item.primary 
                  ? "relative -mt-6" 
                  : ""
              }`}
            >
              {item.primary ? (
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <item.icon 
                    className={`w-6 h-6 ${
                      item.active ? "text-primary" : "text-muted-foreground"
                    }`} 
                  />
                  <span 
                    className={`text-xs mt-1 ${
                      item.active ? "text-primary font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </motion.button>
          ))}
        </div>
      </nav>

      {/* Floating Action Button - Alternative for quick upload */}
      <AnimatePresence>
        {!location.includes("/quote/upload") && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-4 z-50 md:bottom-8"
          >
            <motion.button
              onClick={() => setLocation("/quote/upload")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center group"
            >
              <Plus className="w-6 h-6 text-primary-foreground group-hover:rotate-90 transition-transform" />
            </motion.button>
            <span className="absolute -top-8 right-0 text-xs bg-card px-2 py-1 rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Upload Quote
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe area padding for content */}
      <div className="h-16 md:hidden" />
    </>
  );
}

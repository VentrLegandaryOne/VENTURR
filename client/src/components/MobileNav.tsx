import { Home, FolderKanban, FileText, Settings, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO, APP_TITLE } from "@/const";

interface MobileNavProps {
  variant?: "landing" | "dashboard";
}

export function MobileNav({ variant = "dashboard" }: MobileNavProps) {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: FolderKanban, label: "Projects", path: "/dashboard" },
    { icon: FileText, label: "Quotes", path: "/dashboard" },
    { icon: Settings, label: "Settings", path: "/dashboard" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="flex justify-around items-center px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center justify-center min-w-[60px] min-h-[56px] px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Top Header with Hamburger Menu */}
      <header className="md:hidden sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-lg">Venturr</span>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Slide-out Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <nav className="flex flex-col p-4 gap-2">
              <button
                onClick={() => {
                  setLocation("/dashboard");
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[48px]"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setLocation("/pricing");
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[48px]"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Pricing</span>
              </button>
              <button
                onClick={() => {
                  setLocation("/");
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[48px]"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}


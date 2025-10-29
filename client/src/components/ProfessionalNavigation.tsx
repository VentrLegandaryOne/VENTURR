import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  MapPin, 
  Calculator, 
  FileText, 
  Users, 
  Settings,
  Shield,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  description?: string;
}

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard',
    path: '/dashboard',
    color: 'primary',
    description: 'Overview & metrics'
  },
  {
    icon: <MapPin size={20} />,
    label: 'Site Measurement',
    path: '/site-measurement',
    color: 'success',
    description: 'Satellite measurements'
  },
  {
    icon: <Calculator size={20} />,
    label: 'Takeoff Calculator',
    path: '/calculator',
    color: 'secondary',
    description: 'Material calculations'
  },
  {
    icon: <FileText size={20} />,
    label: 'Quote Generator',
    path: '/quote-generator',
    color: 'warning',
    description: 'Professional quotes'
  },
  {
    icon: <Users size={20} />,
    label: 'Clients',
    path: '/clients',
    color: 'primary',
    description: 'Client management'
  },
  {
    icon: <Shield size={20} />,
    label: 'Compliance',
    path: '/compliance',
    color: 'error',
    description: 'Standards & documentation'
  },
  {
    icon: <Settings size={20} />,
    label: 'Settings',
    path: '/settings',
    color: 'primary',
    description: 'Configuration'
  }
];

const colorClasses = {
  primary: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300',
  secondary: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
  success: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300',
  warning: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300',
  error: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'
};

const colorHaloClasses = {
  primary: 'hover:shadow-[0_0_20px_rgba(30,64,175,0.3)]',
  secondary: 'hover:shadow-[0_0_20px_rgba(234,88,12,0.3)]',
  success: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  warning: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
  error: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
};

export default function ProfessionalNavigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg halo-layer-2">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Venturr</h1>
                <p className="text-xs text-slate-500">AI-Powered Operating System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700">
                Pro Plan
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="grid grid-cols-7 gap-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`
                    flex flex-col items-center gap-2 px-3 py-2 rounded-lg border-2 
                    transition-all duration-300 cursor-pointer
                    ${isActive(item.path)
                      ? `${colorClasses[item.color]} border-current shadow-md ${colorHaloClasses[item.color]}`
                      : 'text-slate-600 bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    }
                  `}
                  title={item.label}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">Venturr</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-slate-50">
            <div className="flex flex-col">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 border-l-4 transition-colors
                      ${isActive(item.path)
                        ? `${colorClasses[item.color]} border-current bg-opacity-50`
                        : 'text-slate-600 border-transparent hover:bg-slate-100'
                      }
                    `}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-slate-500">{item.description}</div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}


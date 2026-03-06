import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Zap, 
  ShoppingBag, 
  BookOpen, 
  Settings, 
  LogOut, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout, settings } = useApp();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Matérias-Primas', path: '/materials' },
    { icon: Zap, label: 'Custos Indiretos', path: '/costs' },
    { icon: ShoppingBag, label: 'Produtos', path: '/products' },
    { icon: BookOpen, label: 'Catálogo', path: '/catalog' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:transform-none flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className={cn(
          "flex flex-col items-center border-b border-gray-50 transition-all duration-300",
          isCollapsed ? "p-3" : "p-6"
        )}>
          <div className={cn(
            "rounded-full overflow-hidden bg-gray-50 flex items-center justify-center transition-all duration-300",
            isCollapsed ? "w-8 h-8 mb-2" : "w-16 h-16 mb-3"
          )}>
             {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className={cn("font-serif text-gray-300", isCollapsed ? "text-lg" : "text-2xl")}>
                {settings.brandName.charAt(0)}
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <>
              <h1 className="font-serif font-bold text-lg text-gray-900 leading-tight text-center transition-opacity duration-300">
                {settings.brandName}
              </h1>
              <p className="text-[10px] tracking-widest uppercase text-gray-500 mt-1 text-center transition-opacity duration-300">
                {settings.subtitle || 'SABOARIA E VELAS AROMÁTICAS'}
              </p>
            </>
          )}
          
          {/* Mobile Close Button */}
          <button onClick={onClose} className="absolute top-4 right-4 lg:hidden text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-[#FFF8F0] text-[#D97706]" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={18} strokeWidth={1.5} className="shrink-0" />
              
              {!isCollapsed && (
                <span className="whitespace-nowrap transition-opacity duration-300">
                  {item.label}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "px-4 py-3"
          )}>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0 transition-opacity duration-300">
                <p className="text-sm font-bold text-gray-900 truncate">Artisan</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-2 mt-2 text-xs font-medium text-red-600 hover:text-red-700 transition-colors w-full",
              isCollapsed ? "justify-center px-0 py-2" : "px-4 py-2"
            )}
            title={isCollapsed ? "Sair" : undefined}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}

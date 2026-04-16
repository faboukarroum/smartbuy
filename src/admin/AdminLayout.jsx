import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ExternalLink
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    const syncSidebarState = (event) => {
      setIsSidebarOpen(event.matches);
    };

    setIsSidebarOpen(mediaQuery.matches);
    mediaQuery.addEventListener('change', syncSidebarState);

    return () => {
      mediaQuery.removeEventListener('change', syncSidebarState);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
  ];

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleMobileNavClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
          onClick={handleSidebarToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-vintage-900 text-white transition-all duration-300 ${
          isSidebarOpen
            ? 'w-64 translate-x-0'
            : 'w-64 -translate-x-full md:w-20 md:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <Link to="/" className="text-xl font-serif font-bold text-white tracking-tighter flex items-center gap-2">
              Smart<span className="text-primary italic">Buy</span> Admin
            </Link>
          ) : (
            <div className="w-full flex justify-center">
              <span className="text-primary font-serif font-bold italic text-2xl">S</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleSidebarToggle}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
            aria-label="Close admin navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={handleMobileNavClick}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'text-vintage-400 hover:bg-white/10 hover:text-white'
                }
                ${!isSidebarOpen && 'justify-center'}
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSidebarToggle}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden"
              aria-label="Open admin navigation"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={handleSidebarToggle}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden md:block"
            >
              <Menu size={20} />
            </button>
            <div className="md:hidden">
               <Link to="/" className="text-xl font-serif font-bold text-vintage-900 tracking-tighter">
                Smart<span className="text-primary italic">Buy</span>
              </Link>
            </div>
            <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64 ml-4">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" target="_blank" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors">
              <ExternalLink size={18} />
              <span className="hidden sm:inline">View Shop</span>
            </Link>
            
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">Administrator</p>
              </div>
              <div className="h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-md">
                {user?.name?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

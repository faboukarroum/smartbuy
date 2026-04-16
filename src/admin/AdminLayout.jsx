import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  AlertCircle,
  CheckCircle2,
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
  ExternalLink,
  Truck
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getOrders, getProducts, getUsers } from '../api/products';

const formatRelativeDate = (value) => {
  if (!value) {
    return 'Just now';
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs)) {
    return 'Just now';
  }

  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [headerSearch, setHeaderSearch] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsState, setNotificationsState] = useState({
    loading: true,
    items: [],
  });
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const notificationRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  const searchBasePath = useMemo(() => {
    if (location.pathname.startsWith('/admin/orders')) {
      return '/admin/orders';
    }

    if (location.pathname.startsWith('/admin/users')) {
      return '/admin/users';
    }

    return '/admin/products';
  }, [location.pathname]);

  useEffect(() => {
    if (
      location.pathname.startsWith('/admin/products') ||
      location.pathname.startsWith('/admin/orders') ||
      location.pathname.startsWith('/admin/users')
    ) {
      setHeaderSearch(searchParams.get('q') || '');
      return;
    }

    setHeaderSearch('');
  }, [location.pathname, searchParams]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [ordersResult, productsResult, usersResult] = await Promise.allSettled([
          getOrders(),
          getProducts({ pageSize: 250 }),
          getUsers(),
        ]);

        const orders = ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value.data)
          ? ordersResult.value.data
          : [];
        const productsData = productsResult.status === 'fulfilled' ? productsResult.value.data : null;
        const products = productsData?.products || [];
        const usersData = usersResult.status === 'fulfilled' ? usersResult.value.data : [];
        const users = Array.isArray(usersData) ? usersData : usersData?.users || [];

        const pendingOrders = orders.filter((order) => !order.isPaid);
        const processingOrders = orders.filter((order) => order.isPaid && !order.isDelivered);
        const lowStockProducts = products.filter((product) => typeof product.stock === 'number' && product.stock > 0 && product.stock <= 5);
        const outOfStockProducts = products.filter((product) => product.stock === 0);

        const nextItems = [];

        if (pendingOrders.length > 0) {
          nextItems.push({
            id: 'pending-orders',
            icon: <AlertCircle size={16} className="text-amber-600" />,
            title: `${pendingOrders.length} payment${pendingOrders.length === 1 ? '' : 's'} pending`,
            description: 'Customer orders are waiting for payment confirmation.',
            time: pendingOrders[0]?.createdAt ? formatRelativeDate(pendingOrders[0].createdAt) : 'Needs attention',
            to: '/admin/orders',
            tone: 'bg-amber-50',
          });
        }

        if (processingOrders.length > 0) {
          nextItems.push({
            id: 'processing-orders',
            icon: <Truck size={16} className="text-blue-600" />,
            title: `${processingOrders.length} order${processingOrders.length === 1 ? '' : 's'} ready to fulfill`,
            description: 'Paid orders still need delivery updates.',
            time: processingOrders[0]?.paidAt ? formatRelativeDate(processingOrders[0].paidAt) : 'Needs attention',
            to: '/admin/orders',
            tone: 'bg-blue-50',
          });
        }

        if (outOfStockProducts.length > 0) {
          nextItems.push({
            id: 'out-of-stock',
            icon: <Package size={16} className="text-red-600" />,
            title: `${outOfStockProducts.length} product${outOfStockProducts.length === 1 ? '' : 's'} out of stock`,
            description: 'These items are no longer available for purchase.',
            time: 'Inventory update needed',
            to: '/admin/products',
            tone: 'bg-red-50',
          });
        }

        if (lowStockProducts.length > 0) {
          nextItems.push({
            id: 'low-stock',
            icon: <Package size={16} className="text-emerald-600" />,
            title: `${lowStockProducts.length} product${lowStockProducts.length === 1 ? '' : 's'} running low`,
            description: 'Restock soon to avoid stockouts.',
            time: 'Inventory update needed',
            to: '/admin/products',
            tone: 'bg-emerald-50',
          });
        }

        if (users.length > 0) {
          nextItems.push({
            id: 'user-count',
            icon: <Users size={16} className="text-primary" />,
            title: `${users.length} registered user${users.length === 1 ? '' : 's'}`,
            description: 'User records are loading correctly in the admin panel.',
            time: 'Latest sync',
            to: '/admin/users',
            tone: 'bg-primary/10',
          });
        }

        if (nextItems.length === 0) {
          nextItems.push({
            id: 'all-clear',
            icon: <CheckCircle2 size={16} className="text-emerald-600" />,
            title: 'No urgent admin alerts',
            description: 'Orders and inventory look stable right now.',
            time: 'All caught up',
            to: '/admin',
            tone: 'bg-emerald-50',
          });
        }

        setNotificationsState({
          loading: false,
          items: nextItems.slice(0, 5),
        });
      } catch (error) {
        setNotificationsState({
          loading: false,
          items: [
            {
              id: 'fallback',
              icon: <AlertCircle size={16} className="text-amber-600" />,
              title: 'Notifications unavailable',
              description: 'The admin alert feed could not be loaded just now.',
              time: 'Try again soon',
              to: '/admin',
              tone: 'bg-amber-50',
            },
          ],
        });
      }
    };

    fetchNotifications();
  }, [user]);

  const handleHeaderSearchSubmit = (event) => {
    event.preventDefault();

    const query = headerSearch.trim();

    if (query) {
      navigate(`${searchBasePath}?q=${encodeURIComponent(query)}`);
      return;
    }

    navigate(searchBasePath);
  };

  const unreadCount = notificationsState.items.filter((item) => item.id !== 'all-clear').length;

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
            <form onSubmit={handleHeaderSearchSubmit} className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64 ml-4">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder={searchBasePath === '/admin/orders' ? 'Search orders...' : searchBasePath === '/admin/users' ? 'Search users...' : 'Search products...'} 
                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none"
              />
            </form>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" target="_blank" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors">
              <ExternalLink size={18} />
              <span className="hidden sm:inline">View Shop</span>
            </Link>
            
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Open notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Notifications</p>
                      <p className="text-xs text-slate-500">Admin activity that needs attention</p>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto p-2">
                    {notificationsState.loading ? (
                      <div className="px-3 py-8 text-center text-sm text-slate-400">Loading notifications...</div>
                    ) : (
                      notificationsState.items.map((item) => (
                        <Link
                          key={item.id}
                          to={item.to}
                          onClick={() => setIsNotificationsOpen(false)}
                          className={`mb-2 block rounded-xl px-3 py-3 last:mb-0 hover:bg-slate-50 ${item.tone}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-lg bg-white/80 p-2">
                              {item.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                              <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                              <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">{item.time}</p>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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

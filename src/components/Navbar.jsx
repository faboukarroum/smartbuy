import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import usePreferencesStore from '../store/preferencesStore';
import { BRAND_LOGO, BRAND_NAME } from '../config/brand';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const cartItems = useCartStore((state) => state.items);
  const { user, logout } = useAuthStore();
  const { language, currency, toggleLanguage, toggleCurrency } = usePreferencesStore();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="vintage-glass sticky top-0 z-50 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center" aria-label={`${BRAND_NAME} home`}>
          <img src={BRAND_LOGO} alt={BRAND_NAME} className="h-12 w-auto max-w-[180px] object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-vintage-700'}`}>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-vintage-700'}`}>
            Shop
          </NavLink>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-vintage-700 hover:text-primary transition-colors" aria-label="Search products">
            <Search size={20} />
          </button>

          <button
            onClick={toggleCurrency}
            className="hidden sm:inline-flex rounded-full border border-vintage-200 bg-white px-3 py-1.5 text-xs font-bold text-vintage-700 hover:border-primary hover:text-primary"
            aria-label="Toggle currency"
          >
            {currency}
          </button>

          <button
            onClick={toggleLanguage}
            className="hidden sm:inline-flex rounded-full border border-vintage-200 bg-white px-3 py-1.5 text-xs font-bold text-vintage-700 hover:border-primary hover:text-primary"
            aria-label="Toggle language"
          >
            {language === 'en' ? 'AR' : 'EN'}
          </button>
          
          <Link to="/cart" className="p-2 text-vintage-700 hover:text-primary transition-colors relative">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link to={user.role === 'admin' ? '/admin' : '/profile'} className="p-2 text-vintage-700 hover:text-primary transition-colors">
                <User size={20} />
              </Link>
              <button onClick={logout} className="text-xs font-medium text-vintage-500 hover:text-primary">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="p-2 text-vintage-700 hover:text-primary transition-colors" aria-label="Account">
              <User size={20} />
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-vintage-700" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-4 border-t border-vintage-100 pt-4">
          <NavLink to="/" className="block text-lg font-medium text-vintage-700" onClick={() => setIsOpen(false)}>Home</NavLink>
          <NavLink to="/products" className="block text-lg font-medium text-vintage-700" onClick={() => setIsOpen(false)}>Shop</NavLink>
          <button onClick={toggleCurrency} className="block text-lg font-medium text-vintage-700">{currency}</button>
          <button onClick={toggleLanguage} className="block text-lg font-medium text-vintage-700">{language === 'en' ? 'Arabic' : 'English'}</button>
          <Link to="/login" className="block text-lg font-medium text-vintage-700" onClick={() => setIsOpen(false)}>Login</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

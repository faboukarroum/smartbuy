import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Truck } from 'lucide-react';
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

  const labels = {
    promo: language === 'ar' ? 'توصيل أرامكس لكل لبنان | دفع عند الاستلام' : 'Aramex delivery across Lebanon | Cash on delivery',
    home: language === 'ar' ? 'الرئيسية' : 'Home',
    shop: language === 'ar' ? 'تسوق' : 'Shop',
    login: language === 'ar' ? 'تسجيل الدخول' : 'Login',
    language: language === 'en' ? 'AR' : 'EN',
  };

  return (
    <nav className="vintage-glass sticky top-0 z-50">
      <div className="brand-dark-section px-4 py-2 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center text-xs font-bold uppercase tracking-wide sm:text-sm">
          <Truck size={16} className="text-secondary" />
          <span>{labels.promo}</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center" aria-label={`${BRAND_NAME} home`}>
          <img src={BRAND_LOGO} alt={BRAND_NAME} className="h-11 w-auto max-w-[170px] object-contain sm:h-14 sm:max-w-[210px]" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={({ isActive }) => `text-sm font-extrabold transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-vintage-900'}`}>
            {labels.home}
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `text-sm font-extrabold transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-vintage-900'}`}>
            {labels.shop}
          </NavLink>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="p-2 text-vintage-900 hover:text-primary transition-colors" aria-label="Search products">
            <Search size={20} />
          </button>

          <button
            onClick={toggleCurrency}
            className="hidden sm:inline-flex rounded-full border border-vintage-200 bg-white px-3 py-1.5 text-xs font-extrabold text-vintage-900 shadow-sm hover:border-primary hover:text-primary"
            aria-label="Toggle currency"
          >
            {currency}
          </button>

          <button
            onClick={toggleLanguage}
            className="hidden sm:inline-flex rounded-full border border-vintage-200 bg-white px-3 py-1.5 text-xs font-extrabold text-vintage-900 shadow-sm hover:border-primary hover:text-primary"
            aria-label="Toggle language"
          >
            {labels.language}
          </button>
          
          <Link to="/cart" className="p-2 text-vintage-900 hover:text-primary transition-colors relative">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link to={user.role === 'admin' ? '/admin' : '/profile'} className="p-2 text-vintage-900 hover:text-primary transition-colors">
                <User size={20} />
              </Link>
              <button onClick={logout} className="text-xs font-bold text-vintage-700 hover:text-primary">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="p-2 text-vintage-900 hover:text-primary transition-colors" aria-label="Account">
              <User size={20} />
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-vintage-900" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden space-y-4 border-t border-vintage-100 bg-white px-4 py-5 shadow-lg">
          <NavLink to="/" className="block text-lg font-extrabold text-vintage-900" onClick={() => setIsOpen(false)}>{labels.home}</NavLink>
          <NavLink to="/products" className="block text-lg font-extrabold text-vintage-900" onClick={() => setIsOpen(false)}>{labels.shop}</NavLink>
          <button onClick={toggleCurrency} className="block text-lg font-extrabold text-vintage-900">{currency}</button>
          <button onClick={toggleLanguage} className="block text-lg font-extrabold text-vintage-900">{language === 'en' ? 'Arabic' : 'English'}</button>
          <Link to="/login" className="block text-lg font-extrabold text-vintage-900" onClick={() => setIsOpen(false)}>{labels.login}</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

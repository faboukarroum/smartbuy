import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Truck } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import usePreferencesStore from '../store/preferencesStore';
import { BRAND_LOGO, BRAND_NAME } from '../config/brand';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
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
    menu: isOpen ? 'Close menu' : 'Open menu',
    cart: cartCount > 0 ? `Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}` : 'Cart',
    currencySetting: language === 'ar' ? 'العملة' : 'Currency',
    currencyHelp: language === 'ar'
      ? (currency === 'USD' ? 'الأسعار بالدولار' : 'الأسعار بالليرة اللبنانية')
      : (currency === 'USD' ? 'Prices in dollars' : 'Prices in Lebanese pounds'),
    languageSetting: language === 'ar' ? 'اللغة' : 'Language',
    languageHelp: language === 'ar' ? 'العربية' : 'English',
    switchTo: language === 'ar' ? 'بدّل إلى' : 'Switch to',
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
        <Link to="/" className="flex items-center" aria-label={`${BRAND_NAME} home`}>
          <img src={BRAND_LOGO} alt={BRAND_NAME} className="h-11 w-auto max-w-[170px] object-contain sm:h-14 sm:max-w-[210px]" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={({ isActive }) => `text-sm font-extrabold transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-vintage-900'}`}>
            {labels.home}
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `text-sm font-extrabold transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-vintage-900'}`}>
            {labels.shop}
          </NavLink>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/products')}
            className="flex h-11 w-11 items-center justify-center text-vintage-900 transition-colors hover:text-primary"
            aria-label="Search products"
          >
            <Search size={20} />
          </button>

          <button
            onClick={toggleCurrency}
            className="hidden rounded-full border border-vintage-200 bg-white px-3 py-1.5 text-xs font-extrabold text-vintage-900 shadow-sm hover:border-primary hover:text-primary sm:inline-flex"
            aria-label="Toggle currency"
          >
            {currency}
          </button>

          <button
            onClick={toggleLanguage}
            className="hidden rounded-full border border-vintage-200 bg-white px-3 py-1.5 text-xs font-extrabold text-vintage-900 shadow-sm hover:border-primary hover:text-primary sm:inline-flex"
            aria-label="Toggle language"
          >
            {labels.language}
          </button>

          <Link to="/cart" className="relative flex h-11 w-11 items-center justify-center text-vintage-900 transition-colors hover:text-primary" aria-label={labels.cart}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link to={user.role === 'admin' ? '/admin' : '/profile'} className="flex h-11 w-11 items-center justify-center text-vintage-900 transition-colors hover:text-primary" aria-label="Account">
                <User size={20} />
              </Link>
              <button onClick={logout} className="text-xs font-bold text-vintage-700 hover:text-primary">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex h-11 w-11 items-center justify-center text-vintage-900 transition-colors hover:text-primary" aria-label="Account">
              <User size={20} />
            </Link>
          )}

          <button
            className="flex h-11 w-11 items-center justify-center text-vintage-900 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            aria-label={labels.menu}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-x-0 top-[116px] z-40 md:hidden">
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-[116px] -z-10 bg-vintage-900/35 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          />
          <div id="mobile-menu" className="mx-3 max-h-[calc(100vh-132px)] overflow-y-auto rounded-b-3xl border border-t-0 border-vintage-200 bg-white px-4 py-5 shadow-2xl shadow-vintage-900/20">
            <div className="space-y-2">
              <NavLink
                to="/"
                className="flex min-h-14 items-center rounded-2xl px-4 text-lg font-extrabold text-vintage-900 transition-colors hover:bg-vintage-50"
                onClick={() => setIsOpen(false)}
              >
                {labels.home}
              </NavLink>
              <NavLink
                to="/products"
                className="flex min-h-14 items-center rounded-2xl px-4 text-lg font-extrabold text-vintage-900 transition-colors hover:bg-vintage-50"
                onClick={() => setIsOpen(false)}
              >
                {labels.shop}
              </NavLink>
            </div>
            <div className="my-4 h-px bg-vintage-100" />
            <div className="grid gap-3">
              <button
                onClick={toggleCurrency}
                className="flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border border-vintage-200 bg-vintage-50 px-4 py-3 text-left transition-colors hover:border-primary rtl:text-right"
                aria-label={`Toggle currency, current currency ${currency}`}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-black text-vintage-900">{labels.currencySetting}</span>
                  <span className="block text-xs font-bold text-vintage-600">{labels.currencyHelp}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="rounded-full bg-vintage-900 px-3 py-1 text-xs font-black text-white">{currency}</span>
                  <span className="text-xs font-black text-primary">{labels.switchTo} {currency === 'USD' ? 'LBP' : 'USD'}</span>
                </span>
              </button>
              <button
                onClick={toggleLanguage}
                className="flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border border-vintage-200 bg-vintage-50 px-4 py-3 text-left transition-colors hover:border-primary rtl:text-right"
                aria-label={`Toggle language, current language ${language === 'en' ? 'English' : 'Arabic'}`}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-black text-vintage-900">{labels.languageSetting}</span>
                  <span className="block text-xs font-bold text-vintage-600">{labels.languageHelp}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="rounded-full bg-vintage-900 px-3 py-1 text-xs font-black text-white">{language === 'en' ? 'EN' : 'AR'}</span>
                  <span className="text-xs font-black text-primary">{labels.switchTo} {language === 'en' ? 'AR' : 'EN'}</span>
                </span>
              </button>
            </div>
            <div className="my-4 h-px bg-vintage-100" />
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/profile'}
                className="flex min-h-14 items-center rounded-2xl px-4 text-lg font-extrabold text-vintage-900 transition-colors hover:bg-vintage-50"
                onClick={() => setIsOpen(false)}
              >
                Account
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex min-h-14 items-center rounded-2xl px-4 text-lg font-extrabold text-vintage-900 transition-colors hover:bg-vintage-50"
                onClick={() => setIsOpen(false)}
              >
                {labels.login}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

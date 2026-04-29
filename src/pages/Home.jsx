import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, Loader2, PackageCheck, Shuffle, Truck, Wallet } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../api/products';
import { BRAND_LOGO, BRAND_NAME, BRAND_TAGLINE, SOCIAL_LINKS, SUPPORT_POINTS } from '../config/brand';
import usePreferencesStore from '../store/preferencesStore';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState('');
  const language = usePreferencesStore((state) => state.language);
  const support = SUPPORT_POINTS[language];

  const t = {
    eyebrow: language === 'ar' ? 'أوتلت لبناني' : 'Lebanon Outlet',
    headline: language === 'ar' ? 'كل يوم في شي جديد تلاقيه.' : 'Fresh finds, limited stock, easy prices.',
    intro: language === 'ar'
      ? 'أغراض جديدة للبيت، الهدايا، الألعاب، الأدوات، والديكور. الكمية محدودة والطلب سهل عبر الموقع أو واتساب.'
      : 'New tools, toys, home goods, decor, makeup, and useful everyday finds. Limited quantities, checkout or WhatsApp ordering.',
    shop: language === 'ar' ? 'تسوق المنتجات' : 'Shop Products',
    whatsapp: language === 'ar' ? 'اطلب عبر واتساب' : 'Order on WhatsApp',
    newArrivals: language === 'ar' ? 'وصل حديثاً' : 'New Arrivals',
    randomFinds: language === 'ar' ? 'لقطات عشوائية' : 'Random Finds',
    viewAll: language === 'ar' ? 'شوف كل المنتجات' : 'View All Products',
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoadingFeatured(true);
        const { data } = await getProducts({ pageSize: 100, sortBy: 'newest' });
        const products = Array.isArray(data?.products) ? data.products : [];

        setFeaturedProducts(products.filter((product) => product.isNew).slice(0, 4));
        setRandomProducts(products.filter((product) => !product.isNew).slice(0, 4));
        setFeaturedError('');
      } catch (error) {
        console.error('Error fetching featured home products:', error);
        setFeaturedError(language === 'ar' ? 'ما قدرنا نحمّل المنتجات حالياً.' : 'Unable to load new arrivals right now.');
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchFeaturedProducts();
  }, [language]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <header className="relative overflow-hidden bg-white border-b border-vintage-200">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&q=80&w=2000"
            alt="Outlet shelves with everyday products"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/70" />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 py-16 lg:py-20">
          <div className="max-w-3xl">
            <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">
              {t.eyebrow}
            </h3>
            <img src={BRAND_LOGO} alt={BRAND_NAME} className="mb-6 w-full max-w-xl rounded-lg object-contain" />
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-vintage-900 leading-tight mb-5">
              {BRAND_TAGLINE[language]}
            </h1>
            <p className="text-2xl md:text-3xl font-serif font-bold text-vintage-900 mb-4">
              {t.headline}
            </p>
            <p className="text-lg text-vintage-700 mb-8 max-w-2xl leading-relaxed">
              {t.intro}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="vintage-button !px-8 !py-4 text-lg font-medium flex items-center group">
                {t.shop}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="https://wa.me/96181859091" className="px-8 py-4 text-vintage-900 font-medium hover:text-primary transition-colors">
                {t.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="py-14 bg-white border-y border-vintage-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-vintage-100 rounded-full flex items-center justify-center text-primary mb-4">
                <Truck size={26} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">{language === 'ar' ? 'توصيل لكل لبنان' : 'Lebanon-wide Delivery'}</h3>
              <p className="text-vintage-600">{support.delivery}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-vintage-100 rounded-full flex items-center justify-center text-primary mb-4">
                <Wallet size={26} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">{language === 'ar' ? 'دفع عند الاستلام' : 'Cash on Delivery'}</h3>
              <p className="text-vintage-600">{support.payment}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-vintage-100 rounded-full flex items-center justify-center text-primary mb-4">
                <PackageCheck size={26} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">{language === 'ar' ? 'كمية محدودة' : 'Limited Stock'}</h3>
              <p className="text-vintage-600">{language === 'ar' ? 'إذا عجبك شي، لا تطول. القطع بتخلص بسرعة.' : 'If you like it, grab it. Outlet quantities move fast.'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-vintage-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10">
            <div>
              <h2 className="text-4xl font-serif font-bold text-vintage-900 mb-2">{t.newArrivals}</h2>
              <p className="text-vintage-600">{language === 'ar' ? 'منتجات جديدة مضافة على الأوتلت.' : 'Fresh products added to the outlet.'}</p>
            </div>
            <Link to="/products" className="text-primary font-bold border-b-2 border-primary hover:text-primary/80 transition-colors self-start sm:self-auto">
              {t.viewAll}
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="py-20 flex flex-col items-center justify-center text-vintage-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-medium">{language === 'ar' ? 'عم نحمّل المنتجات...' : 'Loading new arrivals...'}</p>
            </div>
          ) : featuredError ? (
            <div className="py-16 flex flex-col items-center justify-center text-red-500 bg-red-50 rounded-2xl border border-red-100 p-8">
              <AlertCircle className="mb-4" size={40} />
              <p className="font-medium">{featuredError}</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-vintage-200">
              <h3 className="text-2xl font-serif font-bold text-vintage-900 mb-2">{language === 'ar' ? 'ما في منتجات جديدة بعد' : 'No New Arrivals Yet'}</h3>
              <p className="text-vintage-600">{language === 'ar' ? 'علّم المنتجات كجديدة من لوحة التحكم لتظهر هون.' : 'Mark products as new in the admin panel and they will appear here.'}</p>
            </div>
          )}
        </div>
      </section>

      {randomProducts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center gap-3 mb-10">
              <Shuffle className="text-primary" size={28} />
              <div>
                <h2 className="text-3xl font-serif font-bold text-vintage-900">{t.randomFinds}</h2>
                <p className="text-vintage-600">{language === 'ar' ? 'اختيارات متنوعة من كل شي.' : 'A rotating mix from every corner of the shop.'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {randomProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="bg-vintage-900 text-white py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <img src={BRAND_LOGO} alt={BRAND_NAME} className="mb-6 h-20 w-auto max-w-xs rounded-lg object-contain" />
              <p className="text-vintage-400 max-w-md leading-relaxed">
                {language === 'ar'
                  ? 'أوتلت لبناني لأغراض جديدة، أسعار خفيفة، وكميات محدودة.'
                  : 'A Lebanese outlet for new everyday finds, light prices, and limited quantities.'}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Shop</h4>
              <ul className="space-y-4 text-vintage-400">
                <li><Link to="/products" className="hover:text-primary">All Items</Link></li>
                <li><Link to="/products?category=home" className="hover:text-primary">Home</Link></li>
                <li><Link to="/products?category=decor" className="hover:text-primary">Decor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-vintage-400">
                <li><span>{support.delivery}</span></li>
                <li><span>{support.returns}</span></li>
                <li><span>{support.card}</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-vintage-800 mt-16 pt-8 flex flex-col md:flex-row justify-between text-vintage-500 text-sm">
            <p>© 2026 {BRAND_NAME}. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href={SOCIAL_LINKS.instagram} className="hover:text-white transition-colors">Instagram</a>
              <a href={SOCIAL_LINKS.tiktok} className="hover:text-white transition-colors">TikTok</a>
              <a href={SOCIAL_LINKS.facebook} className="hover:text-white transition-colors">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

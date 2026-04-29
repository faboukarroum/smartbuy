import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, Loader2, PackageCheck, Shuffle, Truck, Wallet } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../api/products';
import { BRAND_NAME, BRAND_TAGLINE, SOCIAL_LINKS, SUPPORT_POINTS } from '../config/brand';
import usePreferencesStore from '../store/preferencesStore';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState('');
  const language = usePreferencesStore((state) => state.language);
  const support = SUPPORT_POINTS[language];

  const t = {
    eyebrow: language === 'ar' ? 'أوتلت الحي' : 'Neighborhood Outlet',
    headline: language === 'ar' ? 'لقطات جديدة، كميات محدودة، وأسعار خفيفة.' : 'Fresh finds, limited stock, easy prices.',
    intro: language === 'ar'
      ? 'منتجات جديدة للبيت، الألعاب، الأدوات، الديكور، وأكثر. اطلب من الموقع أو واتساب والدفع عند الاستلام.'
      : 'New home goods, toys, tools, decor, and useful everyday finds. Order online or on WhatsApp with cash on delivery.',
    shop: language === 'ar' ? 'تسوق المنتجات' : 'Shop Products',
    whatsapp: language === 'ar' ? 'اطلب عبر واتساب' : 'Order on WhatsApp',
    newArrivals: language === 'ar' ? 'وصل حديثاً' : 'New Drops',
    randomFinds: language === 'ar' ? 'لقطات عشوائية' : 'Random Picks',
    viewAll: language === 'ar' ? 'شوف كل المنتجات' : 'View All Products',
    empty: language === 'ar' ? 'ما في منتجات جديدة بعد' : 'No New Arrivals Yet',
    emptyCopy: language === 'ar' ? 'علّم المنتجات كجديدة من لوحة التحكم لتظهر هون.' : 'Mark products as new in the admin panel and they will appear here.',
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
    <div className="min-h-screen bg-vintage-50">
      <Navbar />

      <header className="brand-dark-section relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&q=80&w=2000"
            alt="Outlet shelves with everyday products"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-secondary ring-1 ring-white/15">
              {t.eyebrow}
            </p>
            <h1 className="mb-5 max-w-3xl text-5xl font-black leading-tight md:text-7xl">
              {BRAND_TAGLINE[language]}
            </h1>
            <p className="mb-4 text-2xl font-extrabold text-white/90 md:text-3xl">
              {t.headline}
            </p>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/75">
              {t.intro}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="vintage-button !px-8 !py-4 text-lg font-extrabold flex items-center group">
                {t.shop}
                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1 rtl:ml-0 rtl:mr-2 rtl:rotate-180" />
              </Link>
              <a href="https://wa.me/96181859091" className="rounded-full border border-white/20 bg-white/10 px-8 py-4 text-lg font-extrabold text-white transition-colors hover:bg-white/20">
                {t.whatsapp}
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 text-vintage-900 shadow-2xl shadow-black/20">
              <p className="text-sm font-extrabold uppercase text-primary">{language === 'ar' ? 'دفع' : 'Payment'}</p>
              <p className="mt-2 text-3xl font-black">{support.payment}</p>
            </div>
            <div className="rounded-3xl bg-white/12 p-6 text-white ring-1 ring-white/20">
              <p className="text-sm font-extrabold uppercase text-secondary">{language === 'ar' ? 'توصيل' : 'Delivery'}</p>
              <p className="mt-2 text-3xl font-black">{support.delivery}</p>
            </div>
            <div className="rounded-3xl bg-white/12 p-6 text-white ring-1 ring-white/20 sm:col-span-2">
              <p className="text-sm font-extrabold uppercase text-secondary">{language === 'ar' ? 'الأهم' : 'Heads up'}</p>
              <p className="mt-2 text-3xl font-black">{language === 'ar' ? 'الكميات محدودة وبتخلص بسرعة' : 'Limited quantities move fast'}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 md:grid-cols-3 md:px-8">
          {[
            [Truck, language === 'ar' ? 'توصيل لكل لبنان' : 'Lebanon-wide Delivery', support.delivery],
            [Wallet, language === 'ar' ? 'دفع عند الاستلام' : 'Cash on Delivery', support.payment],
            [PackageCheck, language === 'ar' ? 'كمية محدودة' : 'Limited Stock', language === 'ar' ? 'إذا عجبك شي، لا تطول.' : 'If you like it, grab it.'],
          ].map(([Icon, title, copy]) => (
            <div key={title} className="flex items-center gap-4 rounded-2xl border border-vintage-200 bg-vintage-50 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                {React.createElement(Icon, { size: 24 })}
              </div>
              <div>
                <h3 className="text-base font-black">{title}</h3>
                <p className="text-sm font-medium text-vintage-700">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-vintage-50">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-extrabold uppercase text-primary">{BRAND_NAME}</p>
              <h2 className="text-4xl font-black text-vintage-900">{t.newArrivals}</h2>
              <p className="mt-2 text-vintage-700">{language === 'ar' ? 'منتجات جديدة مضافة على الأوتلت.' : 'Fresh products added to the outlet.'}</p>
            </div>
            <Link to="/products" className="self-start rounded-full border border-vintage-200 bg-white px-5 py-3 font-extrabold text-vintage-900 shadow-sm hover:border-primary hover:text-primary sm:self-auto">
              {t.viewAll}
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="flex flex-col items-center justify-center py-20 text-vintage-400">
              <Loader2 className="mb-4 animate-spin" size={40} />
              <p className="font-bold">{language === 'ar' ? 'عم نحمّل المنتجات...' : 'Loading new arrivals...'}</p>
            </div>
          ) : featuredError ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-8 py-16 text-red-500">
              <AlertCircle className="mb-4" size={40} />
              <p className="font-bold">{featuredError}</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-vintage-200 bg-white py-16 text-center">
              <h3 className="mb-2 text-2xl font-black text-vintage-900">{t.empty}</h3>
              <p className="text-vintage-700">{t.emptyCopy}</p>
            </div>
          )}
        </div>
      </section>

      {randomProducts.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-vintage-100 text-primary">
                <Shuffle size={26} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-vintage-900">{t.randomFinds}</h2>
                <p className="text-vintage-700">{language === 'ar' ? 'اختيارات متنوعة من كل شي.' : 'A rotating mix from every corner of the shop.'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {randomProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="brand-dark-section py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <h2 className="mb-4 text-3xl font-black">{BRAND_NAME}</h2>
              <p className="max-w-md leading-relaxed text-white/70">
                {language === 'ar'
                  ? 'أوتلت لبناني لأغراض جديدة، أسعار خفيفة، وكميات محدودة.'
                  : 'A Lebanese outlet for new everyday finds, light prices, and limited quantities.'}
              </p>
            </div>
            <div>
              <h4 className="mb-6 font-black">Shop</h4>
              <ul className="space-y-4 text-white/65">
                <li><Link to="/products" className="hover:text-secondary">All Items</Link></li>
                <li><Link to="/products?category=home" className="hover:text-secondary">Home</Link></li>
                <li><Link to="/products?category=decor" className="hover:text-secondary">Decor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-6 font-black">Support</h4>
              <ul className="space-y-4 text-white/65">
                <li><span>{support.delivery}</span></li>
                <li><span>{support.returns}</span></li>
                <li><span>{support.card}</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 flex flex-col justify-between border-t border-white/10 pt-8 text-sm text-white/55 md:flex-row">
            <p>© 2026 {BRAND_NAME}. All rights reserved.</p>
            <div className="mt-4 flex gap-6 md:mt-0">
              <a href={SOCIAL_LINKS.instagram} className="hover:text-secondary">Instagram</a>
              <a href={SOCIAL_LINKS.tiktok} className="hover:text-secondary">TikTok</a>
              <a href={SOCIAL_LINKS.facebook} className="hover:text-secondary">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

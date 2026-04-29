import React, { useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Filter, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../api/products';
import usePreferencesStore from '../store/preferencesStore';

const categories = ['All', 'tools', 'kitchen', 'decor', 'bedding', 'furniture', 'electronics', 'home'];
const pageSizes = [20, 50, 100];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const language = usePreferencesStore((state) => state.language);

  const t = {
    title: language === 'ar' ? 'كل المنتجات' : 'All Products',
    intro: language === 'ar'
      ? 'تسوق منتجات جديدة بأسعار أوتلت. الكميات محدودة والطلب متاح عبر الموقع أو واتساب.'
      : 'Shop new outlet finds at easy prices. Quantities are limited, and you can order online or through WhatsApp.',
    search: language === 'ar' ? 'فتش على منتج...' : 'Search items...',
    newest: language === 'ar' ? 'الأحدث أولاً' : 'Newest First',
    lowHigh: language === 'ar' ? 'السعر: من الأرخص' : 'Price: Low to High',
    highLow: language === 'ar' ? 'السعر: من الأغلى' : 'Price: High to Low',
    loading: language === 'ar' ? 'عم نحمّل المنتجات...' : 'Loading products...',
    error: language === 'ar' ? 'صار في مشكلة' : 'Something went wrong',
    retry: language === 'ar' ? 'جرّب مرة تانية' : 'Try Again',
    none: language === 'ar' ? 'ما لقينا منتجات' : 'No items found',
    noneCopy: language === 'ar' ? 'جرّب غيّر الفلاتر أو كلمة البحث.' : 'Try adjusting your filters or search terms.',
    clear: language === 'ar' ? 'امسح الفلاتر' : 'Clear all filters',
    perPage: language === 'ar' ? 'منتجات بالصفحة:' : 'Items per page:',
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await getProducts({
          keyword: searchQuery,
          category: selectedCategory,
          pageNumber: currentPage,
          pageSize: itemsPerPage,
          sortBy,
        });
        setProducts(data.products);
        setTotalPages(data.pages);
        setTotalItems(data.count);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-vintage-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <header className="mb-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-vintage-200 md:p-8">
          <p className="mb-2 text-sm font-extrabold uppercase text-primary">{language === 'ar' ? 'أوتلت لبنان' : 'Lebanon Outlet'}</p>
          <h1 className="mb-3 text-4xl font-black text-vintage-900 md:text-5xl">{t.title}</h1>
          <p className="max-w-2xl text-vintage-700">{t.intro}</p>
        </header>

        <div className="mb-10 space-y-5">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-black capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-vintage-900 text-white shadow-lg'
                    : 'border border-vintage-200 bg-white text-vintage-900 hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-4 rounded-3xl border border-vintage-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto_auto] md:items-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vintage-500 rtl:left-auto rtl:right-4" size={18} />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-vintage-200 bg-vintage-50 py-3 pl-12 pr-4 font-bold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 rtl:pl-4 rtl:pr-12"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none rounded-full border border-vintage-200 bg-vintage-50 py-3 pl-4 pr-11 text-sm font-black text-vintage-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 md:w-56 rtl:pl-11 rtl:pr-4"
              >
                <option value="newest">{t.newest}</option>
                <option value="price-low">{t.lowHigh}</option>
                <option value="price-high">{t.highLow}</option>
              </select>
              <SlidersHorizontal className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-vintage-500 rtl:left-4 rtl:right-auto" size={16} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-vintage-700">{t.perPage}</span>
              {pageSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setItemsPerPage(size)}
                  className={`rounded-full px-3 py-1.5 text-xs font-black transition-all ${
                    itemsPerPage === size
                      ? 'bg-primary text-white'
                      : 'border border-vintage-200 bg-white text-vintage-700 hover:border-primary hover:text-primary'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm font-bold text-vintage-700">
            {language === 'ar' ? 'عم نعرض' : 'Showing'} <span className="text-vintage-900">{indexOfFirstItem + 1}</span> {language === 'ar' ? 'إلى' : 'to'} <span className="text-vintage-900">{Math.min(indexOfLastItem, totalItems)}</span> {language === 'ar' ? 'من' : 'of'} <span className="text-vintage-900">{totalItems}</span> {language === 'ar' ? 'منتج' : 'items'}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-vintage-400">
            <Loader2 className="mb-4 animate-spin" size={48} />
            <p className="text-lg font-bold">{t.loading}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50 p-8 py-24 text-red-500">
            <AlertCircle className="mb-4" size={48} />
            <h3 className="mb-2 text-xl font-black">{t.error}</h3>
            <p className="mb-6 max-w-md text-center">{error}</p>
            <button onClick={() => window.location.reload()} className="rounded-full bg-red-500 px-8 py-3 font-black text-white transition-colors hover:bg-red-600">
              {t.retry}
            </button>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white py-24 text-center shadow-sm ring-1 ring-vintage-200">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-vintage-100 text-primary">
              <Filter size={32} />
            </div>
            <h3 className="mb-2 text-xl font-black text-vintage-900">{t.none}</h3>
            <p className="text-vintage-700">{t.noneCopy}</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-6 border-b-2 border-primary font-black text-primary"
            >
              {t.clear}
            </button>
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="mt-16 flex flex-col items-center gap-4">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-vintage-200 text-vintage-700 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={20} className="rtl:rotate-180" />
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;

                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full font-black transition-all ${
                          currentPage === pageNum
                            ? 'scale-110 bg-vintage-900 text-white shadow-lg'
                            : 'border border-vintage-200 bg-white text-vintage-700 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }

                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="px-1 font-black text-vintage-400">...</span>;
                  }

                  return null;
                })}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-vintage-200 text-vintage-700 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={20} className="rtl:rotate-180" />
              </button>
            </nav>
            <p className="text-xs font-bold text-vintage-500">
              {language === 'ar' ? 'صفحة' : 'Page'} {currentPage} {language === 'ar' ? 'من' : 'of'} {totalPages}
            </p>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-vintage-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm font-bold text-vintage-500">© 2026 Fi Kil Shi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Products;

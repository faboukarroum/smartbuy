import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../api/products';

const categories = ['All', 'tools', 'kitchen', 'decor', 'bedding', 'furniture', 'electronics', 'home'];
const pageSizes = [20, 50, 100];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await getProducts({
          keyword: searchQuery,
          category: selectedCategory,
          pageNumber: currentPage,
          pageSize: itemsPerPage,
          sortBy
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

  // Reset to first page when filters or page size changes
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
      
      <main className="container mx-auto px-4 md:px-8 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-vintage-900 mb-4">Our Collection</h1>
          <p className="text-vintage-600 max-w-xl">
            Browse our carefully curated selection of unique finds. Each piece has been inspected and verified by our experts.
          </p>
        </header>

        {/* Filters & Tools */}
        <div className="flex flex-col space-y-6 mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap capitalize ${
                    selectedCategory === cat 
                      ? 'bg-vintage-900 text-white shadow-md' 
                      : 'bg-white text-vintage-600 border border-vintage-200 hover:border-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-vintage-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-vintage-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Sort */}
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 bg-white border border-vintage-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-vintage-700"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 text-vintage-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Items Per Page & Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 p-4 rounded-2xl border border-vintage-100">
            <p className="text-sm text-vintage-600">
              Showing <span className="font-bold text-vintage-900">{indexOfFirstItem + 1}</span> to <span className="font-bold text-vintage-900">{Math.min(indexOfLastItem, totalItems)}</span> of <span className="font-bold text-vintage-900">{totalItems}</span> items
            </p>
            
            <div className="flex items-center gap-3">
              <label className="text-sm text-vintage-600 font-medium">Items per page:</label>
              <div className="flex gap-1">
                {pageSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setItemsPerPage(size)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      itemsPerPage === size
                        ? 'bg-vintage-900 text-white shadow-sm'
                        : 'bg-white text-vintage-500 border border-vintage-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-vintage-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="text-lg font-medium">Loading treasures...</p>
          </div>
        ) : error ? (
          <div className="py-24 flex flex-col items-center justify-center text-red-500 bg-red-50 rounded-2xl border border-red-100 p-8">
            <AlertCircle className="mb-4" size={48} />
            <h3 className="text-xl font-serif font-bold mb-2">Something went wrong</h3>
            <p className="text-center max-w-md mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-vintage-100 rounded-full text-vintage-400 mb-4">
              <Filter size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-vintage-900 mb-2">No items found</h3>
            <p className="text-vintage-600">Try adjusting your filters or search terms.</p>
            <button 
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-6 text-primary font-bold border-b-2 border-primary"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination UI */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-16 flex flex-col items-center gap-4">
            <nav className="flex items-center gap-2">
              <button 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-vintage-200 text-vintage-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show current page, first, last, and pages around current
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-vintage-900 text-white shadow-lg scale-110'
                            : 'bg-white text-vintage-600 border border-vintage-200 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  // Show ellipses
                  if (
                    pageNum === currentPage - 2 || 
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="text-vintage-400 font-bold px-1">...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-vintage-200 text-vintage-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </nav>
            <p className="text-xs text-vintage-400 font-medium">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-vintage-200 py-12 mt-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-vintage-400 text-sm">© 2026 SmartBuy Bric-a-Brac. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Products;

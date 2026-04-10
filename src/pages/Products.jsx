import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';

const allProducts = [
  { id: 1, name: 'Vintage Brass Mirror', price: 45.00, category: 'Decor', image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=500&fit=crop', isNew: true },
  { id: 2, name: 'Ceramic Tea Set', price: 32.50, category: 'Kitchen', image: 'https://images.unsplash.com/photo-1565193998248-d500a72183b1?w=400&h=500&fit=crop' },
  { id: 3, name: 'Antique Typewriter', price: 120.00, category: 'Collectibles', image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&h=500&fit=crop' },
  { id: 4, name: 'Velvet Armchair', price: 85.00, category: 'Furniture', image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=500&fit=crop', isNew: true },
  { id: 5, name: 'Wooden Wall Clock', price: 55.00, category: 'Decor', image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=500&fit=crop' },
  { id: 6, name: 'Silver Cutlery Set', price: 75.00, category: 'Kitchen', image: 'https://images.unsplash.com/photo-1591133303642-1250f28e515d?w=400&h=500&fit=crop' },
  { id: 7, name: 'Leather Suitcase', price: 95.00, category: 'Collectibles', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop' },
  { id: 8, name: 'Brass Candlestick', price: 18.00, category: 'Decor', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=500&fit=crop' },
];

const categories = ['All', 'Decor', 'Kitchen', 'Collectibles', 'Furniture'];

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filteredProducts = allProducts
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return b.id - a.id; // newest
    });

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
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
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

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
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

        {/* Pagination Placeholder */}
        <div className="mt-16 flex justify-center">
          <nav className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-vintage-200 text-vintage-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50" disabled>
              &larr;
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-vintage-900 text-white shadow-md">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-vintage-200 text-vintage-600 hover:border-primary hover:text-primary transition-colors">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-vintage-200 text-vintage-600 hover:border-primary hover:text-primary transition-colors">3</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-vintage-200 text-vintage-600 hover:border-primary hover:text-primary transition-colors">
              &rarr;
            </button>
          </nav>
        </div>
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

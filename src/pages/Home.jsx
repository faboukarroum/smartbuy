import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';

const featuredProducts = [
  { id: 1, name: 'Vintage Brass Mirror', price: 45.00, category: 'Decor', image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=500&fit=crop', isNew: true },
  { id: 2, name: 'Ceramic Tea Set', price: 32.50, category: 'Kitchen', image: 'https://images.unsplash.com/photo-1565193998248-d500a72183b1?w=400&h=500&fit=crop' },
  { id: 3, name: 'Antique Typewriter', price: 120.00, category: 'Collectibles', image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&h=500&fit=crop' },
  { id: 4, name: 'Velvet Armchair', price: 85.00, category: 'Furniture', image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=500&fit=crop', isNew: true },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <header className="relative h-[80vh] flex items-center overflow-hidden bg-vintage-100">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-vintage-100 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">
              Curated Bric-a-Brac Outlet
            </h3>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-vintage-900 leading-tight mb-6">
              Treasures with <span className="text-primary italic">History.</span>
            </h1>
            <p className="text-lg text-vintage-700 mb-8 max-w-lg leading-relaxed">
              Explore our unique collection of antique, vintage, and one-of-a-kind items carefully selected for your home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="vintage-button !px-8 !py-4 text-lg font-medium flex items-center group">
                Shop Collection
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/about" className="px-8 py-4 text-vintage-900 font-medium hover:text-primary transition-colors">
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white border-y border-vintage-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-vintage-100 rounded-full flex items-center justify-center text-primary mb-4">
                <Star size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Unique Finds</h3>
              <p className="text-vintage-600">Every item in our shop is hand-picked for its character and quality.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-vintage-100 rounded-full flex items-center justify-center text-primary mb-4">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Quality Assured</h3>
              <p className="text-vintage-600">We inspect and authenticate every piece before it reaches your hands.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-vintage-100 rounded-full flex items-center justify-center text-primary mb-4">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Weekly Updates</h3>
              <p className="text-vintage-600">New treasures arrive every Monday morning. Check back often!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-vintage-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-serif font-bold text-vintage-900 mb-2">Featured Collection</h2>
              <p className="text-vintage-600">Handpicked treasures for your modern home.</p>
            </div>
            <Link to="/products" className="text-primary font-bold border-b-2 border-primary hover:text-primary/80 transition-colors">
              View All Products
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer Placeholder */}
      <footer className="bg-vintage-900 text-white py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-3xl font-serif font-bold mb-6">SmartBuy</h2>
              <p className="text-vintage-400 max-w-md leading-relaxed">
                We believe that every item has a story to tell. Our mission is to connect these stories with people who will cherish them for years to come.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Shop</h4>
              <ul className="space-y-4 text-vintage-400">
                <li><Link to="/products" className="hover:text-primary">All Items</Link></li>
                <li><Link to="/products?category=furniture" className="hover:text-primary">Furniture</Link></li>
                <li><Link to="/products?category=decor" className="hover:text-primary">Decor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-vintage-400">
                <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
                <li><Link to="/shipping" className="hover:text-primary">Shipping Info</Link></li>
                <li><Link to="/returns" className="hover:text-primary">Returns</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-vintage-800 mt-16 pt-8 flex flex-col md:flex-row justify-between text-vintage-500 text-sm">
            <p>© 2026 SmartBuy Bric-a-Brac. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Pinterest</a>
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

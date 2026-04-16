import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import useCartStore from '../store/cartStore';
import ProductImage from './ProductImage';

const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="vintage-card group"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <ProductImage
          product={product}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          <Link 
            to={`/products/${product._id || product.id}`}
            className="p-3 bg-white text-vintage-900 rounded-full hover:bg-primary hover:text-white transition-colors duration-300 shadow-lg"
          >
            <Eye size={20} />
          </Link>
          <button 
            onClick={() => addToCart(product)}
            className="p-3 bg-white text-vintage-900 rounded-full hover:bg-primary hover:text-white transition-colors duration-300 shadow-lg"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
        
        {product.isNew && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
            New
          </span>
        )}
      </div>
      
      <div className="p-4 text-center">
        <h3 className="text-sm font-medium text-vintage-500 uppercase tracking-widest mb-1">
          {product.category}
        </h3>
        <Link to={`/products/${product._id || product.id}`} className="block text-lg font-serif font-bold text-vintage-900 hover:text-primary transition-colors mb-2">
          {product.name}
        </Link>
        <p className="text-lg font-medium text-primary">
          ${product.price?.toFixed(2)}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductCard;

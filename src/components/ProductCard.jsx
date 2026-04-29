import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import useCartStore from '../store/cartStore';
import usePreferencesStore from '../store/preferencesStore';
import ProductImage from './ProductImage';
import { getDisplayPrice } from '../utils/pricing';

const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const currency = usePreferencesStore((state) => state.currency);
  const displayPrice = getDisplayPrice(product, currency);
  const stock = Number(product.stock);
  const isLimited = Number.isFinite(stock) && stock > 0 && stock <= 5;

  return (
    <div className="vintage-card group transition-transform duration-300 hover:-translate-y-1">
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
          <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-secondary to-primary px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-lg">
            New
          </span>
        )}
        {isLimited && (
          <span className="absolute right-4 top-4 rounded-full bg-vintage-900 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-lg">
            Only {stock} left
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="mb-1 text-xs font-black uppercase tracking-wide text-primary">
          {product.category}
        </h3>
        <Link to={`/products/${product._id || product.id}`} className="mb-3 block min-h-12 text-lg font-black leading-tight text-vintage-900 transition-colors hover:text-primary">
          {product.name}
        </Link>
        <p className="text-2xl font-black text-vintage-900">
          {displayPrice.label}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;

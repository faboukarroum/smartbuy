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
  const usdToLbpRate = usePreferencesStore((state) => state.usdToLbpRate);
  const [justAdded, setJustAdded] = React.useState(false);
  const displayPrice = getDisplayPrice(product, currency, usdToLbpRate);
  const stock = Number(product.stock);
  const isOutOfStock = Number.isFinite(stock) && stock <= 0;
  const isLimited = Number.isFinite(stock) && stock > 0 && stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return;
    }

    addToCart({ ...product, quantity: 1 });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div className="vintage-card group transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/5] overflow-hidden">
        <ProductImage
          product={product}
          alt={product.name}
          wrapperClassName="h-full w-full"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
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
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="p-3 bg-white text-vintage-900 rounded-full hover:bg-primary hover:text-white transition-colors duration-300 shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
            aria-label={isOutOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
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
        {isOutOfStock && (
          <span className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-lg">
            Out of stock
          </span>
        )}
      </div>
      
      <div className="p-3 sm:p-4">
        <h3 className="mb-1 text-xs font-black uppercase tracking-wide text-primary">
          {product.category}
        </h3>
        <Link to={`/products/${product._id || product.id}`} className="mb-3 block min-h-12 text-base font-black leading-tight text-vintage-900 transition-colors hover:text-primary sm:text-lg">
          {product.name}
        </Link>
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 text-xl font-black text-vintage-900 sm:text-2xl">
            {displayPrice.label}
          </p>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-all md:hidden ${
              justAdded ? 'bg-green-600 shadow-green-600/20' : 'bg-primary shadow-primary/20'
            } disabled:cursor-not-allowed disabled:bg-vintage-300 disabled:shadow-none`}
            aria-label={isOutOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
          >
            <ShoppingCart size={19} />
          </button>
        </div>
        {justAdded && (
          <p className="mt-2 text-xs font-black uppercase tracking-wide text-green-700">Added to cart</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

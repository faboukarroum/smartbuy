import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Shield, Truck, RotateCcw } from 'lucide-react';
import Navbar from '../components/Navbar';
import useCartStore from '../store/cartStore';

// Mock data for individual product
const allProducts = [
  { 
    id: 1, 
    name: 'Vintage Brass Mirror', 
    price: 45.00, 
    category: 'Decor', 
    image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&h=1000&fit=crop', 
    description: 'This stunning vintage brass mirror features intricate scrollwork detailing around its oval frame. Dating back to the mid-20th century, it carries a beautiful natural patina that adds character to any wall. Perfect for a hallway, bedroom, or as a statement piece in a gallery wall.',
    details: [
      'Material: Solid Brass',
      'Dimensions: 45cm x 30cm',
      'Origin: France, circa 1950',
      'Condition: Excellent vintage condition with minor surface wear consistent with age'
    ],
    stock: 1
  },
  // ... other products would be here
];

const ProductDetail = () => {
  const { id } = useParams();
  const addToCart = useCartStore((state) => state.addToCart);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // In a real app, this would be an API call
    const foundProduct = allProducts.find(p => p.id === parseInt(id)) || allProducts[0];
    setProduct(foundProduct);
  }, [id]);

  if (!product) return null;

  return (
    <div className="min-h-screen bg-vintage-50">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-12">
        <Link to="/products" className="inline-flex items-center text-vintage-600 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-white border border-vintage-200 shadow-sm">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails placeholder */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-white border border-vintage-200 cursor-pointer hover:border-primary transition-colors">
                  <img src={product.image} alt="" className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <span className="text-primary font-bold uppercase tracking-widest text-sm">
                {product.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-vintage-900 mt-2 mb-4">
                {product.name}
              </h1>
              <p className="text-3xl font-medium text-primary mb-6">
                ${product.price.toFixed(2)}
              </p>
              <p className="text-vintage-600 leading-relaxed text-lg mb-8">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-vintage-200 rounded-full bg-white px-2">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-vintage-600 hover:text-primary"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium text-vintage-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-vintage-600 hover:text-primary"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => addToCart({ ...product, quantity })}
                  className="flex-1 vintage-button !py-4 flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button className="w-14 h-14 flex items-center justify-center rounded-full border border-vintage-200 bg-white text-vintage-400 hover:text-red-500 hover:border-red-200 transition-all">
                  <Heart size={24} />
                </button>
              </div>
            </div>

            {/* Details Accordion Placeholder */}
            <div className="border-t border-vintage-200 py-6">
              <h3 className="font-serif font-bold text-xl mb-4">Product Details</h3>
              <ul className="space-y-3">
                {product.details.map((detail, index) => (
                  <li key={index} className="flex items-start text-vintage-600">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-vintage-200 mt-auto">
              <div className="flex items-center gap-3 text-sm text-vintage-500">
                <Shield size={20} className="text-primary" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-vintage-500">
                <Truck size={20} className="text-primary" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-vintage-500">
                <RotateCcw size={20} className="text-primary" />
                <span>14 Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;

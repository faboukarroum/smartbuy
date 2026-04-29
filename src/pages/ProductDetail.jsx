import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, ShoppingCart, Heart, ArrowLeft, Shield, Truck, CreditCard, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import useCartStore from '../store/cartStore';
import { getProductById } from '../api/products';
import ProductImage from '../components/ProductImage';
import { getProductImageCandidates, getProductFallbackImage } from '../utils/productImages';
import usePreferencesStore from '../store/preferencesStore';
import { getDisplayPrice } from '../utils/pricing';
import { getProductWhatsAppUrl } from '../utils/whatsapp';
import { SUPPORT_POINTS } from '../config/brand';

const ProductDetail = () => {
  const { id } = useParams();
  const addToCart = useCartStore((state) => state.addToCart);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { language, currency } = usePreferencesStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await getProductById(id);
        setProduct(data);
        setSelectedImage(0);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const allImages = product ? getProductImageCandidates(product) : [];
  const galleryImages = allImages.length > 0 ? allImages : [getProductFallbackImage(product)];
  const displayPrice = product ? getDisplayPrice(product, currency) : null;
  const stock = Number(product?.stock);
  const support = SUPPORT_POINTS[language];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vintage-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={48} />
            <p className="text-lg font-medium text-vintage-400">{language === 'ar' ? 'عم نحمّل تفاصيل المنتج...' : 'Loading product details...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-vintage-50">
        <Navbar />
        <div className="container mx-auto px-4 md:px-8 py-12">
          <Link to="/products" className="inline-flex items-center text-vintage-600 hover:text-primary mb-8 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            {language === 'ar' ? 'رجوع للمنتجات' : 'Back to products'}
          </Link>
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-red-500 bg-red-50 rounded-2xl border border-red-100 p-8">
            <AlertCircle className="mb-4" size={48} />
            <h3 className="text-xl font-serif font-bold mb-2">Product not found</h3>
              <p className="text-center max-w-md mb-6">{error || (language === 'ar' ? 'المنتج غير موجود.' : 'The product you are looking for does not exist.')}</p>
            <Link to="/products" className="px-8 py-3 bg-vintage-900 text-white rounded-full font-medium hover:bg-vintage-800 transition-colors">
              {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vintage-50">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-12">
        <Link to="/products" className="inline-flex items-center text-vintage-600 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          {language === 'ar' ? 'رجوع للمنتجات' : 'Back to products'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white border border-vintage-200 shadow-sm">
              <ProductImage
                product={product}
                src={galleryImages[selectedImage]}
                alt={`${product.name} - Image ${selectedImage + 1}`} 
                className="w-full h-full object-cover"
              />
              
              {/* Navigation arrows for multiple images */}
              {galleryImages.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-vintage-800 hover:text-primary transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-vintage-800 hover:text-primary transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Image counter */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  {selectedImage + 1} / {galleryImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {galleryImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-primary shadow-md scale-95' 
                        : 'border-vintage-200 hover:border-primary/50'
                    }`}
                  >
                    <ProductImage
                      product={product}
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
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
              <p className="text-3xl font-bold text-primary mb-6">
                {displayPrice.label}
              </p>
              <p className="text-vintage-600 leading-relaxed text-lg mb-8">
                {product.description}
              </p>
            </div>

            {/* Stock indicator */}
            <div className="mb-6">
              {!Number.isFinite(stock) || stock > 0 ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {isNaN(stock) ? (language === 'ar' ? 'متوفر' : 'In stock') : `${stock} ${language === 'ar' ? 'متوفر' : 'in stock'}`}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {language === 'ar' ? 'خلص من المخزون' : 'Out of stock'}
                </span>
              )}
              {Number.isFinite(stock) && stock > 0 && stock <= 5 && (
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                  {language === 'ar' ? `باقي ${stock} بس` : `Only ${stock} left`}
                </span>
              )}
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
                  disabled={product.stock === 0}
                  className="flex-1 vintage-button !py-4 flex items-center justify-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={20} />
                  {language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                </button>
                <a
                  href={getProductWhatsAppUrl(product, currency, language)}
                  className="w-14 h-14 flex items-center justify-center rounded-full border border-vintage-200 bg-white text-vintage-600 hover:text-green-600 hover:border-green-200 transition-all"
                  aria-label="Order on WhatsApp"
                >
                  <MessageCircle size={24} />
                </a>
                <button className="w-14 h-14 flex items-center justify-center rounded-full border border-vintage-200 bg-white text-vintage-400 hover:text-red-500 hover:border-red-200 transition-all">
                  <Heart size={24} />
                </button>
              </div>
            </div>

            {/* Details Accordion */}
            <div className="border-t border-vintage-200 py-6">
              <h3 className="font-serif font-bold text-xl mb-4">{language === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}</h3>
              <ul className="space-y-3">
                {product.details && product.details.length > 0 ? (
                  product.details.map((detail, index) => (
                    <li key={index} className="flex items-start text-vintage-600">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                      {detail}
                    </li>
                  ))
                ) : (
                  <li className="flex items-start text-vintage-600">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                    {language === 'ar' ? 'ما في تفاصيل إضافية حالياً' : 'No additional details available'}
                  </li>
                )}
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-vintage-200 mt-auto">
              <div className="flex items-center gap-3 text-sm text-vintage-500">
                <Shield size={20} className="text-primary" />
                <span>{support.payment}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-vintage-500">
                <Truck size={20} className="text-primary" />
                <span>{support.delivery}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-vintage-500">
                <CreditCard size={20} className="text-primary" />
                <span>{support.card}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;

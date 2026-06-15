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
  const { language, currency, usdToLbpRate } = usePreferencesStore();

  const t = {
    loading: language === 'ar' ? 'عم نحمّل تفاصيل المنتج...' : 'Loading product details...',
    back: language === 'ar' ? 'رجوع للمنتجات' : 'Back to products',
    notFound: language === 'ar' ? 'المنتج اللي عم تفتش عليه مش موجود.' : 'The product you are looking for does not exist.',
    browse: language === 'ar' ? 'تصفح المنتجات' : 'Browse Products',
    inStock: language === 'ar' ? 'متوفر' : 'In stock',
    outOfStock: language === 'ar' ? 'خلص من المخزون' : 'Out of Stock',
    left: (stock) => language === 'ar' ? `باقي ${stock} بس` : `Only ${stock} left`,
    add: language === 'ar' ? 'أضف للسلّة' : 'Add to Cart',
    details: language === 'ar' ? 'تفاصيل المنتج' : 'Product Details',
    noDetails: language === 'ar' ? 'ما في تفاصيل إضافية حالياً' : 'No additional details available',
  };

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
  const displayPrice = product ? getDisplayPrice(product, currency, usdToLbpRate) : null;
  const stock = Number(product?.stock);
  const isOutOfStock = Number.isFinite(stock) && stock <= 0;
  const maxQty = Number.isFinite(stock) && stock > 0 ? stock : Infinity;
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
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 animate-spin text-primary" size={48} />
            <p className="text-lg font-medium text-vintage-400">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-vintage-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12 md:px-8">
          <Link to="/products" className="mb-8 inline-flex items-center text-vintage-600 transition-colors hover:text-primary">
            <ArrowLeft size={20} className="mr-2" />
            {t.back}
          </Link>
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-8 text-red-500">
            <AlertCircle className="mb-4" size={48} />
            <h3 className="mb-2 text-xl font-bold">Product not found</h3>
            <p className="mb-6 max-w-md text-center">{error || t.notFound}</p>
            <Link to="/products" className="rounded-full bg-vintage-900 px-8 py-3 font-medium text-white transition-colors hover:bg-vintage-800">
              {t.browse}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vintage-50">
      <Navbar />

      <main className="container mx-auto px-4 py-12 md:px-8">
        <Link to="/products" className="mb-8 inline-flex items-center text-vintage-600 transition-colors hover:text-primary">
          <ArrowLeft size={20} className="mr-2" />
          {t.back}
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-vintage-200 bg-white shadow-sm">
              <ProductImage
                product={product}
                src={galleryImages[selectedImage]}
                alt={`${product.name} - Image ${selectedImage + 1}`}
                className="h-full w-full object-cover"
              />

              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-vintage-800 shadow-lg transition-all hover:bg-white hover:text-primary"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-vintage-800 shadow-lg transition-all hover:bg-white hover:text-primary"
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  {selectedImage + 1} / {galleryImages.length}
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {galleryImages.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === index
                        ? 'scale-95 border-primary shadow-md'
                        : 'border-vintage-200 hover:border-primary/50'
                    }`}
                  >
                    <ProductImage
                      product={product}
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-8">
              <span className="text-sm font-bold uppercase tracking-widest text-primary">
                {product.category}
              </span>
              <h1 className="mb-4 mt-2 text-4xl font-bold text-vintage-900 md:text-5xl">
                {product.name}
              </h1>
              <p className="mb-6 text-3xl font-bold text-primary">
                {displayPrice.label}
              </p>
              <p className="mb-8 text-lg leading-relaxed text-vintage-600">
                {product.description}
              </p>
            </div>

            <div className="mb-6">
              {!Number.isFinite(stock) || stock > 0 ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  {Number.isNaN(stock) ? t.inStock : `${stock} ${t.inStock}`}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                  {t.outOfStock}
                </span>
              )}
              {Number.isFinite(stock) && stock > 0 && stock <= 5 && (
                <span className="ml-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                  {t.left(stock)}
                </span>
              )}
            </div>

            <div className="mb-12 space-y-6">
              <div className="grid gap-3 sm:flex sm:items-center sm:gap-4">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 sm:contents">
                  <div className="flex min-h-14 items-center justify-center rounded-full border border-vintage-200 bg-white px-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-11 w-11 items-center justify-center text-vintage-600 hover:text-primary"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-11 text-center font-medium text-vintage-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                      disabled={quantity >= maxQty}
                      className="flex h-11 w-11 items-center justify-center text-vintage-600 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => addToCart({ ...product, quantity })}
                    disabled={isOutOfStock}
                    className="vintage-button flex min-h-14 min-w-0 items-center justify-center gap-2 !px-4 !py-3 text-sm font-black shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50 min-[360px]:gap-3 sm:flex-1 sm:text-base"
                  >
                    <ShoppingCart className="hidden min-[360px]:block" size={20} />
                    <span className="truncate">{isOutOfStock ? t.outOfStock : t.add}</span>
                  </button>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_3.5rem] gap-3 sm:contents">
                  <a
                    href={getProductWhatsAppUrl(product, currency, language, usdToLbpRate)}
                    className="flex min-h-14 min-w-0 items-center justify-center gap-2 rounded-full border border-green-200 bg-white px-4 text-sm font-black text-green-700 transition-all hover:border-green-300 hover:text-green-700 sm:h-14 sm:w-14 sm:px-0 sm:text-vintage-600 sm:hover:text-green-600"
                    aria-label="Order on WhatsApp"
                  >
                    <MessageCircle size={22} />
                    <span className="truncate sm:sr-only">WhatsApp</span>
                  </a>
                  <button
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-vintage-200 bg-white text-vintage-400 transition-all hover:border-red-200 hover:text-red-500"
                    aria-label="Save product"
                  >
                    <Heart size={22} />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-vintage-200 py-6">
              <h3 className="mb-4 text-xl font-bold">{t.details}</h3>
              <ul className="space-y-3">
                {product.details && product.details.length > 0 ? (
                  product.details.map((detail) => (
                    <li key={detail} className="flex items-start text-vintage-600">
                      <span className="mr-3 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      {detail}
                    </li>
                  ))
                ) : (
                  <li className="flex items-start text-vintage-600">
                    <span className="mr-3 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {t.noDetails}
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-auto grid grid-cols-1 gap-6 border-t border-vintage-200 pt-8 md:grid-cols-3">
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

import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import useCartStore from '../store/cartStore';
import ProductImage from '../components/ProductImage';
import usePreferencesStore from '../store/preferencesStore';
import { getDisplayPrice, getLineItemPrice, formatCurrency } from '../utils/pricing';
import { getCartWhatsAppUrl } from '../utils/whatsapp';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const { language, currency } = usePreferencesStore();
  
  const subtotal = items.reduce((acc, item) => {
    const price = getDisplayPrice(item, currency);
    return price.hasPrice ? acc + price.value * item.quantity : acc;
  }, 0);
  const hasPricedItems = items.some((item) => getDisplayPrice(item, currency).hasPrice);

  return (
    <div className="min-h-screen bg-vintage-50">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-12">
        <h1 className="text-4xl font-serif font-bold text-vintage-900 mb-12">{language === 'ar' ? 'سلة التسوق' : 'Your Shopping Bag'}</h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => {
                const itemId = item._id || item.id;
                const linePrice = getLineItemPrice(item, currency);

                return (
                <div key={itemId} className="flex flex-col sm:flex-row gap-6 p-6 bg-white rounded-2xl border border-vintage-200 shadow-sm">
                  <div className="w-full sm:w-32 h-40 rounded-lg overflow-hidden bg-vintage-100 flex-shrink-0">
                    <ProductImage product={item} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-vintage-900 mb-1">{item.name}</h3>
                        <p className="text-vintage-500 text-sm uppercase tracking-wider">{item.category}</p>
                      </div>
                      <p className="text-xl font-bold text-primary">{linePrice.label}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-6">
                      <div className="flex items-center border border-vintage-200 rounded-full bg-white px-1">
                        <button 
                          onClick={() => updateQuantity(itemId, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center text-vintage-600 hover:text-primary"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-medium text-vintage-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(itemId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-vintage-600 hover:text-primary"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(itemId)}
                        className="text-vintage-400 hover:text-red-500 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Trash2 size={18} />
                        {language === 'ar' ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              )})}
              
              <button 
                onClick={clearCart}
                className="text-vintage-500 hover:text-primary text-sm font-medium underline underline-offset-4"
              >
                {language === 'ar' ? 'فضي السلة' : 'Clear entire bag'}
              </button>
            </div>

            {/* Summary Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-vintage-200 p-8 sticky top-32 shadow-sm">
                <h2 className="text-2xl font-serif font-bold text-vintage-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-vintage-600">
                    <span>{language === 'ar' ? 'المجموع' : 'Subtotal'}</span>
                    <span>{hasPricedItems ? formatCurrency(subtotal, currency) : 'Call for cost'}</span>
                  </div>
                  <div className="border-t border-vintage-100 pt-4 flex justify-between text-xl font-bold text-vintage-900">
                    <span>{language === 'ar' ? 'التوصيل' : 'Delivery'}</span>
                    <span>{language === 'ar' ? 'عبر أرامكس' : 'Via Aramex'}</span>
                  </div>
                </div>
                
                <Link to="/checkout" className="w-full vintage-button !py-4 flex items-center justify-center gap-3 shadow-lg shadow-primary/20 mb-4">
                  {language === 'ar' ? 'تابع الطلب' : 'Proceed to Checkout'}
                  <ArrowRight size={20} />
                </Link>

                <a href={getCartWhatsAppUrl(items, currency, language)} className="w-full border border-vintage-200 rounded-full py-4 flex items-center justify-center gap-3 font-bold text-vintage-800 hover:border-green-500 hover:text-green-600 transition-colors mb-4">
                  <MessageCircle size={20} />
                  {language === 'ar' ? 'اطلب عبر واتساب' : 'Order on WhatsApp'}
                </a>
                
                <p className="text-center text-vintage-400 text-xs">
                  {language === 'ar' ? 'الدفع عند الاستلام. الدفع بالكرت قريباً.' : 'Cash on delivery. Card payment coming soon.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-vintage-100 rounded-full text-vintage-400 mb-8">
              <ShoppingBag size={48} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-vintage-900 mb-4">{language === 'ar' ? 'السلة فاضية' : 'Your bag is empty'}</h2>
            <p className="text-vintage-600 mb-8 max-w-md mx-auto">
              {language === 'ar' ? 'بعدك ما ضفت ولا منتج. بلّش شوف اللقطات الموجودة.' : "Looks like you haven't added any items to your bag yet. Start exploring the latest finds."}
            </p>
            <Link to="/products" className="vintage-button !px-12">
              {language === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;

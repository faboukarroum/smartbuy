import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import useCartStore from '../store/cartStore';
import ProductImage from '../components/ProductImage';
import usePreferencesStore from '../store/preferencesStore';
import { getDisplayPrice, getLineItemPrice, formatCurrency } from '../utils/pricing';

const Checkout = () => {
  const { items, clearCart } = useCartStore();
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const { language, currency } = usePreferencesStore();

  const subtotal = items.reduce((acc, item) => {
    const price = getDisplayPrice(item, currency);
    return price.hasPrice ? acc + price.value * item.quantity : acc;
  }, 0);
  const hasPricedItems = items.some((item) => getDisplayPrice(item, currency).hasPrice);

  const onSubmit = (data) => {
    console.log('Order data:', data);
    setIsSubmitted(true);
    setTimeout(() => {
      clearCart();
      navigate('/');
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-vintage-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white p-12 rounded-3xl shadow-xl border border-vintage-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-500 rounded-full mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-vintage-900 mb-4">{language === 'ar' ? 'تم استلام الطلب!' : 'Order Received!'}</h2>
          <p className="text-vintage-600 mb-8">
            {language === 'ar'
              ? 'شكراً لطلبك. رح نتواصل معك لتأكيد التفاصيل والتوصيل عبر أرامكس.'
              : 'Thank you for your order. We will contact you to confirm details and Aramex delivery.'}
          </p>
          <p className="text-sm text-vintage-400">{language === 'ar' ? 'عم نرجعك للصفحة الرئيسية...' : 'Redirecting to home page...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vintage-50">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-12">
        <Link to="/cart" className="inline-flex items-center text-vintage-600 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          {language === 'ar' ? 'رجوع للسلة' : 'Back to bag'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Checkout Form */}
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-serif font-bold text-vintage-900 mb-6 flex items-center gap-3">
                <Truck className="text-primary" size={24} />
                {language === 'ar' ? 'معلومات التوصيل' : 'Delivery Information'}
              </h2>
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-vintage-700 mb-1">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                  <input {...register("fullName", { required: true })} className="w-full px-4 py-3 bg-white border border-vintage-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-vintage-700 mb-1">{language === 'ar' ? 'العنوان' : 'Address'}</label>
                  <input {...register("address", { required: true })} className="w-full px-4 py-3 bg-white border border-vintage-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vintage-700 mb-1">{language === 'ar' ? 'المدينة' : 'City'}</label>
                  <input {...register("city", { required: true })} className="w-full px-4 py-3 bg-white border border-vintage-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vintage-700 mb-1">{language === 'ar' ? 'ملاحظة للتوصيل' : 'Delivery Note'}</label>
                  <input {...register("postalCode", { required: true })} className="w-full px-4 py-3 bg-white border border-vintage-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
              </form>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-vintage-900 mb-6 flex items-center gap-3">
                <CreditCard className="text-primary" size={24} />
                {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border-2 border-primary bg-primary/5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-vintage-900 rounded flex items-center justify-center text-[10px] text-white font-bold uppercase">COD</div>
                    <span className="font-medium text-vintage-900">{language === 'ar' ? 'دفع عند الاستلام' : 'Cash on Delivery'}</span>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="p-4 border border-vintage-200 bg-white rounded-2xl flex items-center justify-between opacity-70">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-vintage-200 rounded flex items-center justify-center text-[10px] text-vintage-700 font-bold uppercase">Card</div>
                    <span className="font-medium text-vintage-700">{language === 'ar' ? 'الدفع بالكرت قريباً' : 'Card payment coming soon'}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-vintage-200 p-8 sticky top-32 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-vintage-900 mb-6">{language === 'ar' ? 'طلبك' : 'Your Order'}</h2>
              
              <div className="max-h-64 overflow-y-auto mb-8 pr-2 space-y-4">
                {items.map((item) => {
                  const linePrice = getLineItemPrice(item, currency);
                  return (
                  <div key={item._id || item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-vintage-50 rounded-lg overflow-hidden flex-shrink-0">
                    <ProductImage product={item} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-vintage-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-vintage-400">{language === 'ar' ? 'الكمية' : 'Qty'}: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-vintage-900 text-sm">{linePrice.label}</p>
                  </div>
                )})}
              </div>

              <div className="space-y-4 mb-8 pt-6 border-t border-vintage-100">
                <div className="flex justify-between text-vintage-600">
                  <span>{language === 'ar' ? 'المجموع' : 'Subtotal'}</span>
                  <span>{hasPricedItems ? formatCurrency(subtotal, currency) : 'Call for cost'}</span>
                </div>
                <div className="flex justify-between text-vintage-600">
                  <span>{language === 'ar' ? 'التوصيل' : 'Delivery'}</span>
                  <span>{language === 'ar' ? 'عبر أرامكس' : 'Via Aramex'}</span>
                </div>
                <div className="border-t border-vintage-100 pt-4 flex justify-between text-xl font-bold text-vintage-900">
                  <span>{language === 'ar' ? 'الدفع' : 'Payment'}</span>
                  <span>{language === 'ar' ? 'عند الاستلام' : 'On delivery'}</span>
                </div>
              </div>
              
              <button 
                form="checkout-form"
                type="submit" 
                className="w-full vintage-button !py-4 flex items-center justify-center gap-3 shadow-lg shadow-primary/20 mb-6"
              >
                {language === 'ar' ? 'أرسل الطلب' : 'Place Order'}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-vintage-400">
                <ShieldCheck size={16} />
                <span>{language === 'ar' ? 'ما في إرجاع إلا إذا الغرض وصل غلط أو متضرر' : 'No returns unless the item arrives damaged or wrong'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;

import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CreditCard, Loader2, ShieldCheck, Truck } from 'lucide-react';
import Navbar from '../components/Navbar';
import useCartStore from '../store/cartStore';
import ProductImage from '../components/ProductImage';
import usePreferencesStore from '../store/preferencesStore';
import { getDisplayPrice, getLineItemPrice, formatCurrency } from '../utils/pricing';
import { createOrder } from '../api/products';

const Checkout = () => {
  const { items, clearCart } = useCartStore();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [apiError, setApiError] = React.useState('');
  const { language } = usePreferencesStore();

  const t = {
    emptyBag: language === 'ar' ? 'السلّة فاضية.' : 'Your bag is empty.',
    submitError: language === 'ar' ? 'ما قدرنا نثبت الطلب. جرّب مرة تانية.' : 'Unable to place your order. Please try again.',
    back: language === 'ar' ? 'رجوع للسلّة' : 'Back to bag',
    deliveryInfo: language === 'ar' ? 'معلومات التوصيل' : 'Delivery Information',
    fullName: language === 'ar' ? 'الاسم الكامل' : 'Full Name',
    phone: language === 'ar' ? 'رقم الهاتف' : 'Phone',
    email: language === 'ar' ? 'الإيميل (اختياري)' : 'Email (optional)',
    address: language === 'ar' ? 'العنوان' : 'Address',
    city: language === 'ar' ? 'المدينة' : 'City',
    deliveryNote: language === 'ar' ? 'ملاحظة للتوصيل' : 'Delivery Note',
    deliveryPlaceholder: language === 'ar'
      ? 'المنطقة، أقرب معلم، الطابق، أو أفضل وقت للاتصال'
      : 'Area, landmark, building, floor, or best time to call',
    deliveryHelp: language === 'ar'
      ? 'ضيف أي تفصيل بيساعد أرامكس أو فريقنا يوصل أسرع.'
      : 'Add anything Aramex or our team should know to find you faster.',
    paymentMethod: language === 'ar' ? 'طريقة الدفع' : 'Payment Method',
    cod: language === 'ar' ? 'دفع عند الاستلام' : 'Cash on Delivery',
    cardSoon: language === 'ar' ? 'الدفع بالكرت قريباً' : 'Card payment coming soon',
    yourOrder: language === 'ar' ? 'طلبك' : 'Your Order',
    qty: language === 'ar' ? 'الكمية' : 'Qty',
    subtotal: language === 'ar' ? 'المجموع' : 'Subtotal',
    delivery: language === 'ar' ? 'التوصيل' : 'Delivery',
    viaAramex: language === 'ar' ? 'عبر أرامكس' : 'Via Aramex',
    payment: language === 'ar' ? 'الدفع' : 'Payment',
    onDelivery: language === 'ar' ? 'عند الاستلام' : 'On delivery',
    placing: language === 'ar' ? 'عم نثبت الطلب...' : 'Placing Order...',
    placeOrder: language === 'ar' ? 'ثبّت الطلب' : 'Place Order',
    returns: language === 'ar' ? 'ما في إرجاع إلا إذا الغرض وصل غلط أو متضرر' : 'No returns unless the item arrives damaged or wrong',
    required: language === 'ar' ? 'هيدا الحقل مطلوب' : 'This field is required',
    invalidEmail: language === 'ar' ? 'اكتب إيميل صحيح' : 'Enter a valid email',
    phoneHelp: language === 'ar' ? 'اكتب رقم يقدر الفريق يتواصل معك عليه.' : 'Use a number our team can reach on delivery day.',
    addressPlaceholder: language === 'ar' ? 'الشارع، المبنى، الطابق' : 'Street, building, floor',
    cityPlaceholder: language === 'ar' ? 'بيروت، جونية، صيدا...' : 'Beirut, Jounieh, Saida...',
  };

  const fieldClassName = (hasError) => `w-full rounded-xl border bg-white px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${
    hasError ? 'border-red-300 ring-2 ring-red-100' : 'border-vintage-200'
  }`;

  const subtotal = items.reduce((acc, item) => {
    const price = getDisplayPrice(item, 'USD');
    return price.hasPrice ? acc + price.value * item.quantity : acc;
  }, 0);
  const hasPricedItems = items.some((item) => getDisplayPrice(item, 'USD').hasPrice);

  const onSubmit = async (data) => {
    if (items.length === 0) {
      setApiError(t.emptyBag);
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError('');

      const response = await createOrder({
        orderItems: items.map((item) => ({
          product: item._id || item.id,
          qty: item.quantity,
        })),
        guestCustomer: {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email || '',
        },
        shippingAddress: {
          fullName: data.fullName,
          address: data.address,
          city: data.city,
          deliveryNote: data.deliveryNote,
        },
        paymentMethod: 'Cash on Delivery',
      });

      const order = response.data;
      clearCart();
      navigate(`/order-confirmation/${order._id}/${order.receiptToken}`, {
        replace: true,
        state: { order },
      });
    } catch (err) {
      setApiError(err.response?.data?.message || t.submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-vintage-50">
      <Navbar />

      <main className="container mx-auto px-4 py-12 md:px-8">
        <Link to="/cart" className="mb-8 inline-flex items-center text-vintage-600 transition-colors hover:text-primary">
          <ArrowLeft size={20} className="mr-2" />
          {t.back}
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="space-y-12">
            <section>
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-vintage-900">
                <Truck className="text-primary" size={24} />
                {t.deliveryInfo}
              </h2>
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2" noValidate>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-vintage-700">{t.fullName}</label>
                  <input
                    {...register('fullName', { required: t.required })}
                    autoComplete="name"
                    className={fieldClassName(errors.fullName)}
                    aria-invalid={errors.fullName ? 'true' : 'false'}
                  />
                  {errors.fullName && <p className="mt-1 text-xs font-bold text-red-500">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-vintage-700">{t.phone}</label>
                  <input
                    {...register('phone', { required: t.required })}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+961"
                    className={fieldClassName(errors.phone)}
                    aria-invalid={errors.phone ? 'true' : 'false'}
                  />
                  {errors.phone ? (
                    <p className="mt-1 text-xs font-bold text-red-500">{errors.phone.message}</p>
                  ) : (
                    <p className="mt-1 text-xs font-medium text-vintage-500">{t.phoneHelp}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-vintage-700">{t.email}</label>
                  <input
                    {...register('email', {
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: t.invalidEmail,
                      },
                    })}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className={fieldClassName(errors.email)}
                    aria-invalid={errors.email ? 'true' : 'false'}
                  />
                  {errors.email && <p className="mt-1 text-xs font-bold text-red-500">{errors.email.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-vintage-700">{t.address}</label>
                  <input
                    {...register('address', { required: t.required })}
                    autoComplete="street-address"
                    placeholder={t.addressPlaceholder}
                    className={fieldClassName(errors.address)}
                    aria-invalid={errors.address ? 'true' : 'false'}
                  />
                  {errors.address && <p className="mt-1 text-xs font-bold text-red-500">{errors.address.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-vintage-700">{t.city}</label>
                  <input
                    {...register('city', { required: t.required })}
                    autoComplete="address-level2"
                    placeholder={t.cityPlaceholder}
                    className={fieldClassName(errors.city)}
                    aria-invalid={errors.city ? 'true' : 'false'}
                  />
                  {errors.city && <p className="mt-1 text-xs font-bold text-red-500">{errors.city.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-vintage-700">{t.deliveryNote}</label>
                  <textarea
                    {...register('deliveryNote', { required: t.required })}
                    rows={3}
                    placeholder={t.deliveryPlaceholder}
                    autoComplete="off"
                    className={`${fieldClassName(errors.deliveryNote)} resize-none`}
                    aria-invalid={errors.deliveryNote ? 'true' : 'false'}
                  />
                  {errors.deliveryNote ? (
                    <p className="mt-1 text-xs font-bold text-red-500">{errors.deliveryNote.message}</p>
                  ) : (
                    <p className="mt-2 text-xs font-medium text-vintage-500">{t.deliveryHelp}</p>
                  )}
                </div>
              </form>
            </section>

            <section>
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-vintage-900">
                <CreditCard className="text-primary" size={24} />
                {t.paymentMethod}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between rounded-2xl border-2 border-primary bg-primary/5 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-12 items-center justify-center rounded bg-vintage-900 text-[10px] font-bold uppercase text-white">COD</div>
                    <span className="font-medium text-vintage-900">{t.cod}</span>
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-vintage-200 bg-white p-4 opacity-70">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-12 items-center justify-center rounded bg-vintage-200 text-[10px] font-bold uppercase text-vintage-700">Card</div>
                    <span className="font-medium text-vintage-700">{t.cardSoon}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-32 rounded-3xl border border-vintage-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-vintage-900">{t.yourOrder}</h2>

              <div className="mb-8 max-h-64 space-y-4 overflow-y-auto pr-2">
                {items.map((item) => {
                  const linePrice = getLineItemPrice(item, 'USD');
                  return (
                    <div key={item._id || item.id} className="flex gap-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-vintage-50">
                        <ProductImage product={item} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-vintage-900">{item.name}</h4>
                        <p className="text-xs text-vintage-400">{t.qty}: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-vintage-900">{linePrice.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mb-8 space-y-4 border-t border-vintage-100 pt-6">
                <div className="flex justify-between text-vintage-600">
                  <span>{t.subtotal}</span>
                  <span>{hasPricedItems ? formatCurrency(subtotal, 'USD') : 'Call for cost'}</span>
                </div>
                <div className="flex justify-between text-vintage-600">
                  <span>{t.delivery}</span>
                  <span>{t.viaAramex}</span>
                </div>
                <div className="flex justify-between border-t border-vintage-100 pt-4 text-xl font-bold text-vintage-900">
                  <span>{t.payment}</span>
                  <span>{t.onDelivery}</span>
                </div>
              </div>

              <button
                form="checkout-form"
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="vintage-button mb-6 flex w-full items-center justify-center gap-3 !py-4 shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {t.placing}
                  </>
                ) : (
                  t.placeOrder
                )}
              </button>

              {apiError && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                  <AlertCircle size={18} />
                  {apiError}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-vintage-400">
                <ShieldCheck size={16} />
                <span>{t.returns}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;

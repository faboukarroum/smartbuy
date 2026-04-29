import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductImage from '../components/ProductImage';
import useCartStore from '../store/cartStore';
import usePreferencesStore from '../store/preferencesStore';
import { formatCurrency, getDisplayPrice, getLineItemPrice } from '../utils/pricing';
import { getCartWhatsAppUrl } from '../utils/whatsapp';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const { language, currency } = usePreferencesStore();

  const subtotal = items.reduce((acc, item) => {
    const price = getDisplayPrice(item, currency);
    return price.hasPrice ? acc + price.value * item.quantity : acc;
  }, 0);
  const hasPricedItems = items.some((item) => getDisplayPrice(item, currency).hasPrice);

  const t = {
    title: language === 'ar' ? 'سلة التسوق' : 'Your Shopping Bag',
    summary: language === 'ar' ? 'ملخص الطلب' : 'Order Summary',
    subtotal: language === 'ar' ? 'المجموع' : 'Subtotal',
    delivery: language === 'ar' ? 'التوصيل' : 'Delivery',
    viaAramex: language === 'ar' ? 'عبر أرامكس' : 'Via Aramex',
    checkout: language === 'ar' ? 'تابع الطلب' : 'Proceed to Checkout',
    whatsapp: language === 'ar' ? 'اطلب عبر واتساب' : 'Order on WhatsApp',
    note: language === 'ar' ? 'الدفع عند الاستلام. الدفع بالكرت قريباً.' : 'Cash on delivery. Card payment coming soon.',
    remove: language === 'ar' ? 'حذف' : 'Remove',
    clear: language === 'ar' ? 'فضي السلة' : 'Clear entire bag',
    empty: language === 'ar' ? 'السلة فاضية' : 'Your bag is empty',
    emptyCopy: language === 'ar' ? 'بعدك ما ضفت ولا منتج. بلّش شوف اللقطات الموجودة.' : "Looks like you haven't added any items to your bag yet. Start exploring the latest finds.",
    start: language === 'ar' ? 'ابدأ التسوق' : 'Start Shopping',
  };

  return (
    <div className="min-h-screen bg-vintage-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <h1 className="mb-10 text-4xl font-black text-vintage-900 md:text-5xl">{t.title}</h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              {items.map((item) => {
                const itemId = item._id || item.id;
                const linePrice = getLineItemPrice(item, currency);

                return (
                  <div key={itemId} className="grid gap-5 rounded-3xl border border-vintage-200 bg-white p-5 shadow-sm sm:grid-cols-[8rem_1fr]">
                    <div className="h-40 overflow-hidden rounded-2xl bg-vintage-100 sm:h-36">
                      <ProductImage product={item} alt={item.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-between gap-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="mb-1 text-xs font-black uppercase tracking-wide text-primary">{item.category}</p>
                          <h3 className="text-xl font-black text-vintage-900">{item.name}</h3>
                        </div>
                        <p className="text-xl font-black text-vintage-900">{linePrice.label}</p>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center rounded-full border border-vintage-200 bg-vintage-50 px-1">
                          <button onClick={() => updateQuantity(itemId, Math.max(1, item.quantity - 1))} className="flex h-9 w-9 items-center justify-center text-vintage-700 hover:text-primary">
                            <Minus size={16} />
                          </button>
                          <span className="w-9 text-center font-black text-vintage-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(itemId, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center text-vintage-700 hover:text-primary">
                            <Plus size={16} />
                          </button>
                        </div>

                        <button onClick={() => removeFromCart(itemId)} className="flex items-center gap-2 text-sm font-bold text-vintage-500 transition-colors hover:text-red-500">
                          <Trash2 size={18} />
                          {t.remove}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button onClick={clearCart} className="font-bold text-vintage-600 underline underline-offset-4 hover:text-primary">
                {t.clear}
              </button>
            </div>

            <div>
              <div className="sticky top-32 rounded-3xl border border-vintage-200 bg-white p-7 shadow-xl shadow-vintage-900/5">
                <h2 className="mb-6 text-2xl font-black text-vintage-900">{t.summary}</h2>

                <div className="mb-8 space-y-4">
                  <div className="flex justify-between font-bold text-vintage-700">
                    <span>{t.subtotal}</span>
                    <span>{hasPricedItems ? formatCurrency(subtotal, currency) : 'Call for cost'}</span>
                  </div>
                  <div className="flex justify-between border-t border-vintage-100 pt-4 text-lg font-black text-vintage-900">
                    <span>{t.delivery}</span>
                    <span>{t.viaAramex}</span>
                  </div>
                </div>

                <Link to="/checkout" className="vintage-button mb-4 flex w-full items-center justify-center gap-3 !py-4 font-black">
                  {t.checkout}
                  <ArrowRight size={20} className="rtl:rotate-180" />
                </Link>

                <a href={getCartWhatsAppUrl(items, currency, language)} className="mb-4 flex w-full items-center justify-center gap-3 rounded-full border border-green-200 bg-green-50 py-4 font-black text-green-700 transition-colors hover:border-green-500">
                  <MessageCircle size={20} />
                  {t.whatsapp}
                </a>

                <p className="text-center text-xs font-bold text-vintage-500">{t.note}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white py-24 text-center shadow-sm ring-1 ring-vintage-200">
            <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-vintage-100 text-primary">
              <ShoppingBag size={48} />
            </div>
            <h2 className="mb-4 text-3xl font-black text-vintage-900">{t.empty}</h2>
            <p className="mx-auto mb-8 max-w-md text-vintage-700">{t.emptyCopy}</p>
            <Link to="/products" className="vintage-button !px-12 !py-3 font-black">
              {t.start}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;

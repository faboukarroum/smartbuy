import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Package, ReceiptText, ShoppingBag, Truck, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductImage from '../components/ProductImage';
import useAuthStore from '../store/authStore';
import usePreferencesStore from '../store/preferencesStore';
import { getOrderById, getOrderReceipt } from '../api/products';
import { getFulfillmentLabel } from '../utils/orders';
import { formatCurrency } from '../utils/pricing';

const OrderConfirmation = () => {
  const { id, receiptToken } = useParams();
  const location = useLocation();
  const { user } = useAuthStore();
  const { language } = usePreferencesStore();
  const [order, setOrder] = React.useState(location.state?.order || null);
  const [loading, setLoading] = React.useState(Boolean(!location.state?.order && id));
  const [error, setError] = React.useState('');
  const canFetchReceipt = Boolean(id && receiptToken);
  const canFetchPrivateOrder = Boolean(id && !receiptToken && user);
  const canRetry = canFetchReceipt || canFetchPrivateOrder;
  const isReceipt = Boolean(receiptToken);

  const t = {
    title: language === 'ar' ? 'وصلنا طلبك!' : 'Order received',
    detailsTitle: language === 'ar' ? 'تفاصيل الطلب' : 'Order details',
    intro: language === 'ar'
      ? 'شكراً لطلبك. رح نتواصل معك لتأكيد التفاصيل والتوصيل عبر أرامكس.'
      : 'Thank you for your order. We will contact you to confirm details and Aramex delivery.',
    detailsIntro: language === 'ar'
      ? 'راجع حالة الطلب، معلومات التوصيل، والأغراض.'
      : 'Review your order status, delivery details, and items.',
    orderId: language === 'ar' ? 'رقم الطلب' : 'Order ID',
    status: language === 'ar' ? 'الحالة' : 'Status',
    payment: language === 'ar' ? 'الدفع' : 'Payment',
    codPending: language === 'ar' ? 'دفع عند الاستلام' : 'Cash on delivery',
    customer: language === 'ar' ? 'الزبون' : 'Customer',
    delivery: language === 'ar' ? 'التوصيل' : 'Delivery',
    deliveryNote: language === 'ar' ? 'ملاحظة التوصيل' : 'Delivery Note',
    items: language === 'ar' ? 'الأغراض' : 'Items',
    qty: language === 'ar' ? 'الكمية' : 'Qty',
    subtotal: language === 'ar' ? 'المجموع' : 'Subtotal',
    deliveryFee: language === 'ar' ? 'التوصيل' : 'Delivery',
    total: language === 'ar' ? 'المجموع النهائي' : 'Total',
    profileCta: language === 'ar' ? 'شوف طلباتك من حسابك' : 'View your orders in profile',
    shopMore: language === 'ar' ? 'كمل تسوق' : 'Continue shopping',
    loading: language === 'ar' ? 'عم نحمّل الإيصال...' : 'Loading receipt...',
    missing: language === 'ar' ? 'ما لقينا هالإيصال.' : 'Receipt could not be found.',
    retry: language === 'ar' ? 'جرّب مرة تانية' : 'Try again',
    noEmail: language === 'ar' ? 'ما في إيميل' : 'No email provided',
    noPhone: language === 'ar' ? 'ما في رقم هاتف' : 'No phone provided',
    free: language === 'ar' ? 'عبر أرامكس' : 'Via Aramex',
    paid: language === 'ar' ? 'مدفوع' : 'Paid',
  };

  const fetchReceipt = React.useCallback(async () => {
    if (order) {
      setLoading(false);
      return;
    }

    if (!canFetchReceipt && !canFetchPrivateOrder) {
      setError(t.missing);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const { data } = canFetchReceipt
        ? await getOrderReceipt(id, receiptToken)
        : await getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || t.missing);
    } finally {
      setLoading(false);
    }
  }, [canFetchPrivateOrder, canFetchReceipt, id, order, receiptToken, t.missing]);

  React.useEffect(() => {
    fetchReceipt();
  }, [fetchReceipt]);

  if (loading) {
    return (
      <div className="min-h-screen bg-vintage-50">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-vintage-500">
          <Loader2 className="mb-4 animate-spin text-primary" size={40} />
          <p className="font-bold">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-vintage-50">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-16 md:px-8">
          <div className="rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm sm:rounded-3xl sm:p-10">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={44} />
            <h1 className="mb-3 text-3xl font-black text-vintage-900">{t.missing}</h1>
            <p className="mb-8 text-vintage-600">{error || t.missing}</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              {canRetry && (
                <button
                  type="button"
                  onClick={fetchReceipt}
                  className="inline-flex min-h-11 items-center rounded-full border border-vintage-200 bg-white px-8 py-3 font-black text-vintage-900 transition-colors hover:border-primary hover:text-primary"
                >
                  {t.retry}
                </button>
              )}
              <Link to="/products" className="vintage-button inline-flex !px-8 !py-3 font-black">
                {t.shopMore}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const customerName = order.user?.name || order.guestCustomer?.fullName || order.shippingAddress?.fullName || 'Guest Customer';
  const customerEmail = order.user?.email || order.guestCustomer?.email || '';
  const phone = order.guestCustomer?.phone || '';

  return (
    <div className="min-h-screen bg-vintage-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <section className="mb-8 rounded-2xl border border-vintage-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                <CheckCircle2 size={34} />
              </div>
              <div>
                <p className="mb-2 text-sm font-black uppercase tracking-wide text-primary">{t.orderId}: #{order._id?.slice(-8)}</p>
                <h1 className="text-3xl font-black text-vintage-900 sm:text-4xl">{isReceipt ? t.title : t.detailsTitle}</h1>
                <p className="mt-3 max-w-2xl text-vintage-600">{isReceipt ? t.intro : t.detailsIntro}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {user && (
                <Link to="/profile" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-vintage-200 bg-white px-5 py-3 text-sm font-black text-vintage-900 hover:border-primary hover:text-primary">
                  <User size={18} />
                  {t.profileCta}
                </Link>
              )}
              <Link to="/products" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-vintage-900 px-5 py-3 text-sm font-black text-white hover:bg-vintage-800">
                <ShoppingBag size={18} />
                {t.shopMore}
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-vintage-200 bg-white p-5">
                <p className="text-xs font-black uppercase tracking-wide text-vintage-500">{t.status}</p>
                <p className="mt-2 font-black text-vintage-900">{getFulfillmentLabel(order, language)}</p>
              </div>
              <div className="rounded-2xl border border-vintage-200 bg-white p-5">
                <p className="text-xs font-black uppercase tracking-wide text-vintage-500">{t.payment}</p>
                <p className="mt-2 font-black text-vintage-900">{order.isPaid ? t.paid : t.codPending}</p>
              </div>
              <div className="rounded-2xl border border-vintage-200 bg-white p-5">
                <p className="text-xs font-black uppercase tracking-wide text-vintage-500">{t.total}</p>
                <p className="mt-2 font-black text-vintage-900">{formatCurrency(Number(order.totalPrice || 0), 'USD')}</p>
              </div>
            </section>

            <section className="rounded-2xl border border-vintage-200 bg-white shadow-sm sm:rounded-3xl">
              <div className="border-b border-vintage-100 px-6 py-5">
                <h2 className="flex items-center gap-2 text-xl font-black text-vintage-900">
                  <Package size={22} className="text-primary" />
                  {t.items}
                </h2>
              </div>
              <div className="divide-y divide-vintage-100">
                {(order.orderItems || []).map((item) => (
                  <div key={`${item.product}-${item.name}`} className="flex gap-4 px-4 py-5 sm:px-6">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-vintage-100">
                      <ProductImage product={item} src={item.image} alt={item.name} className="h-full w-full object-cover" sizes="5rem" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-vintage-900">{item.name}</p>
                      <p className="mt-1 text-sm text-vintage-500">{t.qty}: {item.qty}</p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-vintage-900 sm:text-base">{formatCurrency(Number(item.price || 0) * Number(item.qty || 0), 'USD')}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-vintage-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
                <h2 className="mb-4 text-xl font-black text-vintage-900">{t.customer}</h2>
                <div className="space-y-2 text-sm text-vintage-600">
                  <p className="font-black text-vintage-900">{customerName}</p>
                  <p>{customerEmail || t.noEmail}</p>
                  <p>{phone || t.noPhone}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-vintage-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-vintage-900">
                  <Truck size={22} className="text-primary" />
                  {t.delivery}
                </h2>
                <div className="space-y-3 text-sm text-vintage-600">
                  <div>
                    <p className="font-black text-vintage-900">{order.shippingAddress?.address}</p>
                    <p>{order.shippingAddress?.city}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-vintage-500">{t.deliveryNote}</p>
                    <p className="whitespace-pre-wrap">{order.shippingAddress?.deliveryNote}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="rounded-2xl border border-vintage-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6 lg:sticky lg:top-28 lg:self-start">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-black text-vintage-900">
              <ReceiptText size={22} className="text-primary" />
              {t.total}
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-vintage-600">
                <span>{t.subtotal}</span>
                <span className="font-bold text-vintage-900">{formatCurrency(Number(order.itemsPrice || 0), 'USD')}</span>
              </div>
              <div className="flex justify-between text-vintage-600">
                <span>{t.deliveryFee}</span>
                <span className="font-bold text-vintage-900">{Number(order.shippingPrice || 0) > 0 ? formatCurrency(Number(order.shippingPrice), 'USD') : t.free}</span>
              </div>
              <div className="flex justify-between border-t border-vintage-100 pt-4 text-lg font-black text-vintage-900">
                <span>{t.total}</span>
                <span>{formatCurrency(Number(order.totalPrice || 0), 'USD')}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;

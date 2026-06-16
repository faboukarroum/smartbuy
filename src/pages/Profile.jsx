import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Package, Save, ShoppingBag, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/authStore';
import usePreferencesStore from '../store/preferencesStore';
import { getMyOrders, getUserProfile, updateUserProfile } from '../api/products';
import { getFulfillmentLabel } from '../utils/orders';
import { formatCurrency } from '../utils/pricing';

const Profile = () => {
  const { user, login } = useAuthStore();
  const { language } = usePreferencesStore();
  const isArabic = language === 'ar';
  const t = React.useMemo(() => ({
    accountFallback: language === 'ar' ? 'حسابك' : 'Your Account',
    profileDetails: language === 'ar' ? 'تفاصيل الملف' : 'Profile Details',
    profileHelp: language === 'ar' ? 'حدّث معلومات الحساب وكلمة السر.' : 'Update your account information and password.',
    profileRefreshError: language === 'ar'
      ? 'تعذر تحديث تفاصيل الملف. فيك بعدك تعدّل معلومات الحساب المحفوظة.'
      : 'Profile details could not be refreshed. You can still edit your saved account details.',
    tryAgain: language === 'ar' ? 'جرّب مرة تانية' : 'Try again',
    loadingProfile: language === 'ar' ? 'عم نحمّل الملف...' : 'Loading profile...',
    fullName: language === 'ar' ? 'الاسم الكامل' : 'Full Name',
    emailAddress: language === 'ar' ? 'الإيميل' : 'Email Address',
    newPassword: language === 'ar' ? 'كلمة سر جديدة' : 'New Password',
    passwordPlaceholder: language === 'ar' ? 'اتركها فاضية إذا ما بدك تغير كلمة السر' : 'Leave blank to keep your current password',
    passwordHelp: language === 'ar' ? 'اكتب كلمة سر فقط إذا بدك تغيرها.' : 'Only enter a password when you want to change it.',
    saveProfile: language === 'ar' ? 'حفظ الملف' : 'Save Profile',
    required: language === 'ar' ? 'الاسم والإيميل مطلوبين.' : 'Name and email are required.',
    profileUpdated: language === 'ar' ? 'تم تحديث الملف بنجاح.' : 'Profile updated successfully.',
    updateError: language === 'ar' ? 'تعذر تحديث الملف حالياً.' : 'Unable to update profile right now.',
    orderHistory: language === 'ar' ? 'سجل الطلبات' : 'Order History',
    orderHistoryHelp: language === 'ar' ? 'الطلبات التي أجريتها وأنت مسجل تظهر هنا.' : 'Orders placed while signed in appear here.',
    shop: language === 'ar' ? 'تسوق' : 'Shop',
    loadingOrders: language === 'ar' ? 'عم نحمّل الطلبات...' : 'Loading orders...',
    orderHistoryError: language === 'ar' ? 'سجل الطلبات غير متوفر حالياً.' : 'Order history is unavailable right now.',
    noOrders: language === 'ar' ? 'ما في طلبات بحسابك بعد.' : 'No signed-in orders yet.',
  }), [language]);
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(Boolean(user));
  const [error, setError] = React.useState('');
  const [profileForm, setProfileForm] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });
  const [profileLoading, setProfileLoading] = React.useState(Boolean(user));
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileError, setProfileError] = React.useState('');
  const [profileNotice, setProfileNotice] = React.useState('');

  const fetchProfile = React.useCallback(async () => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    try {
      setProfileLoading(true);
      const { data } = await getUserProfile();
      setProfileForm({
        name: data.name || '',
        email: data.email || '',
        password: '',
      });
      setProfileError('');
    } catch {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
      });
      setProfileError(t.profileRefreshError);
    } finally {
      setProfileLoading(false);
    }
  }, [t.profileRefreshError, user]);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const fetchOrders = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
      setError('');
    } catch {
      setError(t.orderHistoryError);
    } finally {
      setLoading(false);
    }
  }, [t.orderHistoryError, user]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
    setProfileNotice('');
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileError(t.required);
      return;
    }

    try {
      setProfileSaving(true);
      setProfileError('');
      setProfileNotice('');

      const payload = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      };

      if (profileForm.password.trim()) {
        payload.password = profileForm.password;
      }

      const { data } = await updateUserProfile(payload);
      login(data);
      setProfileForm({
        name: data.name || '',
        email: data.email || '',
        password: '',
      });
      setProfileNotice(t.profileUpdated);
    } catch (err) {
      setProfileError(err.response?.data?.message || t.updateError);
    } finally {
      setProfileSaving(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-vintage-50" dir={isArabic ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8 rounded-2xl border border-vintage-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
              <User size={30} />
            </div>
            <div>
              <h1 className="break-words text-2xl font-black text-vintage-900 sm:text-3xl">{user.name || t.accountFallback}</h1>
              <p className="break-words text-vintage-600">{user.email}</p>
            </div>
          </div>
        </div>

        <section className="mb-8 rounded-2xl border border-vintage-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-vintage-900">{t.profileDetails}</h2>
            <p className="text-sm text-vintage-600">{t.profileHelp}</p>
          </div>

          {profileNotice && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={18} />
              {profileNotice}
            </div>
          )}

          {profileError && (
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} />
                <span>{profileError}</span>
              </div>
              <button
                type="button"
                onClick={fetchProfile}
                disabled={profileLoading}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-amber-300 bg-white px-4 text-sm font-black text-amber-900 transition-colors hover:border-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {profileLoading ? <Loader2 className="animate-spin" size={16} /> : t.tryAgain}
              </button>
            </div>
          )}

          {profileLoading ? (
            <div className="flex items-center gap-3 py-6 text-vintage-500">
              <Loader2 className="animate-spin" size={22} />
              <span className="font-bold">{t.loadingProfile}</span>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-vintage-700">{t.fullName}</label>
                <input
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className="w-full rounded-xl border border-vintage-200 bg-vintage-50 px-4 py-3 font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-vintage-700">{t.emailAddress}</label>
                <input
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="w-full rounded-xl border border-vintage-200 bg-vintage-50 px-4 py-3 font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-vintage-700">{t.newPassword}</label>
                <input
                  name="password"
                  type="password"
                  value={profileForm.password}
                  onChange={handleProfileChange}
                  placeholder={t.passwordPlaceholder}
                  className="w-full rounded-xl border border-vintage-200 bg-vintage-50 px-4 py-3 font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-2 text-xs font-medium text-vintage-500">{t.passwordHelp}</p>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-vintage-900 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-vintage-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {profileSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {t.saveProfile}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-2xl border border-vintage-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-vintage-900">{t.orderHistory}</h2>
              <p className="text-sm text-vintage-600">{t.orderHistoryHelp}</p>
            </div>
            <Link to="/products" className="inline-flex min-h-11 items-center rounded-full bg-vintage-900 px-5 py-3 text-sm font-black text-white hover:bg-vintage-800">
              {t.shop}
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-vintage-400">
              <Loader2 className="mb-4 animate-spin" size={36} />
              <p className="font-bold">{t.loadingOrders}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={fetchOrders}
                disabled={loading}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-amber-300 bg-white px-4 text-sm font-black text-amber-900 transition-colors hover:border-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : t.tryAgain}
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-vintage-500">
              <ShoppingBag size={42} className="mx-auto mb-4 opacity-30" />
              <p className="font-bold">{t.noOrders}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  state={{ order }}
                  className="block rounded-2xl border border-vintage-100 bg-vintage-50 p-4 transition-colors hover:border-primary hover:bg-white sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="text-primary" size={22} />
                      <div>
                        <p className="font-black text-vintage-900">#{order._id?.slice(-8)}</p>
                        <p className="text-sm text-vintage-500">
                          {new Date(order.createdAt).toLocaleDateString(isArabic ? 'ar-LB' : undefined)}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-vintage-700">
                      {formatCurrency(Number(order.totalPrice || 0), 'USD')} - {getFulfillmentLabel(order, language)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Profile;

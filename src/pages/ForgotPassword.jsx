import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import { requestPasswordReset } from '../api/products';
import usePreferencesStore from '../store/preferencesStore';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const language = usePreferencesStore((state) => state.language);

  const t = {
    title: language === 'ar' ? 'نسيت كلمة السر؟' : 'Forgot password?',
    subtitle: language === 'ar'
      ? 'حط الإيميل ورح نبعثلك رابط لتغيير كلمة السر إذا الحساب موجود.'
      : 'Enter your email and we will send a reset link if the account exists.',
    email: language === 'ar' ? 'الإيميل' : 'Email Address',
    required: language === 'ar' ? 'الإيميل مطلوب' : 'Email is required',
    send: language === 'ar' ? 'ابعث رابط التغيير' : 'Send reset link',
    sending: language === 'ar' ? 'عم نبعث الرابط...' : 'Sending reset link...',
    fallback: language === 'ar' ? 'إذا الحساب موجود، بعتنا رابط تغيير كلمة السر.' : 'If an account exists for that email, a reset link has been sent.',
    error: language === 'ar' ? 'ما قدرنا نبعث الرابط حالياً. جرّب مرة تانية.' : 'Unable to send reset link right now. Please try again.',
    back: language === 'ar' ? 'رجوع لتسجيل الدخول' : 'Back to sign in',
  };

  const onSubmit = async ({ email }) => {
    try {
      setLoading(true);
      setApiError('');
      setMessage('');
      const { data } = await requestPasswordReset(email);
      setMessage(data?.message || t.fallback);
    } catch (err) {
      setApiError(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-vintage-100">
      <Navbar />

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-3xl border border-vintage-200 bg-white shadow-xl">
            <div className="p-8 md:p-12">
              <Link to="/login" className="mb-8 inline-flex items-center text-sm font-bold text-vintage-600 hover:text-primary">
                <ArrowLeft size={18} className="mr-2 rtl:rotate-180" />
                {t.back}
              </Link>

              <div className="mb-8">
                <h1 className="mb-3 text-3xl font-bold text-vintage-900">{t.title}</h1>
                <p className="text-vintage-500">{t.subtitle}</p>
              </div>

              {message && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-green-700">
                  <CheckCircle2 size={20} />
                  <p className="text-sm font-medium">{message}</p>
                </div>
              )}

              {apiError && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-vintage-700">{t.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-vintage-400 rtl:left-auto rtl:right-4" size={20} />
                    <input
                      {...register('email', { required: t.required })}
                      type="email"
                      placeholder="name@example.com"
                      className={`w-full rounded-xl border bg-vintage-50 py-3 pl-12 pr-4 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rtl:pl-4 rtl:pr-12 ${errors.email ? 'border-red-500' : 'border-vintage-200'}`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="vintage-button flex w-full items-center justify-center gap-3 !py-4 shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {t.sending}
                    </>
                  ) : (
                    t.send
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

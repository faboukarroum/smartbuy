import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import { loginUser } from '../api/products';
import { BRAND_NAME } from '../config/brand';
import usePreferencesStore from '../store/preferencesStore';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const language = usePreferencesStore((state) => state.language);

  const t = {
    title: language === 'ar' ? 'أهلا رجعت' : 'Welcome Back',
    subtitle: language === 'ar' ? `سجّل دخولك على حساب ${BRAND_NAME}` : `Sign in to your ${BRAND_NAME} account`,
    email: language === 'ar' ? 'الإيميل' : 'Email Address',
    emailRequired: language === 'ar' ? 'الإيميل مطلوب' : 'Email is required',
    password: language === 'ar' ? 'كلمة السر' : 'Password',
    passwordRequired: language === 'ar' ? 'كلمة السر مطلوبة' : 'Password is required',
    forgot: language === 'ar' ? 'نسيت كلمة السر؟' : 'Forgot password?',
    invalid: language === 'ar' ? 'الإيميل أو كلمة السر غلط. جرّب مرة تانية.' : 'Invalid email or password. Please try again.',
    signingIn: language === 'ar' ? 'عم نسجّل الدخول...' : 'Signing In...',
    signIn: language === 'ar' ? 'تسجيل الدخول' : 'Sign In',
    or: language === 'ar' ? 'أو كمل عبر' : 'Or continue with',
    googleSoon: language === 'ar' ? 'Google قريباً' : 'Google coming soon',
    noAccount: language === 'ar' ? 'ما عندك حساب؟' : "Don't have an account?",
    create: language === 'ar' ? 'إنشاء حساب' : 'Create account',
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setApiError(null);
      const response = await loginUser(data.email, data.password);
      login(response.data);

      if (response.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setApiError(err.response?.data?.message || t.invalid);
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
              <div className="mb-10 text-center">
                <h1 className="mb-2 text-3xl font-bold text-vintage-900">{t.title}</h1>
                <p className="text-vintage-500">{t.subtitle}</p>
              </div>

              {apiError && (
                <div className="animate-in fade-in slide-in-from-top-4 mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <p className="text-sm font-medium">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-vintage-700">{t.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-vintage-400 rtl:left-auto rtl:right-4" size={20} />
                    <input
                      {...register('email', { required: t.emailRequired })}
                      type="email"
                      placeholder="name@example.com"
                      className={`w-full rounded-xl border bg-vintage-50 py-3 pl-12 pr-4 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rtl:pl-4 rtl:pr-12 ${errors.email ? 'border-red-500' : 'border-vintage-200'}`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <label className="text-sm font-medium text-vintage-700">{t.password}</label>
                    <a href="#" className="text-xs text-primary hover:underline">{t.forgot}</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-vintage-400 rtl:left-auto rtl:right-4" size={20} />
                    <input
                      {...register('password', { required: t.passwordRequired })}
                      type="password"
                      placeholder="********"
                      className={`w-full rounded-xl border bg-vintage-50 py-3 pl-12 pr-4 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rtl:pl-4 rtl:pr-12 ${errors.password ? 'border-red-500' : 'border-vintage-200'}`}
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="vintage-button flex w-full items-center justify-center gap-3 !py-4 shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {t.signingIn}
                    </>
                  ) : (
                    <>
                      {t.signIn}
                      <ArrowRight size={20} className="rtl:rotate-180" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-vintage-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-vintage-400">{t.or}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button disabled className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-vintage-200 px-4 py-3 opacity-60">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="text-sm font-medium text-vintage-700">{t.googleSoon}</span>
                </button>
              </div>
            </div>

            <div className="border-t border-vintage-200 bg-vintage-50 p-6 text-center">
              <p className="text-sm text-vintage-600">
                {t.noAccount} <Link to="/register" className="font-bold text-primary hover:underline">{t.create}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

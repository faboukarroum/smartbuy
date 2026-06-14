import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { loginUser, loginWithGoogle } from '../api/products';
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
    googleError: language === 'ar' ? 'ما قدرنا نسجّل الدخول عبر Google.' : 'Unable to sign in with Google.',
    signingIn: language === 'ar' ? 'عم نسجّل الدخول...' : 'Signing In...',
    signIn: language === 'ar' ? 'تسجيل الدخول' : 'Sign In',
    or: language === 'ar' ? 'أو كمل عبر' : 'Or continue with',
    googleSetup: language === 'ar' ? 'Google بحاجة إعداد' : 'Google setup pending',
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

  const handleGoogleCredential = async (credential) => {
    try {
      setLoading(true);
      setApiError(null);
      const response = await loginWithGoogle(credential);
      login(response.data);

      if (response.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setApiError(err.response?.data?.message || t.googleError);
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
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">{t.forgot}</Link>
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

              <GoogleLoginButton label={t.googleSetup} onCredential={handleGoogleCredential} disabled={loading} />
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

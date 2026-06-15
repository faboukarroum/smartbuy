import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { registerUser, loginWithGoogle } from '../api/products';
import { BRAND_NAME } from '../config/brand';
import usePreferencesStore from '../store/preferencesStore';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const language = usePreferencesStore((state) => state.language);

  const t = {
    title: language === 'ar' ? 'إنشاء حساب' : 'Create Account',
    subtitle: language === 'ar'
      ? `اعمل حساب ${BRAND_NAME} لتحفظ السلّة وتاريخ الطلبات`
      : `Create a ${BRAND_NAME} account to save carts and order history`,
    fullName: language === 'ar' ? 'الاسم الكامل' : 'Full Name',
    nameRequired: language === 'ar' ? 'الاسم مطلوب' : 'Name is required',
    email: language === 'ar' ? 'الإيميل' : 'Email Address',
    emailRequired: language === 'ar' ? 'الإيميل مطلوب' : 'Email is required',
    invalidEmail: language === 'ar' ? 'الإيميل غير صحيح' : 'Invalid email address',
    password: language === 'ar' ? 'كلمة السر' : 'Password',
    passwordRequired: language === 'ar' ? 'كلمة السر مطلوبة' : 'Password is required',
    passwordMin: language === 'ar' ? 'كلمة السر لازم تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters',
    confirmPassword: language === 'ar' ? 'تأكيد كلمة السر' : 'Confirm Password',
    confirmRequired: language === 'ar' ? 'أكد كلمة السر' : 'Please confirm your password',
    mismatch: language === 'ar' ? 'كلمتا السر مش متطابقين' : 'Passwords do not match',
    failed: language === 'ar' ? 'ما قدرنا نعمل الحساب. جرّب مرة تانية.' : 'Failed to create account. Please try again.',
    googleError: language === 'ar' ? 'ما قدرنا نكمل عبر Google.' : 'Unable to continue with Google.',
    creating: language === 'ar' ? 'عم ننشئ الحساب...' : 'Creating Account...',
    create: language === 'ar' ? 'إنشاء حساب' : 'Create Account',
    or: language === 'ar' ? 'أو كمل عبر' : 'Or continue with',
    googleSetup: language === 'ar' ? 'Google بحاجة إعداد' : 'Google setup pending',
    already: language === 'ar' ? 'عندك حساب؟' : 'Already have an account?',
    signIn: language === 'ar' ? 'تسجيل الدخول' : 'Sign in',
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setApiError(null);
      const response = await registerUser(data.name, data.email, data.password);
      login(response.data);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setApiError(err.response?.data?.message || t.failed);
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
      navigate('/');
    } catch (err) {
      console.error('Google registration error:', err);
      setApiError(err.response?.data?.message || t.googleError);
    } finally {
      setLoading(false);
    }
  };

  const password = watch('password');

  return (
    <div className="flex min-h-screen flex-col bg-vintage-100">
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:p-4 sm:py-12">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border border-vintage-200 bg-white shadow-xl sm:rounded-3xl">
            <div className="p-5 sm:p-8 md:p-12">
              <div className="mb-8 text-center sm:mb-10">
                <h1 className="mb-2 text-2xl font-black text-vintage-900 sm:text-3xl">{t.title}</h1>
                <p className="text-vintage-500">{t.subtitle}</p>
              </div>

              {apiError && (
                <div className="animate-in fade-in slide-in-from-top-4 mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <p className="text-sm font-medium">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-vintage-700">{t.fullName}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-vintage-400 rtl:left-auto rtl:right-4" size={20} />
                    <input
                      {...register('name', { required: t.nameRequired })}
                      type="text"
                      placeholder="John Doe"
                      className={`w-full rounded-xl border bg-vintage-50 py-3 pl-12 pr-4 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rtl:pl-4 rtl:pr-12 ${errors.name ? 'border-red-500' : 'border-vintage-200'}`}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-vintage-700">{t.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-vintage-400 rtl:left-auto rtl:right-4" size={20} />
                    <input
                      {...register('email', {
                        required: t.emailRequired,
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t.invalidEmail,
                        },
                      })}
                      type="email"
                      placeholder="name@example.com"
                      className={`w-full rounded-xl border bg-vintage-50 py-3 pl-12 pr-4 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rtl:pl-4 rtl:pr-12 ${errors.email ? 'border-red-500' : 'border-vintage-200'}`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-vintage-700">{t.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-vintage-400 rtl:left-auto rtl:right-4" size={20} />
                    <input
                      {...register('password', {
                        required: t.passwordRequired,
                        minLength: { value: 6, message: t.passwordMin },
                      })}
                      type="password"
                      placeholder="********"
                      className={`w-full rounded-xl border bg-vintage-50 py-3 pl-12 pr-4 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rtl:pl-4 rtl:pr-12 ${errors.password ? 'border-red-500' : 'border-vintage-200'}`}
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-vintage-700">{t.confirmPassword}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-vintage-400 rtl:left-auto rtl:right-4" size={20} />
                    <input
                      {...register('confirmPassword', {
                        required: t.confirmRequired,
                        validate: (value) => value === password || t.mismatch,
                      })}
                      type="password"
                      placeholder="********"
                      className={`w-full rounded-xl border bg-vintage-50 py-3 pl-12 pr-4 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rtl:pl-4 rtl:pr-12 ${errors.confirmPassword ? 'border-red-500' : 'border-vintage-200'}`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="vintage-button mt-4 flex w-full items-center justify-center gap-3 !py-4 shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {t.creating}
                    </>
                  ) : (
                    <>
                      {t.create}
                      <ArrowRight size={20} className="rtl:rotate-180" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-6 sm:my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-vintage-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-vintage-400">{t.or}</span>
                </div>
              </div>

              <GoogleLoginButton label={t.googleSetup} onCredential={handleGoogleCredential} disabled={loading} />
            </div>

            <div className="border-t border-vintage-200 bg-vintage-50 p-5 text-center sm:p-6">
              <p className="text-sm text-vintage-600">
                {t.already} <Link to="/login" className="font-bold text-primary hover:underline">{t.signIn}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

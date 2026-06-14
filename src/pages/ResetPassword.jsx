import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Loader2, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/authStore';
import { resetPassword } from '../api/products';
import usePreferencesStore from '../store/preferencesStore';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const language = usePreferencesStore((state) => state.language);

  const t = {
    title: language === 'ar' ? 'غيّر كلمة السر' : 'Reset password',
    subtitle: language === 'ar' ? 'اختار كلمة سر جديدة لحسابك.' : 'Choose a new password for your account.',
    password: language === 'ar' ? 'كلمة السر الجديدة' : 'New Password',
    passwordRequired: language === 'ar' ? 'كلمة السر مطلوبة' : 'Password is required',
    passwordMin: language === 'ar' ? 'كلمة السر لازم تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters',
    confirm: language === 'ar' ? 'تأكيد كلمة السر' : 'Confirm Password',
    confirmRequired: language === 'ar' ? 'أكد كلمة السر' : 'Please confirm your password',
    mismatch: language === 'ar' ? 'كلمتا السر مش متطابقين' : 'Passwords do not match',
    submit: language === 'ar' ? 'تغيير كلمة السر' : 'Reset password',
    submitting: language === 'ar' ? 'عم نغيّر كلمة السر...' : 'Resetting password...',
    error: language === 'ar' ? 'الرابط غير صالح أو منتهي.' : 'Reset link is invalid or has expired.',
    back: language === 'ar' ? 'رجوع لتسجيل الدخول' : 'Back to sign in',
  };

  const password = watch('password');

  const onSubmit = async ({ password: newPassword }) => {
    try {
      setLoading(true);
      setApiError('');
      const { data } = await resetPassword(token, newPassword);
      login(data);
      navigate('/');
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

              {apiError && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-vintage-700">{t.password}</label>
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
                  <label className="mb-2 block text-sm font-medium text-vintage-700">{t.confirm}</label>
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
                  className="vintage-button flex w-full items-center justify-center gap-3 !py-4 shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {t.submitting}
                    </>
                  ) : (
                    t.submit
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

export default ResetPassword;

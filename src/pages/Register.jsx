import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import { registerUser } from '../api/products';
import { BRAND_NAME } from '../config/brand';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setApiError(null);
      const response = await registerUser(data.name, data.email, data.password);
      login(response.data);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setApiError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const password = watch("password");

  return (
    <div className="min-h-screen bg-vintage-100 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-vintage-200">
            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-serif font-bold text-vintage-900 mb-2">Create Account</h1>
                <p className="text-vintage-500">Create a {BRAND_NAME} account to save carts and order history</p>
              </div>

              {apiError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <p className="text-sm font-medium">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-vintage-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-vintage-400" size={20} />
                    <input 
                      {...register("name", { required: "Name is required" })}
                      type="text" 
                      placeholder="John Doe"
                      className={`w-full pl-12 pr-4 py-3 bg-vintage-50 border ${errors.name ? 'border-red-500' : 'border-vintage-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-vintage-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-vintage-400" size={20} />
                    <input 
                      {...register("email", { 
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                      type="email" 
                      placeholder="name@example.com"
                      className={`w-full pl-12 pr-4 py-3 bg-vintage-50 border ${errors.email ? 'border-red-500' : 'border-vintage-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-vintage-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-vintage-400" size={20} />
                    <input 
                      {...register("password", { 
                        required: "Password is required",
                        minLength: { value: 6, message: "Password must be at least 6 characters" }
                      })}
                      type="password" 
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-4 py-3 bg-vintage-50 border ${errors.password ? 'border-red-500' : 'border-vintage-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-vintage-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-vintage-400" size={20} />
                    <input 
                      {...register("confirmPassword", { 
                        required: "Please confirm your password",
                        validate: value => value === password || "Passwords do not match"
                      })}
                      type="password" 
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-4 py-3 bg-vintage-50 border ${errors.confirmPassword ? 'border-red-500' : 'border-vintage-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full vintage-button !py-4 mt-4 flex items-center justify-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
            
            <div className="bg-vintage-50 p-6 text-center border-t border-vintage-200">
              <p className="text-sm text-vintage-600">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

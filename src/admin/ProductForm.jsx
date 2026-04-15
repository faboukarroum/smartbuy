import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { getProductById, createProduct, updateProduct } from '../api/products';

const categories = ['tools', 'kitchen', 'decor', 'bedding', 'furniture', 'electronics', 'home'];

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      image: '',
      images: [],
      category: 'tools',
      stock: 0,
      isNew: true,
      details: []
    }
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images"
  });

  const { fields: detailFields, append: appendDetail, remove: removeDetail } = useFieldArray({
    control,
    name: "details"
  });

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          setFetching(true);
          const { data } = await getProductById(id);
          // Map array of strings to objects for useFieldArray
          const formattedData = {
            ...data,
            images: data.images?.map(img => ({ url: img })) || [],
            details: data.details?.map(det => ({ text: det })) || []
          };
          reset(data); // reset with raw data for now, handles strings better if API returns strings

          // Manual fix for field arrays if needed
          if (data.images) setValue('images', data.images.map(img => ({ url: img })));
          if (data.details) setValue('details', data.details.map(det => ({ text: det })));
          
          setError(null);
        } catch (err) {
          setError('Failed to fetch product details');
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Transform field arrays back to strings
      const payload = {
        ...data,
        images: data.images.map(img => img.url).filter(url => url.trim() !== ''),
        details: data.details.map(det => det.text).filter(text => text.trim() !== '')
      };

      if (id) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-medium">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/products" 
            className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              {id ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-slate-500 text-sm">Fill in the details below to update your inventory.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">Product saved successfully! Redirecting...</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Info size={18} className="text-primary" />
              General Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
                <input 
                  {...register('name', { required: 'Name is required' })}
                  className={`w-full px-4 py-3 bg-slate-50 border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                  placeholder="e.g., Vintage Brass Mirror"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea 
                  {...register('description', { required: 'Description is required' })}
                  rows={5}
                  className={`w-full px-4 py-3 bg-slate-50 border ${errors.description ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none`}
                  placeholder="Describe the product history, condition, and features..."
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* Product Details / Features */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Plus size={18} className="text-primary" />
                Technical Details
              </h3>
              <button 
                type="button"
                onClick={() => appendDetail({ text: '' })}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Detail
              </button>
            </div>
            
            <div className="space-y-3">
              {detailFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input 
                    {...register(`details.${index}.text`)}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                    placeholder="e.g., Material: Solid Brass"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeDetail(index)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {detailFields.length === 0 && (
                <p className="text-sm text-slate-400 italic">No technical details added yet.</p>
              )}
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon size={18} className="text-primary" />
                Product Images
              </h3>
              <button 
                type="button"
                onClick={() => appendImage({ url: '' })}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Image URL
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Main Image (Cover)</label>
                <input 
                  {...register('image', { required: 'Main image is required' })}
                  className={`w-full px-4 py-3 bg-slate-50 border ${errors.image ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">Gallery Images</label>
                {imageFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input 
                      {...register(`images.${index}.url`)}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                      placeholder="Additional image URL..."
                    />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Settings */}
        <div className="space-y-6 text-slate-900">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900">Pricing & Stock</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Price ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  {...register('price', { required: 'Price is required', min: 0 })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Stock Quantity</label>
                <input 
                  type="number"
                  {...register('stock', { required: 'Stock is required', min: 0 })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900">Organization</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <select 
                  {...register('category')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all capitalize"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input 
                  type="checkbox" 
                  id="isNew"
                  {...register('isNew')}
                  className="w-5 h-5 rounded text-primary focus:ring-primary border-slate-300"
                />
                <label htmlFor="isNew" className="text-sm font-bold text-slate-700 cursor-pointer">
                  Mark as "New Arrival"
                </label>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full vintage-button !py-4 flex items-center justify-center gap-3 shadow-xl shadow-primary/30"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {id ? 'Update Product' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

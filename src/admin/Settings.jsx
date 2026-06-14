import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';
import { getSettings, updateSettings } from '../api/products';
import usePreferencesStore from '../store/preferencesStore';
import { formatCurrency } from '../utils/pricing';

const Settings = () => {
  const [rate, setRate] = useState('89500');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const setUsdToLbpRate = usePreferencesStore((state) => state.setUsdToLbpRate);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data } = await getSettings();
        const nextRate = Number(data?.usdToLbpRate);

        if (!Number.isFinite(nextRate) || nextRate <= 0) {
          throw new Error('Invalid settings response');
        }

        setRate(String(nextRate));
        setUsdToLbpRate(nextRate);
        setError('');
      } catch {
        setRate('89500');
        setUsdToLbpRate(89500);
        setError('Settings could not be loaded. The default rate is being shown.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [setUsdToLbpRate]);

  const numericRate = Number(rate);
  const previewUsd = 10;
  const previewLbp = Number.isFinite(numericRate) && numericRate > 0 ? previewUsd * numericRate : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!Number.isFinite(numericRate) || numericRate <= 0) {
      setError('USD to LBP rate must be greater than 0.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setNotice('');
      const { data } = await updateSettings({ usdToLbpRate: numericRate });
      const savedRate = Number(data?.usdToLbpRate);

      setRate(String(savedRate));
      setUsdToLbpRate(savedRate);
      setNotice('Currency rate saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save currency rate.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage storefront display settings.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">Currency Display Rate</h2>
          <p className="mt-1 text-sm text-slate-500">
            Used only for client-side LBP display when a product does not have its own LBP price.
          </p>
        </div>

        {notice && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={18} />
            {notice}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 py-8 text-slate-400">
            <Loader2 className="animate-spin" size={24} />
            <span className="font-medium">Loading settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">USD to LBP Rate</label>
              <div className="flex max-w-md overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={rate}
                  onChange={(event) => {
                    setRate(event.target.value);
                    setNotice('');
                  }}
                  className="w-full bg-transparent px-4 py-3 font-bold text-slate-900 outline-none"
                />
                <span className="flex items-center border-l border-slate-200 px-4 text-sm font-bold text-slate-500">
                  LBP / USD
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                Default rate is 89,500 LBP to 1 USD.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-bold text-slate-900">$10 preview:</span>{' '}
              {formatCurrency(previewLbp, 'LBP')}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Settings
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default Settings;

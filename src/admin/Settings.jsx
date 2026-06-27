import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, Loader2, Save, Sparkles } from 'lucide-react';
import { getAdminSettings, testAiSettings, updateAdminSettings } from '../api/products';
import usePreferencesStore from '../store/preferencesStore';
import { formatCurrency } from '../utils/pricing';

const Settings = () => {
  const [rate, setRate] = useState('89500');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingAi, setTestingAi] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [ai, setAi] = useState({
    enabled: false,
    provider: 'openai',
    model: 'gpt-4.1-mini',
    searchMode: 'quick',
    defaultMarket: 'Lebanon',
    languages: 'both',
    preferredDomains: '',
    blockedDomains: '',
    maxResultsPerProduct: 8,
    saveSourceLinks: true,
    apiKey: '',
    clearApiKey: false,
    apiKeyConfigured: false,
    apiKeyLast4: '',
  });
  const setUsdToLbpRate = usePreferencesStore((state) => state.setUsdToLbpRate);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data } = await getAdminSettings();
        const nextRate = Number(data?.usdToLbpRate);

        if (!Number.isFinite(nextRate) || nextRate <= 0) {
          throw new Error('Invalid settings response');
        }

        setRate(String(nextRate));
        setUsdToLbpRate(nextRate);
        setAi({
          enabled: Boolean(data.ai?.enabled),
          provider: data.ai?.provider || 'openai',
          model: data.ai?.model || 'gpt-4.1-mini',
          searchMode: data.ai?.searchMode || 'quick',
          defaultMarket: data.ai?.defaultMarket || 'Lebanon',
          languages: data.ai?.languages || 'both',
          preferredDomains: (data.ai?.preferredDomains || []).join('\n'),
          blockedDomains: (data.ai?.blockedDomains || []).join('\n'),
          maxResultsPerProduct: data.ai?.maxResultsPerProduct || 8,
          saveSourceLinks: data.ai?.saveSourceLinks !== false,
          apiKey: '',
          clearApiKey: false,
          apiKeyConfigured: Boolean(data.ai?.apiKeyConfigured),
          apiKeyLast4: data.ai?.apiKeyLast4 || '',
        });
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
      const { data } = await updateAdminSettings({
        usdToLbpRate: numericRate,
        ai: {
          enabled: ai.enabled,
          provider: 'openai',
          model: ai.model,
          searchMode: ai.searchMode,
          defaultMarket: ai.defaultMarket,
          languages: ai.languages,
          preferredDomains: ai.preferredDomains,
          blockedDomains: ai.blockedDomains,
          maxResultsPerProduct: Number(ai.maxResultsPerProduct),
          saveSourceLinks: ai.saveSourceLinks,
          apiKey: ai.apiKey.trim(),
          clearApiKey: ai.clearApiKey,
        },
      });
      const savedRate = Number(data?.usdToLbpRate);

      setRate(String(savedRate));
      setUsdToLbpRate(savedRate);
      setAi((prev) => ({
        ...prev,
        apiKey: '',
        clearApiKey: false,
        apiKeyConfigured: Boolean(data.ai?.apiKeyConfigured),
        apiKeyLast4: data.ai?.apiKeyLast4 || '',
      }));
      setNotice('Settings saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const updateAi = (patch) => {
    setAi((prev) => ({ ...prev, ...patch }));
    setNotice('');
  };

  const handleTestAi = async () => {
    try {
      setTestingAi(true);
      setError('');
      setNotice('');
      await testAiSettings();
      setNotice('AI connection test succeeded.');
    } catch (err) {
      setError(err.response?.data?.message || 'AI connection test failed.');
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage storefront display and admin integration settings.</p>
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

            <div className="border-t border-slate-100 pt-6">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Sparkles size={20} className="text-primary" />
                    AI Integration
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Used for manual Lebanese market price research on scanned products.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestAi}
                  disabled={testingAi || !ai.enabled || !ai.apiKeyConfigured}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {testingAi ? <Loader2 className="animate-spin" size={18} /> : <KeyRound size={18} />}
                  Test AI Connection
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    id="ai-enabled"
                    type="checkbox"
                    checked={ai.enabled}
                    onChange={(event) => updateAi({ enabled: event.target.checked })}
                    className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="ai-enabled" className="text-sm font-bold text-slate-700">
                    Enable AI market research
                  </label>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Provider</label>
                  <input
                    value="OpenAI"
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Research Model</label>
                  <input
                    value={ai.model}
                    onChange={(event) => updateAi({ model: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Search Mode</label>
                  <select
                    value={ai.searchMode}
                    onChange={(event) => updateAi({ searchMode: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-primary"
                  >
                    <option value="quick">Quick</option>
                    <option value="deep">Deep</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Default Market</label>
                  <input
                    value={ai.defaultMarket}
                    onChange={(event) => updateAi({ defaultMarket: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Search Languages</label>
                  <select
                    value={ai.languages}
                    onChange={(event) => updateAi({ languages: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-primary"
                  >
                    <option value="both">English and Arabic</option>
                    <option value="english">English only</option>
                    <option value="arabic">Arabic only</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Max Results Per Product</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={ai.maxResultsPerProduct}
                    onChange={(event) => updateAi({ maxResultsPerProduct: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    id="save-sources"
                    type="checkbox"
                    checked={ai.saveSourceLinks}
                    onChange={(event) => updateAi({ saveSourceLinks: event.target.checked })}
                    className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="save-sources" className="text-sm font-bold text-slate-700">
                    Save source links
                  </label>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Preferred Domains</label>
                  <textarea
                    value={ai.preferredDomains}
                    onChange={(event) => updateAi({ preferredDomains: event.target.value })}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                    placeholder="One domain per line"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Blocked Domains</label>
                  <textarea
                    value={ai.blockedDomains}
                    onChange={(event) => updateAi({ blockedDomains: event.target.value })}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                    placeholder="One domain per line"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <label className="block text-sm font-bold text-slate-700">OpenAI API Key</label>
                    {ai.apiKeyConfigured ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        Configured ending in {ai.apiKeyLast4}
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                        Missing
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    value={ai.apiKey}
                    onChange={(event) => updateAi({ apiKey: event.target.value, clearApiKey: false })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
                    placeholder={ai.apiKeyConfigured ? 'Paste a new key to replace the stored key' : 'Paste OpenAI API key'}
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      id="clear-ai-key"
                      type="checkbox"
                      checked={ai.clearApiKey}
                      onChange={(event) => updateAi({ clearApiKey: event.target.checked, apiKey: event.target.checked ? '' : ai.apiKey })}
                      className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="clear-ai-key" className="text-sm font-bold text-slate-700">
                      Clear saved API key on save
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    The full key is encrypted on the backend and is never returned to the browser.
                  </p>
                </div>
              </div>
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

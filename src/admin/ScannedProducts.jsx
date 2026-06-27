import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ClipboardList, Eye, Loader2, Search, Sparkles, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getScannedProducts, rejectScannedProduct, researchScannedProductPrices } from '../api/products';

const getBestName = (product) => product.nameCandidates?.[0]?.value || 'Unnamed scanned product';

const statusStyles = {
  scanned: 'bg-blue-50 text-blue-700',
  researched: 'bg-emerald-50 text-emerald-700',
  imported: 'bg-primary/10 text-primary',
  rejected: 'bg-red-50 text-red-700',
};

const ScannedProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, error: '', products: [], count: 0 });
  const [busyId, setBusyId] = useState('');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');

  const fetchScannedProducts = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: '' }));
      const { data } = await getScannedProducts({
        keyword,
        status,
        pageSize: 50,
      });
      setState({ loading: false, error: '', products: data.scannedProducts || [], count: data.count || 0 });
    } catch (err) {
      setState({
        loading: false,
        error: err.response?.data?.message || 'Failed to load scanned products.',
        products: [],
        count: 0,
      });
    }
  }, [keyword, status]);

  useEffect(() => {
    fetchScannedProducts();
  }, [fetchScannedProducts]);

  const updateFilters = (nextKeyword, nextStatus) => {
    const params = new URLSearchParams();
    if (nextKeyword.trim()) params.set('keyword', nextKeyword.trim());
    if (nextStatus !== 'all') params.set('status', nextStatus);
    setSearchParams(params, { replace: true });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    updateFilters(keyword, status);
    fetchScannedProducts();
  };

  const handleResearch = async (id) => {
    try {
      setBusyId(id);
      await researchScannedProductPrices(id);
      await fetchScannedProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'AI research failed.');
    } finally {
      setBusyId('');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this scanned product? It will stay archived and will not affect live products.')) {
      return;
    }

    try {
      setBusyId(id);
      await rejectScannedProduct(id);
      await fetchScannedProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject scanned product.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Scanned Products</h1>
          <p className="text-sm text-slate-500">Staging records from barcode scans, separate from website products.</p>
        </div>
        <Link to="/admin/product-scanner" className="vintage-button !py-3 inline-flex items-center justify-center gap-2">
          <ClipboardList size={18} />
          New Scan
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Search barcode, name, or brand..."
              />
            </div>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                updateFilters(keyword, event.target.value);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary"
            >
              <option value="all">All statuses</option>
              <option value="scanned">Scanned</option>
              <option value="researched">Researched</option>
              <option value="imported">Imported</option>
              <option value="rejected">Rejected</option>
            </select>
            <button type="submit" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
              Search
            </button>
          </form>
        </div>

        {state.loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
            <Loader2 className="animate-spin" size={28} />
            <span className="font-medium">Loading scanned products...</span>
          </div>
        ) : state.error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <AlertCircle size={36} className="mb-3" />
            <p className="font-medium">{state.error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-6 py-4">Scanned Product</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Prices</th>
                  <th className="px-6 py-4">Imported Product</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.products.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{getBestName(product)}</p>
                      <p className="mt-1 font-mono text-xs text-slate-400">{product.barcode}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[product.scanStatus] || 'bg-slate-100 text-slate-600'}`}>
                        {product.scanStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                      {product.marketPriceResults?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.importedProductId ? (
                        <Link to={`/admin/products/${product.importedProductId._id}/edit`} className="font-bold text-primary hover:underline">
                          {product.importedProductId.name}
                        </Link>
                      ) : (
                        <span className="text-slate-400">Not imported</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/scanned-products/${product._id}`} className="rounded-lg p-2 text-slate-400 hover:bg-primary/10 hover:text-primary" title="Review">
                          <Eye size={18} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleResearch(product._id)}
                          disabled={busyId === product._id || product.scanStatus === 'rejected'}
                          className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Research prices"
                        >
                          {busyId === product._id ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(product._id)}
                          disabled={busyId === product._id || product.scanStatus === 'imported'}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {state.products.length === 0 && (
              <div className="py-16 text-center text-sm font-medium text-slate-400">No scanned products found.</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ScannedProducts;

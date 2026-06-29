import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  PackagePlus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getProducts,
  getScannedProductById,
  importScannedProduct,
  rejectScannedProduct,
  researchScannedProductPrices,
  updateScannedProduct,
  verifyScannedProductDetails,
} from '../api/products';
import { formatCurrency } from '../utils/pricing';

const categories = ['tools', 'kitchen', 'decor', 'bedding', 'furniture', 'electronics', 'home'];

const statusStyles = {
  scanned: 'bg-blue-50 text-blue-700',
  researched: 'bg-emerald-50 text-emerald-700',
  imported: 'bg-primary/10 text-primary',
  rejected: 'bg-red-50 text-red-700',
};

const candidatesToText = (items = [], key = 'value') => items.map((item) => item[key]).filter(Boolean).join('\n');
const textToCandidates = (value) => String(value || '').split('\n').map((item) => ({ value: item.trim(), source: 'manual' })).filter((item) => item.value);
const textToImages = (value) => String(value || '').split('\n').map((item) => ({ url: item.trim(), source: 'manual' })).filter((item) => item.url);
const bestValue = (items = [], key = 'value') => items.find((item) => item[key])?.[key] || '';
const textLines = (value) => String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
const firstTextLine = (value) => textLines(value)[0] || '';

const listPreview = (items = [], emptyText = 'Empty') => {
  const lines = Array.isArray(items) ? items.filter(Boolean) : textLines(items);

  if (lines.length === 0) {
    return emptyText;
  }

  if (lines.length === 1) {
    return lines[0];
  }

  return `${lines[0]} + ${lines.length - 1} more`;
};

const FieldToggle = ({ checked, label, preview, onChange }) => (
  <label className="flex min-h-[84px] gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 text-primary focus:ring-primary"
    />
    <span className="min-w-0">
      <span className="block text-sm font-bold text-slate-900">{label}</span>
      <span className="mt-1 block break-words text-xs leading-5 text-slate-500">{preview || 'Empty'}</span>
    </span>
  </label>
);

const ScannedProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifyingDetails, setVerifyingDetails] = useState(false);
  const [researching, setResearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imagePreviewIndex, setImagePreviewIndex] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [form, setForm] = useState({
    nameCandidates: '',
    descriptionCandidates: '',
    detailsCandidates: '',
    imageCandidates: '',
    brand: '',
    manufacturer: '',
    category: '',
    notes: '',
  });
  const [importMode, setImportMode] = useState('create');
  const [productSearch, setProductSearch] = useState('');
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [fields, setFields] = useState({
    name: true,
    description: true,
    details: true,
    image: true,
    images: true,
    category: true,
    price: true,
    priceLbp: true,
    stock: true,
    metadata: true,
  });
  const [values, setValues] = useState({
    name: '',
    description: '',
    details: '',
    image: '',
    images: '',
    category: 'home',
    price: '',
    priceLbp: '',
    stock: '0',
    barcode: '',
    brand: '',
    manufacturer: '',
  });

  const hydrateState = useCallback((product) => {
    const name = bestValue(product.nameCandidates);
    const description = bestValue(product.descriptionCandidates);
    const details = candidatesToText(product.detailsCandidates);
    const image = bestValue(product.imageCandidates, 'url');
    const images = candidatesToText(product.imageCandidates, 'url');
    const firstPrice = product.marketPriceResults?.[0];

    setScannedProduct(product);
    setForm({
      nameCandidates: candidatesToText(product.nameCandidates),
      descriptionCandidates: candidatesToText(product.descriptionCandidates),
      detailsCandidates: details,
      imageCandidates: images,
      brand: product.brand || '',
      manufacturer: product.manufacturer || '',
      category: product.category || 'home',
      notes: product.notes || '',
    });
    setValues({
      name,
      description,
      details,
      image,
      images,
      category: product.category || 'home',
      price: firstPrice?.currency === 'USD' ? String(firstPrice.price) : '',
      priceLbp: firstPrice?.priceLbp ? String(firstPrice.priceLbp) : firstPrice?.currency === 'LBP' ? String(firstPrice.price) : '',
      stock: '0',
      barcode: product.barcode || '',
      brand: product.brand || '',
      manufacturer: product.manufacturer || '',
    });
  }, []);

  const fetchScannedProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getScannedProductById(id);
      hydrateState(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load scanned product.');
    } finally {
      setLoading(false);
    }
  }, [hydrateState, id]);

  useEffect(() => {
    fetchScannedProduct();
  }, [fetchScannedProduct]);

  const selectedExistingProduct = useMemo(
    () => productOptions.find((product) => product._id === selectedProductId),
    [productOptions, selectedProductId]
  );
  const imagePreviewUrls = useMemo(
    () => textLines(form.imageCandidates),
    [form.imageCandidates]
  );

  const importPreviewValues = useMemo(() => {
    const imageUrls = textLines(form.imageCandidates);

    return {
      name: firstTextLine(form.nameCandidates),
      description: firstTextLine(form.descriptionCandidates),
      details: textLines(form.detailsCandidates),
      image: imageUrls[0] || '',
      images: imageUrls,
      category: form.category || 'home',
      price: values.price,
      priceLbp: values.priceLbp,
      stock: values.stock,
      barcode: scannedProduct?.barcode || '',
      brand: form.brand,
      manufacturer: form.manufacturer,
    };
  }, [form, scannedProduct?.barcode, values.price, values.priceLbp, values.stock]);

  const importFieldGroups = useMemo(() => [
    {
      title: 'Product basics',
      fields: [
        ['name', 'Product name', importPreviewValues.name],
        ['description', 'Description', importPreviewValues.description],
        ['category', 'Category', importPreviewValues.category],
        ['metadata', 'Barcode / Brand / Manufacturer', listPreview([importPreviewValues.barcode, importPreviewValues.brand, importPreviewValues.manufacturer])],
      ],
    },
    {
      title: 'Media and specs',
      fields: [
        ['image', 'Main image', importPreviewValues.image],
        ['images', 'Gallery images', `${importPreviewValues.images.length} image${importPreviewValues.images.length === 1 ? '' : 's'}`],
        ['details', 'Details / specs', listPreview(importPreviewValues.details)],
      ],
    },
    {
      title: 'Selling fields',
      fields: [
        ['price', 'USD price', importPreviewValues.price || 'Empty'],
        ['priceLbp', 'LBP display price', importPreviewValues.priceLbp || 'Empty'],
        ['stock', 'Stock quantity', importPreviewValues.stock || '0'],
      ],
    },
  ], [importPreviewValues]);

  useEffect(() => {
    if (imagePreviewIndex > Math.max(0, imagePreviewUrls.length - 1)) {
      setImagePreviewIndex(0);
    }
  }, [imagePreviewIndex, imagePreviewUrls.length]);

  const handlePreviousImage = () => {
    setImagePreviewIndex((prev) => (prev === 0 ? imagePreviewUrls.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setImagePreviewIndex((prev) => (prev + 1) % imagePreviewUrls.length);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setNotice('');
      const payload = {
        nameCandidates: textToCandidates(form.nameCandidates),
        descriptionCandidates: textToCandidates(form.descriptionCandidates),
        detailsCandidates: textToCandidates(form.detailsCandidates),
        imageCandidates: textToImages(form.imageCandidates),
        brand: form.brand,
        manufacturer: form.manufacturer,
        category: form.category,
        notes: form.notes,
      };
      const { data } = await updateScannedProduct(id, payload);
      hydrateState(data);
      setNotice('Scanned product saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save scanned product.');
    } finally {
      setSaving(false);
    }
  };

  const handleResearch = async () => {
    try {
      setResearching(true);
      setError('');
      setNotice('');
      const { data } = await researchScannedProductPrices(id);
      hydrateState(data);
      setNotice('AI Lebanese market research saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'AI research failed.');
    } finally {
      setResearching(false);
    }
  };

  const handleVerifyDetails = async () => {
    try {
      setVerifyingDetails(true);
      setError('');
      setNotice('');
      const { data } = await verifyScannedProductDetails(id);
      hydrateState(data);
      setNotice('Official supplier details and image candidates were verified.');
    } catch (err) {
      setError(err.response?.data?.message || 'Official supplier verification failed.');
    } finally {
      setVerifyingDetails(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Reject this scanned product? It will not affect live website products.')) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      const { data } = await rejectScannedProduct(id, { notes: form.notes });
      hydrateState(data);
      setNotice('Scanned product rejected.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject scanned product.');
    } finally {
      setSaving(false);
    }
  };

  const handleProductSearch = async (event) => {
    event.preventDefault();

    try {
      const { data } = await getProducts({ keyword: productSearch, pageSize: 10 });
      setProductOptions(data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search products.');
    }
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      setError('');
      setNotice('');
      const importValues = {
        ...importPreviewValues,
        price: values.price,
        priceLbp: values.priceLbp,
        stock: values.stock,
      };

      const { data } = await importScannedProduct(id, {
        mode: importMode,
        productId: importMode === 'update' ? selectedProductId : undefined,
        fields,
        values: importValues,
      });

      hydrateState(data.scannedProduct);
      setNotice(importMode === 'update' ? 'Existing product updated from selected fields.' : 'New website product created from selected fields.');
      navigate(`/admin/products/${data.product._id}/edit`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import scanned product.');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-slate-400">
        <Loader2 className="animate-spin" size={28} />
        <span className="font-medium">Loading scanned product...</span>
      </div>
    );
  }

  if (!scannedProduct) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600">
        {error || 'Scanned product not found.'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/scanned-products" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-primary">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[scannedProduct.scanStatus] || 'bg-slate-100 text-slate-600'}`}>
                {scannedProduct.scanStatus}
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Staging only, not live</span>
            </div>
            <h1 className="break-words text-2xl font-serif font-bold text-slate-900">{importPreviewValues.name || 'Scanned Product'}</h1>
            <p className="font-mono text-sm text-slate-500">{scannedProduct.barcode}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Staging Data
          </button>
          <button onClick={handleVerifyDetails} disabled={verifyingDetails || scannedProduct.scanStatus === 'rejected'} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60">
            {verifyingDetails ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
            Verify Official Details
          </button>
          <button onClick={handleResearch} disabled={researching || scannedProduct.scanStatus === 'rejected'} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60">
            {researching ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            Research Lebanese Prices
          </button>
          <button onClick={handleReject} disabled={saving || scannedProduct.scanStatus === 'imported'} className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-60">
            <XCircle size={18} />
            Reject
          </button>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Editable Staging Data</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Name Candidates</label>
              <textarea value={form.nameCandidates} onChange={(event) => setForm({ ...form, nameCandidates: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Description Candidates</label>
              <textarea value={form.descriptionCandidates} onChange={(event) => setForm({ ...form, descriptionCandidates: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Specs / Details</label>
              <textarea value={form.detailsCandidates} onChange={(event) => setForm({ ...form, detailsCandidates: event.target.value })} rows={5} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Image URLs</label>
              <textarea value={form.imageCandidates} onChange={(event) => setForm({ ...form, imageCandidates: event.target.value })} rows={5} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary" />
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {imagePreviewUrls.length > 0 ? (
                  <div>
                    <div className="relative aspect-[4/3] bg-white">
                      <img
                        src={imagePreviewUrls[imagePreviewIndex]}
                        alt={`Scanned product preview ${imagePreviewIndex + 1}`}
                        className="h-full w-full object-contain"
                      />
                      {imagePreviewUrls.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={handlePreviousImage}
                            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
                            aria-label="Previous image"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextImage}
                            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
                            aria-label="Next image"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </>
                      )}
                    </div>
                    {imagePreviewUrls.length > 1 && (
                      <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
                        <span className="text-xs font-bold text-slate-500">
                          Image {imagePreviewIndex + 1} of {imagePreviewUrls.length}
                        </span>
                        <div className="flex gap-1">
                          {imagePreviewUrls.map((url, index) => (
                            <button
                              key={`${url}-${index}`}
                              type="button"
                              onClick={() => setImagePreviewIndex(index)}
                              className={`h-2.5 w-2.5 rounded-full ${index === imagePreviewIndex ? 'bg-primary' : 'bg-slate-300'}`}
                              aria-label={`Show image ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 text-slate-400">
                    <ImageIcon size={30} />
                    <p className="text-sm font-medium">Image preview will appear here.</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Brand</label>
              <input value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Manufacturer</label>
              <input value={form.manufacturer} onChange={(event) => setForm({ ...form, manufacturer: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Category</label>
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-primary">
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Admin Notes</label>
              <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Verification Sources</h2>
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-bold text-slate-900">Product Detail Sources</p>
            <div className="space-y-2">
              {(scannedProduct.supplierSources || []).map((source, index) => (
                <a
                  key={`${source.url}-${index}`}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary"
                >
                  <span>
                    {source.name || 'Product source'}
                    {source.notes ? <span className="ml-2 text-xs font-medium text-slate-400">{source.notes}</span> : null}
                  </span>
                  <ExternalLink size={15} className="text-slate-400" />
                </a>
              ))}
              {(!scannedProduct.supplierSources || scannedProduct.supplierSources.length === 0) && (
                <p className="text-sm font-medium text-slate-500">No product detail source found yet.</p>
              )}
            </div>
          </div>
          {scannedProduct.officialVerificationSummary && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="mb-2 flex items-center gap-2 font-bold">
                <ShieldCheck size={17} />
                Official Details Verified
              </div>
              <p>{scannedProduct.officialVerificationSummary}</p>
              {scannedProduct.officialVerifiedAt && (
                <p className="mt-2 text-xs font-semibold text-emerald-700">
                  {new Date(scannedProduct.officialVerifiedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
          <h2 className="mb-5 text-lg font-bold text-slate-900">AI Market Prices</h2>
          {scannedProduct.aiResearchSummary && <p className="mb-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{scannedProduct.aiResearchSummary}</p>}
          <div className="space-y-3">
            {(scannedProduct.marketPriceResults || []).map((price, index) => (
              <a key={`${price.url}-${index}`} href={price.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-slate-200 p-4 hover:border-primary/40 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{price.sellerName || 'Unknown seller'}</p>
                    <p className="mt-1 text-xs text-slate-500">{price.listingTitle}</p>
                  </div>
                  <ExternalLink size={16} className="text-slate-400" />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900">{price.currency} {Number(price.price || 0).toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-400">{Math.round((price.matchConfidence || 0) * 100)}% match</span>
                </div>
                {price.priceLbp ? <p className="mt-1 text-xs font-semibold text-slate-500">{formatCurrency(price.priceLbp, 'LBP')}</p> : null}
              </a>
            ))}
            {(!scannedProduct.marketPriceResults || scannedProduct.marketPriceResults.length === 0) && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-500">No AI price research has been saved yet.</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add To Website Products</h2>
            <p className="text-sm text-slate-500">Choose exactly what gets copied into the live catalog.</p>
          </div>
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {['create', 'update'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setImportMode(mode)}
                className={`rounded-lg px-4 py-2 text-sm font-bold capitalize ${importMode === mode ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {importMode === 'update' && (
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <form onSubmit={handleProductSearch} className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-primary" placeholder="Search existing products..." />
              </div>
              <button type="submit" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">Search</button>
            </form>
            <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-primary">
              <option value="">Select product to update</option>
              {productOptions.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
            </select>
          </div>
        )}

        {selectedExistingProduct && importMode === 'update' && (
          <div className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            Updating <span className="font-bold">{selectedExistingProduct.name}</span>. Only checked fields below will change.
          </div>
        )}

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">USD Price</label>
            <input type="number" value={values.price} onChange={(event) => setValues({ ...values, price: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">LBP Price</label>
            <input type="number" value={values.priceLbp} onChange={(event) => setValues({ ...values, priceLbp: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Stock</label>
            <input type="number" value={values.stock} onChange={(event) => setValues({ ...values, stock: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <div className="space-y-4">
          {importFieldGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">{group.title}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {group.fields.map(([field, label, preview]) => (
                  <FieldToggle
                    key={field}
                    checked={Boolean(fields[field])}
                    label={label}
                    preview={preview}
                    onChange={(event) => setFields({ ...fields, [field]: event.target.checked })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleImport}
          disabled={importing || scannedProduct.scanStatus === 'rejected'}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {importing ? <Loader2 className="animate-spin" size={18} /> : <PackagePlus size={18} />}
          {importMode === 'update' ? 'Update Selected Product Fields' : 'Create Website Product'}
        </button>
      </section>
    </div>
  );
};

export default ScannedProductDetail;

import React, { useRef, useState } from 'react';
import { AlertCircle, Camera, Keyboard, Loader2, ScanBarcode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { scanProductBarcode } from '../api/products';

const ProductScanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const stopScanner = () => {
    controlsRef.current?.stop?.();
    controlsRef.current = null;
    setScanning(false);
  };

  const saveScan = async (barcode) => {
    const cleanBarcode = String(barcode || '').replace(/\D/g, '');

    if (!cleanBarcode) {
      setError('Enter or scan a valid barcode.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const { data } = await scanProductBarcode({ barcode: cleanBarcode });
      navigate(`/admin/scanned-products/${data.scannedProduct._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save scanned product.');
    } finally {
      setSaving(false);
    }
  };

  const startScanner = async () => {
    try {
      setError('');

      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        setError('Camera scanning requires HTTPS. Use the deployed admin site or enter the barcode manually.');
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setError('This browser does not support camera scanning. Enter the barcode manually.');
        return;
      }

      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      setScanning(true);

      controlsRef.current = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (result) {
          stopScanner();
          saveScan(result.getText());
        }
      });
    } catch (err) {
      setScanning(false);
      setError(err?.message || 'Camera permission was denied or scanning could not start.');
    }
  };

  const handleManualSubmit = (event) => {
    event.preventDefault();
    saveScan(manualBarcode);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Product Scanner</h1>
        <p className="text-sm text-slate-500">Scan a barcode from the web admin and save it as a staging record.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Camera Scan</h2>
              <p className="text-sm text-slate-500">Use a phone camera from the admin web panel.</p>
            </div>
            <ScanBarcode className="text-primary" size={28} />
          </div>

          <div className="aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startScanner}
              disabled={scanning || saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {scanning ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
              {scanning ? 'Scanning...' : 'Start Camera'}
            </button>
            <button
              type="button"
              onClick={stopScanner}
              disabled={!scanning}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Stop
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Keyboard size={20} className="text-primary" />
              Manual Barcode
            </h2>
            <p className="mt-1 text-sm text-slate-500">Fallback for desktop browsers or unreadable labels.</p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Barcode / GTIN / UPC</label>
              <input
                value={manualBarcode}
                onChange={(event) => setManualBarcode(event.target.value)}
                inputMode="numeric"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 6290000000000"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <ScanBarcode size={18} />}
              Save Scan
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProductScanner;

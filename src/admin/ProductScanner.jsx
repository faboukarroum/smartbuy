import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, Flashlight, Keyboard, Loader2, ScanBarcode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { scanProductBarcode } from '../api/products';

const CAMERA_CONSTRAINTS = {
  audio: false,
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
};

const SCAN_HELP_TIMEOUT = 10000;

const getFriendlyCameraError = (err) => {
  if (err?.name === 'NotAllowedError') {
    return 'Camera permission was blocked. Allow camera access for this site and try again.';
  }

  if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') {
    return 'No rear camera was found. Enter the barcode manually or try another device.';
  }

  if (err?.name === 'NotReadableError') {
    return 'The camera is already in use by another app or browser tab.';
  }

  return err?.message || 'Camera permission was denied or scanning could not start.';
};

const ProductScanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const scannedRef = useRef(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const clearScanTimeout = useCallback(() => {
    if (scanTimeoutRef.current) {
      window.clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
  }, []);

  const stopScanner = useCallback(() => {
    clearScanTimeout();
    controlsRef.current?.stop?.();
    controlsRef.current = null;
    setTorchSupported(false);
    setTorchOn(false);
    setScanStatus('');
    setScanning(false);
  }, [clearScanTimeout]);

  useEffect(() => stopScanner, [stopScanner]);

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

  const handleScanResult = (barcode) => {
    if (scannedRef.current) {
      return;
    }

    scannedRef.current = true;
    stopScanner();
    saveScan(barcode);
  };

  const startScanner = async () => {
    try {
      if (scanning || saving) {
        return;
      }

      setError('');
      setScanStatus('Starting rear camera...');
      scannedRef.current = false;

      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        setScanStatus('');
        setError('Camera scanning requires HTTPS. Use the deployed admin site or enter the barcode manually.');
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setScanStatus('');
        setError('This browser does not support camera scanning. Enter the barcode manually.');
        return;
      }

      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const { BarcodeFormat, DecodeHintType } = await import('@zxing/library');
      const hints = new Map();
      hints.set(DecodeHintType.TRY_HARDER, true);
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93,
        BarcodeFormat.ITF,
        BarcodeFormat.CODABAR,
      ]);

      const reader = new BrowserMultiFormatReader(hints, {
        delayBetweenScanAttempts: 80,
        delayBetweenScanSuccess: 300,
        tryPlayVideoTimeout: 10000,
      });
      setScanning(true);
      setScanStatus('Point the rear camera at the barcode and keep the full code inside the frame.');

      controlsRef.current = await reader.decodeFromConstraints(CAMERA_CONSTRAINTS, videoRef.current, (result) => {
        if (result) {
          handleScanResult(result.getText());
        }
      });

      setTorchSupported(Boolean(controlsRef.current?.switchTorch));
      scanTimeoutRef.current = window.setTimeout(() => {
        setScanStatus('Still scanning. Move closer, keep the barcode horizontal, or turn on the flashlight.');
      }, SCAN_HELP_TIMEOUT);
    } catch (err) {
      clearScanTimeout();
      controlsRef.current?.stop?.();
      controlsRef.current = null;
      setScanning(false);
      setScanStatus('');
      setTorchSupported(false);
      setTorchOn(false);
      setError(getFriendlyCameraError(err));
    }
  };

  const toggleTorch = async () => {
    if (!controlsRef.current?.switchTorch) {
      return;
    }

    try {
      const nextTorchState = !torchOn;
      await controlsRef.current.switchTorch(nextTorchState);
      setTorchOn(nextTorchState);
    } catch {
      setError('This browser could not control the camera flashlight.');
      setTorchSupported(false);
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

          <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            {scanning && (
              <div className="pointer-events-none absolute inset-x-[12%] top-1/2 h-24 -translate-y-1/2 rounded-xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(2,6,23,0.28)]" />
            )}
          </div>

          {scanStatus && <p className="mt-3 text-sm font-medium text-slate-600">{scanStatus}</p>}

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
            {torchSupported && (
              <button
                type="button"
                onClick={toggleTorch}
                disabled={!scanning}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Flashlight size={18} />
                {torchOn ? 'Flashlight On' : 'Flashlight'}
              </button>
            )}
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

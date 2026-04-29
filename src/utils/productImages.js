const PLACEHOLDER_PATTERNS = [
  'via.placeholder.com',
  'placehold.co',
  'placeholder.com',
  'dummyimage.com',
];

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : 'https://smartbuyserver1.vercel.app/api');

const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

const CATEGORY_COLORS = {
  tools: ['#4F46E5', '#1E293B'],
  kitchen: ['#EA580C', '#7C2D12'],
  decor: ['#BE185D', '#4A044E'],
  bedding: ['#0F766E', '#134E4A'],
  furniture: ['#8B5E3C', '#3F2A1D'],
  electronics: ['#2563EB', '#111827'],
  home: ['#059669', '#14532D'],
};

const toTitleCase = (value = '') =>
  value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const getProductFallbackImage = (product = {}) => {
  const safeProduct = product ?? {};
  const category = (safeProduct.category || 'home').toLowerCase();
  const [primary, secondary] = CATEGORY_COLORS[category] || CATEGORY_COLORS.home;
  const label = encodeURIComponent(safeProduct.name || toTitleCase(category) || 'Fi Kil Shi Item');
  const categoryLabel = encodeURIComponent(toTitleCase(category));

  return `data:image/svg+xml;utf8,
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primary}" />
        <stop offset="100%" stop-color="${secondary}" />
      </linearGradient>
    </defs>
    <rect width="800" height="1000" fill="url(%23bg)" rx="48" />
    <rect x="70" y="90" width="660" height="820" rx="36" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.25)" />
    <text x="400" y="260" text-anchor="middle" fill="white" font-size="44" font-family="Arial, sans-serif" opacity="0.85">${categoryLabel}</text>
    <text x="400" y="500" text-anchor="middle" fill="white" font-size="66" font-weight="700" font-family="Arial, sans-serif">${label}</text>
    <text x="400" y="790" text-anchor="middle" fill="white" font-size="28" font-family="Arial, sans-serif" opacity="0.78">Image unavailable or needs update</text>
  </svg>`.replace(/\n\s*/g, '');
};

export const isLikelyProductImage = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  return !PLACEHOLDER_PATTERNS.some((pattern) => trimmed.includes(pattern));
};

export const resolveProductImageUrl = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    return `${API_ORIGIN}/${trimmed.replace(/^\/+/, '')}`;
  }

  return trimmed;
};

export const getProductImageCandidates = (product = {}) => {
  const safeProduct = product ?? {};
  const rawImages = [safeProduct.image, ...(Array.isArray(safeProduct.images) ? safeProduct.images : [])];

  return [...new Set(
    rawImages
      .map(resolveProductImageUrl)
      .filter(isLikelyProductImage)
  )];
};

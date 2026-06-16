const readNumber = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === '') {
      continue;
    }

    const nextValue = Number(value);

    if (Number.isFinite(nextValue)) {
      return nextValue;
    }
  }

  return null;
};

export const DEFAULT_USD_TO_LBP_RATE = 89500;

export const getProductPrices = (product = {}, usdToLbpRate = DEFAULT_USD_TO_LBP_RATE) => {
  const priceObject = product.price && typeof product.price === 'object' ? product.price : {};
  const usdPrice = readNumber(product.priceUsd, product.usdPrice, product.priceUSD, priceObject.usd, priceObject.USD, product.price);
  const lbpPrice = readNumber(product.priceLbp, product.lbpPrice, product.priceLBP, priceObject.lbp, priceObject.LBP);
  const rate = readNumber(usdToLbpRate, DEFAULT_USD_TO_LBP_RATE);

  return {
    USD: usdPrice,
    LBP: lbpPrice !== null ? lbpPrice : (usdPrice !== null && rate !== null ? Math.round(usdPrice * rate) : null),
  };
};

export const formatCurrency = (value, currency) => {
  if (!Number.isFinite(value)) {
    return '';
  }

  if (currency === 'LBP') {
    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} LBP`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const getDisplayPrice = (product, preferredCurrency = 'USD', usdToLbpRate = DEFAULT_USD_TO_LBP_RATE) => {
  const prices = getProductPrices(product, usdToLbpRate);
  const preferredPrice = prices[preferredCurrency];

  if (preferredPrice !== null) {
    return {
      label: formatCurrency(preferredPrice, preferredCurrency),
      currency: preferredCurrency,
      value: preferredPrice,
      hasPrice: true,
    };
  }

  const fallbackCurrency = preferredCurrency === 'USD' ? 'LBP' : 'USD';
  const fallbackPrice = prices[fallbackCurrency];

  if (fallbackPrice !== null) {
    return {
      label: formatCurrency(fallbackPrice, fallbackCurrency),
      currency: fallbackCurrency,
      value: fallbackPrice,
      hasPrice: true,
    };
  }

  return {
    label: 'Call for cost',
    currency: null,
    value: null,
    hasPrice: false,
  };
};

export const getLineItemPrice = (item, preferredCurrency = 'USD', usdToLbpRate = DEFAULT_USD_TO_LBP_RATE) => {
  const displayPrice = getDisplayPrice(item, preferredCurrency, usdToLbpRate);

  if (!displayPrice.hasPrice) {
    return displayPrice;
  }

  return {
    ...displayPrice,
    value: displayPrice.value * (item.quantity || 1),
    label: formatCurrency(displayPrice.value * (item.quantity || 1), displayPrice.currency),
  };
};

export const getCartUsdSubtotal = (items = []) =>
  items.reduce((sum, item) => {
    const usdPrice = getProductPrices(item).USD;
    return usdPrice !== null ? sum + usdPrice * (item.quantity || 1) : sum;
  }, 0);

export const getApproxLbpAmount = (usdAmount, usdToLbpRate = DEFAULT_USD_TO_LBP_RATE) => {
  const amount = Number(usdAmount || 0);
  const rate = Number(usdToLbpRate || DEFAULT_USD_TO_LBP_RATE);

  return Number.isFinite(amount) && Number.isFinite(rate) ? amount * rate : 0;
};

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

export const getProductPrices = (product = {}) => {
  const priceObject = product.price && typeof product.price === 'object' ? product.price : {};

  return {
    USD: readNumber(product.priceUsd, product.usdPrice, product.priceUSD, priceObject.usd, priceObject.USD, product.price),
    LBP: readNumber(product.priceLbp, product.lbpPrice, product.priceLBP, priceObject.lbp, priceObject.LBP),
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

export const getDisplayPrice = (product, preferredCurrency = 'USD') => {
  const prices = getProductPrices(product);
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

export const getLineItemPrice = (item, preferredCurrency = 'USD') => {
  const displayPrice = getDisplayPrice(item, preferredCurrency);

  if (!displayPrice.hasPrice) {
    return displayPrice;
  }

  return {
    ...displayPrice,
    value: displayPrice.value * (item.quantity || 1),
    label: formatCurrency(displayPrice.value * (item.quantity || 1), displayPrice.currency),
  };
};

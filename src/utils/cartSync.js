import { getProductById } from '../api/products';

const getProductId = (product = {}) => product._id || product.id || '';

const readNullablePrice = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : null;
};

const didPriceChange = (currentItem, latestProduct) =>
  readNullablePrice(currentItem.price) !== readNullablePrice(latestProduct.price) ||
  readNullablePrice(currentItem.priceLbp) !== readNullablePrice(latestProduct.priceLbp);

const getErrorStatus = (error) => Number(error?.response?.status);

export const syncCartWithLatestProducts = async (items = []) => {
  const changes = [];
  const syncedItems = [];

  for (const item of items) {
    const productId = getProductId(item);

    if (!productId) {
      changes.push({ type: 'removed', name: item.name });
      continue;
    }

    let latestProduct;

    try {
      const { data } = await getProductById(productId);
      latestProduct = data;
    } catch (error) {
      if (getErrorStatus(error) === 404) {
        changes.push({ type: 'removed', name: item.name });
        continue;
      }

      throw error;
    }

    const latestStock = Number(latestProduct.stock);

    if (Number.isFinite(latestStock) && latestStock <= 0) {
      changes.push({ type: 'removed', name: latestProduct.name || item.name });
      continue;
    }

    const maxQuantity = Number.isFinite(latestStock) && latestStock > 0 ? latestStock : Infinity;
    const requestedQuantity = Math.floor(Number(item.quantity));
    const currentQuantity = Number.isFinite(requestedQuantity) && requestedQuantity > 0 ? requestedQuantity : 1;
    const nextQuantity = Math.min(currentQuantity, maxQuantity);

    if (nextQuantity !== currentQuantity) {
      changes.push({ type: 'quantity', name: latestProduct.name || item.name });
    }

    if (didPriceChange(item, latestProduct)) {
      changes.push({ type: 'price', name: latestProduct.name || item.name });
    }

    syncedItems.push({
      ...item,
      ...latestProduct,
      id: latestProduct._id || productId,
      quantity: nextQuantity,
    });
  }

  return {
    changes,
    items: syncedItems,
  };
};

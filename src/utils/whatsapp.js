import { BRAND_NAME, WHATSAPP_NUMBER } from '../config/brand';
import { getDisplayPrice, getLineItemPrice } from './pricing';

const whatsappUrl = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const getProductWhatsAppUrl = (product, currency = 'USD', language = 'en') => {
  const price = getDisplayPrice(product, currency).label;
  const id = product?._id || product?.id || 'N/A';
  const intro = language === 'ar'
    ? `مرحبا ${BRAND_NAME}، بدي اسأل عن هيدا الغرض:`
    : `Hello ${BRAND_NAME}, I want to ask about this item:`;

  return whatsappUrl(`${intro}

${product?.name || 'Item'}
Category: ${product?.category || 'N/A'}
Price: ${price}
Item ID: ${id}`);
};

export const getCartWhatsAppUrl = (items = [], currency = 'USD', language = 'en') => {
  const intro = language === 'ar'
    ? `مرحبا ${BRAND_NAME}، بدي أطلب هالأغراض:`
    : `Hello ${BRAND_NAME}, I want to order these items:`;

  const lines = items.map((item, index) => {
    const linePrice = getLineItemPrice(item, currency).label;
    return `${index + 1}. ${item.name} x${item.quantity || 1} - ${linePrice}`;
  });

  return whatsappUrl(`${intro}

${lines.join('\n')}

Delivery: Aramex across Lebanon
Payment: Cash on delivery`);
};

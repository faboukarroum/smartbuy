export const getFulfillmentStatus = (order) =>
  order?.fulfillmentStatus || (order?.isDelivered ? 'delivered' : 'ready_for_pickup');

export const getFulfillmentLabel = (order, language) => {
  const status = getFulfillmentStatus(order);

  if (status === 'delivered') {
    return language === 'ar' ? 'تم التوصيل' : 'Delivered';
  }

  if (status === 'picked_up') {
    return language === 'ar' ? 'مع شركة التوصيل' : 'Picked up by delivery company';
  }

  return language === 'ar' ? 'جاهز للاستلام من شركة التوصيل' : 'Ready for pickup';
};

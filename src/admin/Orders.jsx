import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  AlertCircle,
  MoreVertical,
  Calendar,
  User,
  DollarSign
} from 'lucide-react';
import { getOrders, updateOrderToDelivered } from '../api/products';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await getOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeliver = async (id) => {
    if (window.confirm('Mark this order as delivered?')) {
      try {
        await updateOrderToDelivered(id);
        const { data } = await getOrders();
        setOrders(data);
        setSelectedOrder((current) => data.find((order) => order._id === current?._id) || current);
      } catch {
        alert('Failed to update order status');
      }
    }
  };

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.guestCustomer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.guestCustomer?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Orders</h1>
        <p className="text-slate-500 text-sm">Monitor and manage customer purchases.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                const nextParams = new URLSearchParams(searchParams);

                if (value.trim()) {
                  nextParams.set('q', value);
                } else {
                  nextParams.delete('q');
                }

                setSearchParams(nextParams, { replace: true });
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="font-medium">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="py-20 flex flex-col items-center justify-center text-red-500">
              <AlertCircle size={40} className="mb-4" />
              <p className="font-medium">{error}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <ShoppingBag size={40} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">No orders found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Order Info</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Delivery</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 text-sm uppercase tracking-tighter">#{order._id.slice(-8)}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                          <Calendar size={12} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-xs font-bold">
                          {order.user?.name?.[0] || 'U'}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{order.user?.name || order.guestCustomer?.fullName || 'Guest Customer'}</span>
                      </div>
                      {order.guestCustomer?.phone && (
                        <p className="mt-1 text-xs text-slate-400">{order.guestCustomer.phone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">${order.totalPrice.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">{order.orderItems.length} items</p>
                    </td>
                    <td className="px-6 py-4">
                      {order.isPaid ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                            <CheckCircle2 size={12} /> Paid
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(order.paidAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase">
                          <Clock size={12} /> Pending COD
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.isDelivered ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase">
                            <Truck size={12} /> Delivered
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(order.deliveredAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase">
                          <Clock size={12} /> Awaiting delivery
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {!order.isDelivered && (
                          <button 
                            onClick={() => handleDeliver(order._id)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Mark as Delivered"
                          >
                            <Truck size={18} />
                          </button>
                        )}
                      </div>
                      <div className="group-hover:hidden text-slate-300">
                        <MoreVertical size={18} className="ml-auto" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Order Details</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">#{selectedOrder._id?.slice(-8)}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Placed {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'date unavailable'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <div className="max-h-[calc(90vh-96px)] overflow-y-auto p-6">
              <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-amber-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Payment</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{selectedOrder.isPaid ? 'Paid' : 'Pending COD'}</p>
                </div>
                <div className="rounded-xl bg-blue-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Delivery</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{selectedOrder.isDelivered ? 'Delivered' : 'Awaiting delivery'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Method</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{selectedOrder.paymentMethod || 'Cash on Delivery'}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Total</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">${Number(selectedOrder.totalPrice || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Customer</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-bold text-slate-900">
                        {selectedOrder.user?.name || selectedOrder.guestCustomer?.fullName || selectedOrder.shippingAddress?.fullName || 'Guest Customer'}
                      </p>
                      <p className="text-slate-500">{selectedOrder.user?.email || selectedOrder.guestCustomer?.email || 'No email provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Phone</p>
                      <p className="font-medium text-slate-700">{selectedOrder.guestCustomer?.phone || 'No phone provided'}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Delivery</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Address</p>
                      <p className="font-medium text-slate-700">{selectedOrder.shippingAddress?.address || 'No address provided'}</p>
                      <p className="font-medium text-slate-700">{selectedOrder.shippingAddress?.city || 'No city provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Delivery Note</p>
                      <p className="whitespace-pre-wrap font-medium text-slate-700">
                        {selectedOrder.shippingAddress?.deliveryNote || 'No delivery note provided'}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <section className="mt-6 rounded-2xl border border-slate-200">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Items</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {(selectedOrder.orderItems || []).map((item) => (
                    <div key={item.product || item.name} className="flex items-center gap-4 px-5 py-4">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">No img</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty {item.qty} x ${Number(item.price || 0).toFixed(2)}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">${Number((item.price || 0) * (item.qty || 0)).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Timeline</h3>
                  <div className="space-y-3 text-sm text-slate-600">
                    <p>Created: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'Unknown'}</p>
                    <p>Paid: {selectedOrder.isPaid && selectedOrder.paidAt ? new Date(selectedOrder.paidAt).toLocaleString() : 'Not collected yet'}</p>
                    <p>Delivered: {selectedOrder.isDelivered && selectedOrder.deliveredAt ? new Date(selectedOrder.deliveredAt).toLocaleString() : 'Not delivered yet'}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Totals</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Items</span>
                      <span className="font-bold text-slate-900">${Number(selectedOrder.itemsPrice || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery</span>
                      <span className="font-bold text-slate-900">${Number(selectedOrder.shippingPrice || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="font-bold text-slate-900">${Number(selectedOrder.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {!selectedOrder.isDelivered && (
                    <button
                      type="button"
                      onClick={() => handleDeliver(selectedOrder._id)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      <Truck size={16} />
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

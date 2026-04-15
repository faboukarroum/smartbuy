import React, { useState, useEffect } from 'react';
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
        fetchOrders();
      } catch (err) {
        alert('Failed to update order status');
      }
    }
  };

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
                        <span className="text-sm font-medium text-slate-700">{order.user?.name || 'Deleted User'}</span>
                      </div>
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
                          <Clock size={12} /> Pending
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
                          <Clock size={12} /> In Transit
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {!order.isDelivered && order.isPaid && (
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
    </div>
  );
};

export default Orders;

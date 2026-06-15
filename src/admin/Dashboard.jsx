import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Package,
  ShoppingBag,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { getOrders, getProducts } from '../api/products';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 0,
});

const formatRelativeDate = (value) => {
  if (!value) {
    return 'Unknown date';
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs)) {
    return 'Unknown date';
  }

  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const getOrderStatus = (order) => {
  const fulfillmentStatus = order.fulfillmentStatus || (order.isDelivered ? 'delivered' : 'ready_for_pickup');

  if (order.isPaid && fulfillmentStatus === 'delivered') {
    return {
      label: 'Completed',
      className: 'bg-emerald-100 text-emerald-600',
    };
  }

  if (fulfillmentStatus === 'delivered') {
    return {
      label: 'Delivered, COD Pending',
      className: 'bg-blue-100 text-blue-600',
    };
  }

  if (order.isPaid) {
    return {
      label: 'COD Collected',
      className: 'bg-teal-100 text-teal-600',
    };
  }

  if (fulfillmentStatus === 'picked_up') {
    return {
      label: 'Picked Up',
      className: 'bg-indigo-100 text-indigo-600',
    };
  }

  return {
    label: 'Ready for Pickup',
    className: 'bg-amber-100 text-amber-600',
  };
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    loading: true,
    error: '',
    stats: [],
    recentOrders: [],
    performance: [],
    tasks: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsResult, ordersResult] = await Promise.allSettled([
          getProducts({ pageSize: 250 }),
          getOrders(),
        ]);

        const productsData = productsResult.status === 'fulfilled' ? productsResult.value.data : null;
        const ordersData = ordersResult.status === 'fulfilled' ? ordersResult.value.data : [];

        const products = productsData?.products || [];
        const productCount = productsData?.count || products.length;
        const orders = Array.isArray(ordersData) ? ordersData : [];

        const expectedRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const paidOrders = orders.filter((order) => order.isPaid);
        const collectedRevenue = paidOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const pendingCodRevenue = orders
          .filter((order) => !order.isPaid)
          .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const deliveredOrders = orders.filter((order) => order.isDelivered);
        const completedOrders = orders.filter((order) => order.isPaid && order.isDelivered);
        const pendingCodOrders = orders.filter((order) => !order.isPaid);
        const readyForPickupOrders = orders.filter((order) => (order.fulfillmentStatus || (order.isDelivered ? 'delivered' : 'ready_for_pickup')) === 'ready_for_pickup');
        const pickedUpOrders = orders.filter((order) => order.fulfillmentStatus === 'picked_up');
        const fulfillmentOrders = orders.filter((order) => (order.fulfillmentStatus || (order.isDelivered ? 'delivered' : 'ready_for_pickup')) !== 'delivered');
        const lowStockProducts = products.filter((product) => typeof product.stock === 'number' && product.stock > 0 && product.stock <= 5);
        const outOfStockProducts = products.filter((product) => product.stock === 0);
        const healthyInventoryProducts = products.filter((product) => typeof product.stock === 'number' && product.stock > 0);
        const inventoryHealth = productCount > 0 ? healthyInventoryProducts.length / productCount : 0;
        const paidRate = orders.length > 0 ? paidOrders.length / orders.length : 0;
        const deliveryRate = orders.length > 0 ? deliveredOrders.length / orders.length : 0;
        const completionRate = orders.length > 0 ? completedOrders.length / orders.length : 0;
        const recentOrders = [...orders]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((order) => ({
            id: `#${order._id?.slice(-8) || 'UNKNOWN'}`,
            customer: order.user?.name || order.guestCustomer?.fullName || 'Guest Customer',
            date: formatRelativeDate(order.createdAt),
            amount: currencyFormatter.format(order.totalPrice || 0),
            status: getOrderStatus(order),
          }));

        setDashboardData({
          loading: false,
          error: productsResult.status !== 'fulfilled' && ordersResult.status !== 'fulfilled'
            ? 'Unable to load dashboard metrics right now.'
            : '',
          stats: [
            {
              label: 'Collected Revenue',
              value: currencyFormatter.format(collectedRevenue),
              icon: <DollarSign className="text-emerald-500" />,
              detail: `${currencyFormatter.format(expectedRevenue)} expected total`,
            },
            {
              label: 'Total Orders',
              value: orders.length.toString(),
              icon: <ShoppingBag className="text-blue-500" />,
              detail: `${completedOrders.length} completed`,
            },
            {
              label: 'Pending COD',
              value: currencyFormatter.format(pendingCodRevenue),
              icon: <Clock className="text-amber-500" />,
              detail: `${pendingCodOrders.length} order${pendingCodOrders.length === 1 ? '' : 's'} unpaid`,
            },
            {
              label: 'Total Products',
              value: productCount.toString(),
              icon: <Package className="text-purple-500" />,
              detail: `${outOfStockProducts.length} out of stock`,
            },
          ],
          recentOrders,
          performance: [
            {
              label: 'Inventory Health',
              value: percentFormatter.format(inventoryHealth),
              width: `${Math.round(inventoryHealth * 100)}%`,
              accent: 'bg-primary',
              dot: 'bg-primary',
            },
            {
              label: 'COD Collection',
              value: percentFormatter.format(paidRate),
              width: `${Math.round(paidRate * 100)}%`,
              accent: 'bg-emerald-500',
              dot: 'bg-emerald-500',
            },
            {
              label: 'Delivery Completion',
              value: percentFormatter.format(deliveryRate),
              width: `${Math.round(deliveryRate * 100)}%`,
              accent: 'bg-blue-500',
              dot: 'bg-blue-500',
            },
            {
              label: 'Order Completion',
              value: percentFormatter.format(completionRate),
              width: `${Math.round(completionRate * 100)}%`,
              accent: 'bg-slate-700',
              dot: 'bg-slate-700',
            },
          ],
          tasks: [
            {
              icon: <Clock size={16} />,
              className: 'bg-amber-50 text-amber-700',
              label: `${pendingCodOrders.length} COD order${pendingCodOrders.length === 1 ? '' : 's'} awaiting collection`,
            },
            {
              icon: <Truck size={16} />,
              className: 'bg-blue-50 text-blue-700',
              label: `${fulfillmentOrders.length} order${fulfillmentOrders.length === 1 ? '' : 's'} still need delivery`,
            },
            {
              icon: <Package size={16} />,
              className: 'bg-indigo-50 text-indigo-700',
              label: `${readyForPickupOrders.length} ready for pickup, ${pickedUpOrders.length} with delivery company`,
            },
            {
              icon: <AlertCircle size={16} />,
              className: 'bg-red-50 text-red-700',
              label: `${outOfStockProducts.length} product${outOfStockProducts.length === 1 ? '' : 's'} out of stock`,
            },
            {
              icon: <CheckCircle2 size={16} />,
              className: 'bg-emerald-50 text-emerald-700',
              label: `${lowStockProducts.length} product${lowStockProducts.length === 1 ? '' : 's'} need restocking soon`,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData((prev) => ({
          ...prev,
          loading: false,
          error: 'Unable to load dashboard metrics right now.',
        }));
      }
    };

    fetchDashboardData();
  }, []);

  if (dashboardData.loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-slate-400">
        <Loader2 className="mb-4 animate-spin" size={40} />
        <p className="font-medium">Loading dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back to your Fi Kil Shi control center.</p>
      </div>

      {dashboardData.error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {dashboardData.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardData.stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-slate-50 p-3">
                {stat.icon}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</h3>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">{stat.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-900">
              <Clock size={18} className="text-primary" />
              Recent Orders
            </h3>
            <Link to="/admin/orders" className="text-sm font-bold text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            {dashboardData.recentOrders.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <ShoppingBag size={40} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">No orders have been placed yet.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardData.recentOrders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{order.customer}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${order.status.className}`}>
                          {order.status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 flex items-center gap-2 font-bold text-slate-900">
            <TrendingUp size={18} className="text-primary" />
            Shop Performance
          </h3>
          <div className="space-y-6">
            {dashboardData.performance.map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${metric.dot}`}></div>
                    <span className="text-sm text-slate-600">{metric.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{metric.value}</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${metric.accent}`} style={{ width: metric.width }}></div>
                </div>
              </div>
            ))}

            <div className="border-t border-slate-100 pt-6">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Admin Tasks</h4>
              <div className="space-y-3">
                {dashboardData.tasks.map((task) => (
                  <div key={task.label} className={`flex items-center gap-3 rounded-xl p-3 ${task.className}`}>
                    {task.icon}
                    <span className="text-xs font-medium">{task.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

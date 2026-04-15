import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Package
} from 'lucide-react';
import { getProducts } from '../api/products';
// We'll need an api for orders later
// import { getOrders } from '../api/orders';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '$12,450.00', icon: <DollarSign className="text-emerald-500" />, change: '+12.5%', isPositive: true },
    { label: 'Total Orders', value: '156', icon: <ShoppingBag className="text-blue-500" />, change: '+8.2%', isPositive: true },
    { label: 'Total Products', value: '0', icon: <Package className="text-purple-500" />, change: '0%', isPositive: true },
    { label: 'Active Users', value: '1,240', icon: <Users className="text-orange-500" />, change: '-2.4%', isPositive: false },
  ]);

  const [recentOrders, setRecentOrders] = useState([
    { id: '#ORD-7542', customer: 'John Doe', date: '2 mins ago', amount: '$120.50', status: 'Completed' },
    { id: '#ORD-7541', customer: 'Sarah Smith', date: '15 mins ago', amount: '$45.00', status: 'Pending' },
    { id: '#ORD-7540', customer: 'Mike Johnson', date: '1 hour ago', amount: '$85.00', status: 'Processing' },
    { id: '#ORD-7539', customer: 'Emma Wilson', date: '3 hours ago', amount: '$210.00', status: 'Completed' },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await getProducts({ pageSize: 1 });
        setStats(prev => prev.map(stat => 
          stat.label === 'Total Products' ? { ...stat, value: data.count.toString() } : stat
        ));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back to your SmartBuy control center.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              Recent Orders
            </h3>
            <button className="text-sm font-bold text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">{order.id}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{order.customer}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 text-sm">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                        order.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 text-xs">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            Shop Performance
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-slate-600">Inventory Health</span>
              </div>
              <span className="text-sm font-bold text-slate-900">92%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Customer Satisfaction</span>
              </div>
              <span className="text-sm font-bold text-slate-900">4.8/5</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '96%' }}></div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Admin Tasks</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl text-blue-700">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-medium">Verify 3 new user accounts</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl text-amber-700">
                  <Clock size={16} />
                  <span className="text-xs font-medium">Restock low inventory (5 items)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

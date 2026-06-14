import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AlertCircle, Loader2, Package, ShoppingBag, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/authStore';
import { getMyOrders } from '../api/products';

const Profile = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(Boolean(user));
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!user) {
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
        setError('');
      } catch {
        setError('Order history is unavailable right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-vintage-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <div className="mb-8 rounded-3xl border border-vintage-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
              <User size={30} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-vintage-900">{user.name || 'Your Account'}</h1>
              <p className="text-vintage-600">{user.email}</p>
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-vintage-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-vintage-900">Order History</h2>
              <p className="text-sm text-vintage-600">Orders placed while signed in appear here.</p>
            </div>
            <Link to="/products" className="rounded-full bg-vintage-900 px-5 py-3 text-sm font-black text-white hover:bg-vintage-800">
              Shop
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-vintage-400">
              <Loader2 className="mb-4 animate-spin" size={36} />
              <p className="font-bold">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
              <AlertCircle size={18} />
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-vintage-500">
              <ShoppingBag size={42} className="mx-auto mb-4 opacity-30" />
              <p className="font-bold">No signed-in orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="rounded-2xl border border-vintage-100 bg-vintage-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="text-primary" size={22} />
                      <div>
                        <p className="font-black text-vintage-900">#{order._id?.slice(-8)}</p>
                        <p className="text-sm text-vintage-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-vintage-700">
                      ${Number(order.totalPrice || 0).toFixed(2)} - {order.isDelivered ? 'Delivered' : 'Pending COD'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Profile;

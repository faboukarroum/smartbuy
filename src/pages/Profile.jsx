import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Package, Save, ShoppingBag, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/authStore';
import { getMyOrders, getUserProfile, updateUserProfile } from '../api/products';

const Profile = () => {
  const { user, login } = useAuthStore();
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(Boolean(user));
  const [error, setError] = React.useState('');
  const [profileForm, setProfileForm] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });
  const [profileLoading, setProfileLoading] = React.useState(Boolean(user));
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileError, setProfileError] = React.useState('');
  const [profileNotice, setProfileNotice] = React.useState('');

  React.useEffect(() => {
    if (!user) {
      return;
    }

    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const { data } = await getUserProfile();
        setProfileForm({
          name: data.name || '',
          email: data.email || '',
          password: '',
        });
        setProfileError('');
      } catch {
        setProfileForm({
          name: user.name || '',
          email: user.email || '',
          password: '',
        });
        setProfileError('Profile details could not be refreshed. You can still edit your saved account details.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
    setProfileNotice('');
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileError('Name and email are required.');
      return;
    }

    try {
      setProfileSaving(true);
      setProfileError('');
      setProfileNotice('');

      const payload = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      };

      if (profileForm.password.trim()) {
        payload.password = profileForm.password;
      }

      const { data } = await updateUserProfile(payload);
      login(data);
      setProfileForm({
        name: data.name || '',
        email: data.email || '',
        password: '',
      });
      setProfileNotice('Profile updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Unable to update profile right now.');
    } finally {
      setProfileSaving(false);
    }
  };

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

        <section className="mb-8 rounded-3xl border border-vintage-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-vintage-900">Profile Details</h2>
            <p className="text-sm text-vintage-600">Update your account information and password.</p>
          </div>

          {profileNotice && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={18} />
              {profileNotice}
            </div>
          )}

          {profileError && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
              <AlertCircle size={18} />
              {profileError}
            </div>
          )}

          {profileLoading ? (
            <div className="flex items-center gap-3 py-6 text-vintage-500">
              <Loader2 className="animate-spin" size={22} />
              <span className="font-bold">Loading profile...</span>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-vintage-700">Full Name</label>
                <input
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className="w-full rounded-xl border border-vintage-200 bg-vintage-50 px-4 py-3 font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-vintage-700">Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="w-full rounded-xl border border-vintage-200 bg-vintage-50 px-4 py-3 font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-vintage-700">New Password</label>
                <input
                  name="password"
                  type="password"
                  value={profileForm.password}
                  onChange={handleProfileChange}
                  placeholder="Leave blank to keep your current password"
                  className="w-full rounded-xl border border-vintage-200 bg-vintage-50 px-4 py-3 font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-2 text-xs font-medium text-vintage-500">Only enter a password when you want to change it.</p>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-vintage-900 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-vintage-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {profileSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Profile
                </button>
              </div>
            </form>
          )}
        </section>

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

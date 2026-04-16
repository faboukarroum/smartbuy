import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
  Users as UsersIcon,
} from 'lucide-react';
import { getUsers } from '../api/products';
import useAuthStore from '../store/authStore';

const fallbackUsers = [
  {
    _id: 'sample-admin-1',
    name: 'Smart Buy Admin',
    email: 'admin@smartbuy.local',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'sample-user-1',
    name: 'Sarah Walker',
    email: 'sarah@example.com',
    role: 'customer',
    createdAt: '2026-03-21T09:00:00.000Z',
  },
  {
    _id: 'sample-user-2',
    name: 'Michael Reed',
    email: 'michael@example.com',
    role: 'customer',
    createdAt: '2026-04-03T13:30:00.000Z',
  },
];

const Users = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await getUsers();
        const userList = Array.isArray(data) ? data : data?.users;

        if (!Array.isArray(userList)) {
          throw new Error('Unexpected users response');
        }

        setUsers(userList);
        setError('');
        setUsingFallback(false);
      } catch (err) {
        const adminUser = user
          ? [{
              _id: user._id || 'current-admin',
              name: user.name || 'Admin',
              email: user.email || 'admin@smartbuy.local',
              role: user.role || 'admin',
              createdAt: user.createdAt || new Date().toISOString(),
            }]
          : [];

        setUsers(adminUser.length > 0 ? adminUser : fallbackUsers);
        setUsingFallback(true);
        setError('Live user records are unavailable right now, so a fallback list is being shown.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return users.filter((entry) =>
      entry.name?.toLowerCase().includes(query) ||
      entry.email?.toLowerCase().includes(query) ||
      entry.role?.toLowerCase().includes(query)
    );
  }, [searchTerm, users]);

  const adminCount = users.filter((entry) => entry.role === 'admin').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">Review the people who can access and shop with SmartBuy.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Total Users</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{users.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Admins</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{adminCount}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {usingFallback && (
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-amber-700">
                <AlertCircle size={14} />
                Fallback Data
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="mb-4 animate-spin" size={40} />
              <p className="font-medium">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <UsersIcon size={40} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">No users matched your search.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((entry) => (
                  <tr key={entry._id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                          {entry.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{entry.name || 'Unknown user'}</p>
                          <p className="text-xs uppercase tracking-wide text-slate-400">ID: {entry._id?.slice(-6) || 'n/a'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={16} className="text-slate-400" />
                        <span>{entry.email || 'No email available'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        entry.role === 'admin'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {entry.role === 'admin' ? <ShieldCheck size={12} /> : <UserRound size={12} />}
                        {entry.role || 'customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Unknown'}
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

export default Users;

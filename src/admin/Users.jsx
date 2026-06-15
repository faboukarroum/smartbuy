import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  Edit,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { deleteUser, getUsers, updateUser } from '../api/products';
import useAuthStore from '../store/authStore';

const emptyDraft = {
  name: '',
  email: '',
  role: 'user',
};

const Users = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastLoadedAt, setLastLoadedAt] = useState(null);
  const [notice, setNotice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

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
      setLastLoadedAt(new Date());
    } catch (err) {
      setUsers([]);
      setError(err.response?.data?.message || 'Live user records are unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return users.filter((entry) =>
      entry.name?.toLowerCase().includes(query) ||
      entry.email?.toLowerCase().includes(query) ||
      entry.role?.toLowerCase().includes(query)
    );
  }, [searchTerm, users]);

  const adminCount = users.filter((entry) => entry.role === 'admin').length;

  const startEdit = (entry) => {
    setEditingId(entry._id);
    setDraft({
      name: entry.name || '',
      email: entry.email || '',
      role: entry.role || 'user',
    });
    setNotice('');
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const handleSave = async (id) => {
    if (!draft.name.trim() || !draft.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    try {
      setSavingId(id);
      const { data } = await updateUser(id, {
        name: draft.name.trim(),
        email: draft.email.trim(),
        role: draft.role,
      });

      setUsers((current) => current.map((entry) => (entry._id === id ? { ...entry, ...data } : entry)));
      setEditingId(null);
      setDraft(emptyDraft);
      setError('');
      setNotice('User updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (entry) => {
    const isSelf = entry._id === user?._id;

    if (isSelf) {
      setError('You cannot delete your own admin account.');
      return;
    }

    if (!window.confirm(`Delete ${entry.name || entry.email}? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(entry._id);
      await deleteUser(entry._id);
      setUsers((current) => current.filter((item) => item._id !== entry._id));
      setNotice('User deleted successfully.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">Manage account access, roles, and customer records.</p>
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

            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {lastLoadedAt && !error && (
            <p className="mt-3 text-xs font-medium text-slate-400">
              Live user records last loaded {lastLoadedAt.toLocaleString()}.
            </p>
          )}

          {notice && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {notice}
            </div>
          )}

          {error && (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={fetchUsers}
                disabled={loading}
                className="self-start rounded-lg bg-amber-100 px-3 py-2 text-xs font-black uppercase tracking-wide text-amber-900 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="mb-4 animate-spin" size={40} />
              <p className="font-medium">Loading users...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <AlertCircle size={44} className="mb-4 text-amber-500" />
              <h2 className="text-lg font-black text-slate-900">Unable to load live users</h2>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                The admin panel is not showing fallback or sample accounts. Retry once the API connection is available.
              </p>
              <button
                type="button"
                onClick={fetchUsers}
                disabled={loading}
                className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Retry Loading Users
              </button>
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
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((entry) => {
                  const isEditing = editingId === entry._id;
                  const isSelf = entry._id === user?._id;

                  return (
                    <tr key={entry._id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                            {entry.name?.[0] || 'U'}
                          </div>
                          <div>
                            {isEditing ? (
                              <input
                                value={draft.name}
                                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                                className="w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-primary"
                              />
                            ) : (
                              <p className="text-sm font-bold text-slate-900">{entry.name || 'Unknown user'}</p>
                            )}
                            <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                              ID: {entry._id?.slice(-6) || 'n/a'} {isSelf ? ' / You' : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            value={draft.email}
                            onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                            className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail size={16} className="text-slate-400" />
                            <span>{entry.email || 'No email available'}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={draft.role}
                            onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-primary"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            entry.role === 'admin'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {entry.role === 'admin' ? <ShieldCheck size={12} /> : <UserRound size={12} />}
                            {entry.role || 'user'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSave(entry._id)}
                                disabled={savingId === entry._id}
                                className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                title="Save user"
                              >
                                {savingId === entry._id ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                title="Cancel edit"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(entry)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                title="Edit user"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(entry)}
                                disabled={isSelf || deletingId === entry._id}
                                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                title={isSelf ? 'You cannot delete yourself' : 'Delete user'}
                              >
                                {deletingId === entry._id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;

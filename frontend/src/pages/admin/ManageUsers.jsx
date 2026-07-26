import React, { useState, useEffect } from 'react';
import { UserCog, Search, Trash2, Edit, Shield, CheckCircle, XCircle } from 'lucide-react';
import { adminAPI } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge, StatusBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input, { Select } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner, { EmptyState } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ role: '', isActive: true });
  const [updating, setUpdating] = useState(false);

  const load = () => {
    adminAPI.getUsers({ search, role: roleFilter || undefined }).then(r => setUsers(r.data.data)).catch(() => toast.error('Failed to load users')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, roleFilter]);

  const openEdit = (user) => {
    setSelected(user);
    setForm({ role: user.role, isActive: user.isActive !== false });
    setEditModal(true);
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await adminAPI.updateUser(selected._id, form);
      toast.success('User updated!');
      setEditModal(false);
      load();
    } catch { toast.error('Failed to update'); } finally { setUpdating(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(p => p.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const roleColors = { admin: 'red', investor: 'green', founder: 'blue' };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><UserCog className="text-blue-500" size={24} /> Manage Users</h1>
        <p className="text-slate-500 text-sm mt-1">{users.length} users on the platform</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} icon={Search} />
        </div>
        <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          options={[{ value: '', label: 'All Roles' }, { value: 'founder', label: 'Founder' }, { value: 'investor', label: 'Investor' }, { value: 'admin', label: 'Admin' }]}
          className="w-36" />
      </div>

      {loading ? <LoadingSpinner /> : users.length === 0 ? (
        <EmptyState icon={UserCog} title="No users found" description="No users match your search." />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{u.name?.charAt(0)?.toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge color={roleColors[u.role] || 'gray'} size="xs" dot>{u.role}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {u.isActive !== false ? <CheckCircle size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-500" />}
                          <span className="text-xs text-slate-500">{u.isActive !== false ? 'Active' : 'Inactive'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"><Edit size={15} /></button>
                          <button onClick={() => handleDelete(u._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title={`Edit: ${selected?.name}`}
        footer={<><Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button><Button onClick={handleUpdate} loading={updating}>Save Changes</Button></>}>
        {selected && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className="text-sm font-semibold">{selected.name}</p>
              <p className="text-xs text-slate-400">{selected.email}</p>
            </div>
            <Select label="Role" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              options={[{ value: 'founder', label: 'Founder' }, { value: 'investor', label: 'Investor' }, { value: 'admin', label: 'Admin' }]} />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 rounded" />
              <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">Account Active</label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Lock, LockOpen, Plus, Trash2, UserCog, Search } from 'lucide-react';
import { formatDate } from '../../utils/dateFormat';
import api from '../../services/api';
import AppModal from '../../components/admin/AppModal';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

const ROLES = [
  { value: 'staff', label: 'Nhân viên (staff)' },
  { value: 'admin', label: 'Admin' },
  { value: 'customer', label: 'Khách · customer' },
];

export default function AdminUsersPage() {
  const { user: me } = useAuth();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 12;

  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit] = useState(null);
  const [formCreate, setFormCreate] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [formEdit, setFormEdit] = useState({
    id: '',
    name: '',
    email: '',
    role: 'staff',
    password: '',
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users', { params: { search: search.trim() || undefined, page, limit } });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Không tải được người dùng');
    } finally {
      setLoading(false);
    }
  }, [limit, page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const createUser = async () => {
    try {
      if (!formCreate.name.trim() || !formCreate.email.trim() || !formCreate.password) {
        toast.error('Điền đủ tên · email · mật khẩu');
        return;
      }
      await api.post('/users', formCreate);
      toast.success('Đã tạo tài khoản');
      setModalCreate(false);
      setFormCreate({ name: '', email: '', password: '', role: 'staff' });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Tạo thất bại');
    }
  };

  const openEdit = (u) => {
    setFormEdit({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      password: '',
    });
    setModalEdit(u);
  };

  const saveEdit = async () => {
    if (!modalEdit) return;
    try {
      const payload = {
        name: formEdit.name,
        email: formEdit.email,
        role: formEdit.role,
      };
      if (formEdit.password.trim()) payload.password = formEdit.password;
      await api.put(`/users/${modalEdit.id}`, payload);
      toast.success('Đã cập nhật người dùng');
      setModalEdit(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lưu thất bại');
    }
  };

  const toggleLock = async (u) => {
    if (u.id === me?.id) {
      toast.error('Không khóa tài khoản của chính bạn.');
      return;
    }
    const next = Number(u.is_active) === 1 ? 0 : 1;
    try {
      await api.put(`/users/${u.id}`, { name: u.name, email: u.email, role: u.role, is_active: next });
      toast.success(next ? 'Đã mở khóa' : 'Đã khóa tài khoản');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Thất bại');
    }
  };

  const remove = async (u) => {
    if (u.id === me?.id) {
      toast.error('Không xóa chính bạn.');
      return;
    }
    if (!window.confirm(`Xóa user "${u.email}"?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      toast.success('Đã xóa');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Xóa thất bại');
    }
  };

  function roleClass(r) {
    if (r === 'admin') return 'bg-indigo-100 text-indigo-900 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-100';
    if (r === 'staff') return 'bg-sky-100 text-sky-900 ring-sky-200 dark:bg-sky-900/40 dark:text-sky-100';
    return 'bg-slate-100 text-slate-800 ring-slate-200 dark:bg-slate-700 dark:text-slate-100';
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">Người dùng &amp; nhân viên</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Admin: tạo staff, đổi vai trò, khóa tài khoản.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm dark:border-slate-600 dark:bg-slate-900"
              placeholder="Tên, email…"
            />
          </div>
          <button
            type="button"
            onClick={() => setModalCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-navy-900"
          >
            <Plus className="h-4 w-4" /> Tài khoản mới
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900/70">
        <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Người dùng</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Role</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Tạo lúc</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="p-4">
                    <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                  </td>
                </tr>
              ))
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy-900 dark:text-white">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ring-1', roleClass(u.role))}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    {Number(u.is_active) === 1 ? (
                      <span className="text-xs font-semibold text-emerald-600">Đang hoạt động</span>
                    ) : (
                      <span className="text-xs font-semibold text-rose-600">Đã khóa</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-600"
                        title="Phân quyền · sửa"
                        onClick={() => openEdit(u)}
                      >
                        <UserCog className="h-4 w-4" />
                      </button>
                      <button type="button" className="rounded-lg border border-slate-200 p-2 dark:border-slate-600" title="Khóa / Mở" onClick={() => toggleLock(u)}>
                        {Number(u.is_active) === 1 ? <Lock className="h-4 w-4 text-rose-600" /> : <LockOpen className="h-4 w-4 text-emerald-600" />}
                      </button>
                      <button type="button" className="rounded-lg border border-rose-200 p-2 text-rose-600" title="Xóa" onClick={() => remove(u)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {pages > 1 && (
          <div className="flex justify-end gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
            <button type="button" disabled={page <= 1} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40 dark:border-slate-600" onClick={() => setPage((p) => p - 1)}>
              ←
            </button>
            <span className="flex items-center text-sm">{page}/{pages}</span>
            <button type="button" disabled={page >= pages} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40 dark:border-slate-600" onClick={() => setPage((p) => p + 1)}>
              →
            </button>
          </div>
        )}
      </div>

      <AppModal
        open={modalCreate}
        onClose={() => setModalCreate(false)}
        title="Tạo tài khoản staff / user"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-xl border px-4 py-2 text-sm font-bold dark:border-slate-600" onClick={() => setModalCreate(false)}>
              Hủy
            </button>
            <button type="button" className="rounded-xl bg-navy-900 px-5 py-2 text-sm font-bold text-white dark:bg-white dark:text-navy-900" onClick={createUser}>
              Tạo
            </button>
          </div>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Tên hiển thị</span>
            <input className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" value={formCreate.name} onChange={(e) => setFormCreate({ ...formCreate, name: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Email</span>
            <input type="email" className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" value={formCreate.email} onChange={(e) => setFormCreate({ ...formCreate, email: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Mật khẩu</span>
            <input type="password" className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" value={formCreate.password} onChange={(e) => setFormCreate({ ...formCreate, password: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Vai trò</span>
            <select className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" value={formCreate.role} onChange={(e) => setFormCreate({ ...formCreate, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </AppModal>

      <AppModal
        open={!!modalEdit}
        onClose={() => setModalEdit(null)}
        title={`Phân quyền · ${modalEdit?.email || ''}`}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-xl border px-4 py-2 text-sm font-bold dark:border-slate-600" onClick={() => setModalEdit(null)}>
              Đóng
            </button>
            <button type="button" className="rounded-xl bg-navy-900 px-5 py-2 text-sm font-bold text-white dark:bg-white dark:text-navy-900" onClick={saveEdit}>
              Lưu
            </button>
          </div>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Tên</span>
            <input className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" value={formEdit.name} onChange={(e) => setFormEdit({ ...formEdit, name: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Email</span>
            <input type="email" className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" value={formEdit.email} onChange={(e) => setFormEdit({ ...formEdit, email: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Vai trò</span>
            <select className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" value={formEdit.role} onChange={(e) => setFormEdit({ ...formEdit, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Mật khẩu mới (để trống nếu không đổi)</span>
            <input type="password" className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" value={formEdit.password} onChange={(e) => setFormEdit({ ...formEdit, password: e.target.value })} />
          </label>
        </div>
      </AppModal>
    </div>
  );
}

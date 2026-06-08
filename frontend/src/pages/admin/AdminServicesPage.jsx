import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Search, Trash2, Utensils } from 'lucide-react';
import api from '../../services/api';
import AppModal from '../../components/admin/AppModal';

export default function AdminServicesPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 12;
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState({ name: '', price: '', description: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/services', { params: { search: search.trim() || undefined, page, limit } });
      setItems(data.services || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Không tải dịch vụ');
    } finally {
      setLoading(false);
    }
  }, [limit, page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const save = async () => {
    try {
      if (!form.name.trim()) {
        toast.error('Nhập tên dịch vụ');
        return;
      }
      const payload = { name: form.name.trim(), price: Number(form.price) || 0, description: form.description || '' };
      if (modal.editing) {
        await api.put(`/services/${modal.editing.id}`, payload);
        toast.success('Đã cập nhật');
      } else {
        await api.post('/services', payload);
        toast.success('Đã thêm dịch vụ');
      }
      setModal({ open: false, editing: null });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lưu thất bại');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Xóa dịch vụ này?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Đã xóa');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không xóa được');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Dịch vụ</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Utensils className="h-4 w-4 text-gold-500" />
            Buffet, spa, gym, đưa đón sân bay — CRUD và giá cố định.
          </p>
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
              placeholder="Tìm tên hoặc mô tả…"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setForm({ name: '', price: '', description: '' });
              setModal({ open: true, editing: null });
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-navy-900"
          >
            <Plus className="h-4 w-4" /> Thêm dịch vụ
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900/70">
        <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Tên</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Giá</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Mô tả</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} className="p-4">
                    <div className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                  </td>
                </tr>
              ))
            ) : (
              items.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-navy-900 dark:text-white">{s.name}</td>
                  <td className="px-4 py-3 text-right font-medium">{Number(s.price || 0).toLocaleString('vi-VN')} ₫</td>
                  <td className="max-w-md truncate px-4 py-3 text-slate-600 dark:text-slate-300">{s.description || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 p-2 dark:border-slate-600"
                        onClick={() => {
                          setForm({ name: s.name, price: String(s.price), description: s.description || '' });
                          setModal({ open: true, editing: s });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" className="rounded-lg border border-rose-200 p-2 text-rose-600" onClick={() => remove(s.id)}>
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
            <button type="button" disabled={page <= 1} className="rounded-xl border px-4 py-2 disabled:opacity-40 dark:border-slate-600" onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <button type="button" disabled={page >= pages} className="rounded-xl border px-4 py-2 disabled:opacity-40 dark:border-slate-600" onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>

      <AppModal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Sửa dịch vụ' : 'Dịch vụ mới'}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-xl border px-4 py-2 dark:border-slate-600" onClick={() => setModal({ open: false, editing: null })}>
              Hủy
            </button>
            <button type="button" className="rounded-xl bg-navy-900 px-5 py-2 text-sm font-bold text-white dark:bg-white dark:text-navy-900" onClick={save}>
              Lưu
            </button>
          </div>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Tên</span>
            <input className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Giá (₫)</span>
            <input type="number" min={0} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Mô tả</span>
            <textarea rows={3} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
        </div>
      </AppModal>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { History, Plus, Search, Trash2, UserRound, Pencil } from 'lucide-react';
import api from '../../services/api';
import AppModal from '../../components/admin/AppModal';
import clsx from 'clsx';
import { formatDateRange } from '../../utils/dateFormat';

export default function AdminCustomersPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 12;

  const [modalForm, setModalForm] = useState({ open: false, editing: null });
  const [form, setForm] = useState({ name: '', email: '', phone: '', id_card: '', address: '' });

  const [histOpen, setHistOpen] = useState(false);
  const [histCust, setHistCust] = useState(null);
  const [histRows, setHistRows] = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/customers', { params: { search: search.trim() || undefined, page, limit } });
      setItems(data.customers || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Không tải được khách hàng');
    } finally {
      setLoading(false);
    }
  }, [limit, page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const openCreate = () => {
    setForm({ name: '', email: '', phone: '', id_card: '', address: '' });
    setModalForm({ open: true, editing: null });
  };

  const openEdit = (c) => {
    setForm({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      id_card: c.id_card || '',
      address: c.address || '',
    });
    setModalForm({ open: true, editing: c });
  };

  const save = async () => {
    try {
      if (!form.name.trim() || !form.email.trim()) {
        toast.error('Tên và email là bắt buộc');
        return;
      }
      if (modalForm.editing) {
        await api.put(`/customers/${modalForm.editing.id}`, form);
        toast.success('Đã cập nhật khách');
      } else {
        await api.post('/customers', form);
        toast.success('Đã thêm khách');
      }
      setModalForm({ open: false, editing: null });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lưu thất bại');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Xóa khách hàng này?')) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Đã xóa');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không xóa được');
    }
  };

  const openHistory = async (c) => {
    setHistCust(c);
    setHistOpen(true);
    setHistLoading(true);
    setHistRows([]);
    try {
      const { data } = await api.get('/bookings', { params: { customer_id: c.id, limit: 50, page: 1 } });
      setHistRows(data.bookings || []);
    } catch {
      toast.error('Không tải lịch sử booking');
    } finally {
      setHistLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Khách hàng</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Hồ sơ, CCCD/CMND, lịch sử booking.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm dark:border-slate-600 dark:bg-slate-900"
              placeholder="Tìm tên, email, SĐT, CCCD…"
            />
          </div>
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-navy-900">
            <Plus className="h-4 w-4" /> Thêm khách
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Khách</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Điện thoại</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">CMND/CCCD</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="p-4">
                      <div className="h-11 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                    </td>
                  </tr>
                ))
              ) : (
                items.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-semibold text-navy-900 dark:text-white">
                        <UserRound className="h-4 w-4 text-gold-500" />
                        {c.name}
                      </div>
                      <p className="truncate text-[11px] text-slate-500">{c.address || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.email}</td>
                    <td className="px-4 py-3">{c.phone || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{c.id_card || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" className="rounded-lg border border-slate-200 p-2 dark:border-slate-600" title="Lịch sử" onClick={() => openHistory(c)}>
                          <History className="h-4 w-4" />
                        </button>
                        <button type="button" className="rounded-lg border border-slate-200 p-2 dark:border-slate-600" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" className="rounded-lg border border-rose-200 p-2 text-rose-600" onClick={() => remove(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex justify-end gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
            <button type="button" disabled={page <= 1} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40 dark:border-slate-600" onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span className="flex items-center text-sm">{page}/{pages}</span>
            <button type="button" disabled={page >= pages} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40 dark:border-slate-600" onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>

      <AppModal
        open={modalForm.open}
        onClose={() => setModalForm({ open: false, editing: null })}
        title={modalForm.editing ? 'Sửa khách hàng' : 'Thêm khách hàng'}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-xl border px-4 py-2 dark:border-slate-600" onClick={() => setModalForm({ open: false, editing: null })}>
              Hủy
            </button>
            <button type="button" className="rounded-xl bg-navy-900 px-5 py-2 text-sm font-bold text-white dark:bg-white dark:text-navy-900" onClick={save}>
              Lưu
            </button>
          </div>
        }
        size="lg"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Họ tên</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Điện thoại</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">CMND / CCCD</span>
            <input value={form.id_card} onChange={(e) => setForm({ ...form, id_card: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className={clsx('grid gap-1 text-sm sm:col-span-2')}>
            <span className="font-semibold">Địa chỉ</span>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" />
          </label>
        </div>
      </AppModal>

      <AppModal
        open={histOpen}
        onClose={() => setHistOpen(false)}
        title={histCust ? `Lịch sử booking — ${histCust.name}` : ''}
        size="xl"
      >
        {histLoading ? (
          <p className="text-sm text-slate-500">Đang tải…</p>
        ) : histRows.length === 0 ? (
          <p className="text-sm text-slate-500">Không có booking.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 text-left font-bold">Mã</th>
                  <th className="py-2 text-left font-bold">Phòng</th>
                  <th className="py-2 text-left font-bold">Check-in → out</th>
                  <th className="py-2 text-right font-bold">Tổng</th>
                  <th className="py-2 text-left font-bold">TT</th>
                </tr>
              </thead>
              <tbody>
                {histRows.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 font-mono font-bold">BK-{String(b.id).padStart(4, '0')}</td>
                    <td className="py-2">{b.room_number}</td>
                    <td className="py-2 text-slate-600 dark:text-slate-400">
                      {formatDateRange(b.check_in_date, b.check_out_date)}
                    </td>
                    <td className="py-2 text-right font-medium">{Number(b.total_price).toLocaleString('vi-VN')} ₫</td>
                    <td className="py-2">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AppModal>
    </div>
  );
}

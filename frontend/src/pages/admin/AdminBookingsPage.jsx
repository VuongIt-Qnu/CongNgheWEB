import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Ban,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  ClipboardList,
  Pencil,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import api from '../../services/api';
import AppModal from '../../components/admin/AppModal';
import { BOOKING_STATUS_OPTIONS, bookingStatusLabel, bookingStatusBadgeClass, displayRoomName } from '../../constants/labels';
import VnDateInput from '../../components/common/VnDateInput';
import { formatDate, isCheckOutAfterCheckIn } from '../../utils/dateFormat';
export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState({
    customer_id: '',
    room_id: '',
    check_in_date: '',
    check_out_date: '',
    status: 'confirmed',
    total_price: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('/rooms', { params: { limit: 300, page: 1 } }),
      api.get('/customers', { params: { limit: 400, page: 1 } }),
    ])
      .then(([rR, rC]) => {
        setRooms(rR.data.rooms || []);
        setCustomers(rC.data.customers || []);
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bookings', {
        params: {
          search: search.trim() || undefined,
          status: status || undefined,
          from: from || undefined,
          to: to || undefined,
          page,
          limit,
        },
      });
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không tải booking');
    } finally {
      setLoading(false);
    }
  }, [from, limit, page, search, status, to]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const openCreate = () => {
    setForm({
      customer_id: customers[0]?.id ? String(customers[0].id) : '',
      room_id: rooms[0]?.id ? String(rooms[0].id) : '',
      check_in_date: '',
      check_out_date: '',
      status: 'confirmed',
      total_price: '',
    });
    setModal({ open: true, editing: null });
  };

  const openEdit = (b) => {
    setForm({
      customer_id: String(b.customer_id),
      room_id: String(b.room_id),
      check_in_date: b.check_in_date?.slice(0, 10) || '',
      check_out_date: b.check_out_date?.slice(0, 10) || '',
      status: b.status,
      total_price: String(b.total_price ?? ''),
    });
    setModal({ open: true, editing: b });
  };

  const save = async () => {
    try {
      if (!form.customer_id || !form.room_id || !form.check_in_date || !form.check_out_date) {
        toast.error('Chọn khách, phòng và khoảng ngày');
        return;
      }
      if (!isCheckOutAfterCheckIn(form.check_in_date, form.check_out_date)) {
        toast.error('Check-out phải sau check-in');
        return;
      }
      if (modal.editing) {
        await api.put(`/bookings/${modal.editing.id}`, {
          customer_id: Number(form.customer_id),
          room_id: Number(form.room_id),
          check_in_date: form.check_in_date,
          check_out_date: form.check_out_date,
          status: form.status,
          total_price: Number(form.total_price) || Number(modal.editing.total_price) || 0,
        });
        toast.success('Đã cập nhật booking');
      } else {
        await api.post('/bookings', {
          customer_id: Number(form.customer_id),
          room_id: Number(form.room_id),
          check_in_date: form.check_in_date,
          check_out_date: form.check_out_date,
          status: form.status,
        });
        toast.success('Đã tạo booking');
      }
      setModal({ open: false, editing: null });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lưu thất bại');
    }
  };

  const confirmBooking = async (b) => {
    try {
      await api.put(`/bookings/${b.id}`, {
        customer_id: b.customer_id,
        room_id: b.room_id,
        check_in_date: b.check_in_date,
        check_out_date: b.check_out_date,
        status: 'confirmed',
        total_price: Number(b.total_price || 0),
      });
      toast.success('Đã xác nhận');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Thất bại');
    }
  };

  const doCheckIn = async (id) => {
    try {
      await api.post(`/bookings/${id}/check-in`);
      toast.success('Check-in thành công');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Check-in thất bại');
    }
  };

  const doCheckOut = async (id) => {
    try {
      await api.post(`/bookings/${id}/check-out`);
      toast.success('Check-out thành công · phòng trả về Available');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Check-out thất bại');
    }
  };

  const doCancel = async (id) => {
    if (!window.confirm('Hủy booking này?')) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      toast.success('Đã hủy booking');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Hủy thất bại');
    }
  };

  const money = (n) =>
    `${Number(n || 0).toLocaleString('vi-VN', { minimumFractionDigits: 0 })} ₫`;

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">Quản lý booking</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <ClipboardList className="h-4 w-4 text-gold-500" />
            Theo dõi lifecycle: xác nhận, check-in, check-out, hủy.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Mã BK, khách, phòng…"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm font-medium outline-none ring-gold-500/25 focus:ring-2 dark:border-slate-600 dark:bg-slate-900"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium dark:border-slate-600 dark:bg-slate-900"
          >
            {BOOKING_STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <VnDateInput
            value={from}
            onChange={(v) => {
              setFrom(v);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 py-2 pl-9 pr-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <VnDateInput
            value={to}
            onChange={(v) => {
              setTo(v);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 py-2 pl-9 pr-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <button
            type="button"
            onClick={load}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Làm mới"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-soft dark:bg-white dark:text-navy-900"
          >
            <Plus className="h-4 w-4" />
            Tạo booking
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Mã</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Khách</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Phòng</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Check-in</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Check-out</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Tổng tiền</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">TT</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="p-4">
                      <div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                    </td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-sm text-slate-500">
                    Không có booking phù hợp.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="transition hover:bg-slate-50/90 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-navy-900 dark:text-white">BK-{String(b.id).padStart(4, '0')}</td>
                    <td className="px-4 py-3 font-medium">{b.customer_name || '—'}</td>
                    <td className="px-4 py-3">{b.room_number || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(b.check_in_date)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(b.check_out_date)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{money(b.total_price)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${bookingStatusBadgeClass(b.status)}`}>{bookingStatusLabel(b.status)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        {String(b.status).toLowerCase() === 'pending' && (
                          <button
                            type="button"
                            title="Xác nhận"
                            onClick={() => confirmBooking(b)}
                            className="rounded-lg border border-emerald-200 p-2 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(String(b.status).toLowerCase()) && (
                          <button
                            type="button"
                            title="Check-in"
                            onClick={() => doCheckIn(b.id)}
                            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
                          >
                            <CalendarCheck className="h-4 w-4" />
                          </button>
                        )}
                        {String(b.status).toLowerCase() === 'occupied' && (
                          <button
                            type="button"
                            title="Check-out"
                            onClick={() => doCheckOut(b.id)}
                            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
                          >
                            <CalendarX className="h-4 w-4" />
                          </button>
                        )}
                        {!['completed', 'cancelled'].includes(String(b.status).toLowerCase()) && (
                          <button
                            type="button"
                            title="Hủy"
                            onClick={() => doCancel(b.id)}
                            className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        <button type="button" title="Sửa" onClick={() => openEdit(b)} className="rounded-lg border border-slate-200 p-2 dark:border-slate-600">
                          <Pencil className="h-4 w-4" />
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
            <button
              type="button"
              disabled={page <= 1}
              className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40 dark:border-slate-600"
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </button>
            <span className="flex items-center px-2 text-sm text-slate-600 dark:text-slate-400">
              {page} / {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40 dark:border-slate-600"
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      <AppModal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? `Sửa BK-${modal.editing.id}` : 'Tạo booking mới'}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-xl border px-5 py-2.5 text-sm font-bold dark:border-slate-600" onClick={() => setModal({ open: false, editing: null })}>
              Đóng
            </button>
            <button type="button" className="rounded-xl bg-navy-900 px-6 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-navy-900" onClick={save}>
              Lưu
            </button>
          </div>
        }
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Khách hàng</span>
            <select
              value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.email}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Phòng</span>
            <select
              value={form.room_id}
              onChange={(e) => setForm({ ...form, room_id: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.room_number} · {r.room_type_name || r.type} · {Number(r.price).toLocaleString('vi-VN')}₫
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Check-in</span>
            <VnDateInput value={form.check_in_date} onChange={(check_in_date) => setForm({ ...form, check_in_date })} className="rounded-xl border px-3 py-2 pl-9 dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Check-out</span>
            <VnDateInput value={form.check_out_date} min={form.check_in_date || undefined} onChange={(check_out_date) => setForm({ ...form, check_out_date })} className="rounded-xl border px-3 py-2 pl-9 dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Trạng thái</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950">
              {BOOKING_STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {modal.editing && (
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Tổng tiền (điều chỉnh)</span>
              <input type="number" min={0} value={form.total_price} onChange={(e) => setForm({ ...form, total_price: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" />
            </label>
          )}
        </div>
        {!modal.editing && (
          <p className="mt-3 text-xs text-slate-500">Tổng tiền sẽ tự tính theo số đêm × giá phòng sau khi tạo. Bạn có thể chỉnh sau khi sửa booking.</p>
        )}
      </AppModal>
    </section>
  );
}

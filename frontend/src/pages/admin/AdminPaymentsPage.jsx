import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
  Search, Filter, Plus, Edit2, RotateCcw, Trash2, Eye, Calendar,
  TrendingUp, CircleDollarSign, CheckCircle2, XCircle, RefreshCcw, Loader2, Info, Check, Ban
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { paymentStatusLabel, paymentMethodLabel, isPaidPaymentStatus, isAwaitingPaymentStatus } from '../../constants/labels';
import api from '../../services/api';
import dayjs from 'dayjs';
import {
  formatDate,
  formatDateTime,
  formatDateRange,
  formatChartDayLabel,
  isoDatePart,
  localTodayISO,
  currentMonthKey,
} from '../../utils/dateFormat';

// Register Chart.js elements
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler
);

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]); // List of bookings for creation form
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);

  // Form States
  const [formBookingId, setFormBookingId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState('credit_card');
  const [formStatus, setFormStatus] = useState('pending');
  const [formNotes, setFormNotes] = useState('');
  const [submittingForm, setSubmittingForm] = useState(false);

  // Refund Form States
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments', {
        params: {
          search: search.trim() || undefined,
          payment_status: statusFilter || undefined,
          payment_method: methodFilter || undefined,
          page,
          limit
        }
      });
      setPayments(response.data.payments || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      // Tải danh sách bookings chưa thanh toán để gán cho Form tạo mới
      const response = await api.get('/bookings', { params: { limit: 100 } });
      const rows = response.data.bookings || [];
      // Lọc ra bookings chưa được thanh toán thành công (hoặc pending)
      const unpaid = rows.filter((b) => !isPaidPaymentStatus(b.payment_status) && b.payment_status !== 'refunded');
      setBookings(unpaid);
    } catch (err) {
      console.error('Không tải được danh sách bookings');
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search, statusFilter, methodFilter]);

  useEffect(() => {
    if (showAddModal) {
      loadBookings();
    }
  }, [showAddModal]);

  // Tự động điền số tiền booking khi chọn trong Form thêm mới
  useEffect(() => {
    if (formBookingId) {
      const selected = bookings.find(b => b.id === Number(formBookingId));
      if (selected) {
        setFormAmount(selected.total_price);
      }
    }
  }, [formBookingId, bookings]);

  // ── THỐNG KÊ DOANH THU REALTIME TỪ CƠ SỞ DỮ LIỆU THANH TOÁN ──
  const stats = useMemo(() => {
    let grandTotal = 0;
    let todayTotal = 0;
    let monthTotal = 0;
    let successCount = 0;
    let failedCount = 0;
    let refundedCount = 0;

    const todayStr = localTodayISO();
    const monthStr = currentMonthKey();

    payments.forEach(p => {
      const isPaid = p.payment_status === 'paid' || p.payment_status === 'completed';
      const createdDate = isoDatePart(p.created_at);
      const createdMonth = p.created_at ? String(p.created_at).slice(0, 7) : '';

      if (isPaid) {
        grandTotal += p.amount;
        if (createdDate === todayStr) todayTotal += p.amount;
        if (createdMonth === monthStr) monthTotal += p.amount;
        successCount++;
      } else if (p.payment_status === 'failed') {
        failedCount++;
      } else if (p.payment_status === 'refunded') {
        refundedCount++;
      }
    });

    return { grandTotal, todayTotal, monthTotal, successCount, failedCount, refundedCount };
  }, [payments]);

  // ── DỮ LIỆU BIỂU ĐỒ DOANH THU ──
  const chartData = useMemo(() => {
    // Nhóm doanh thu theo ngày (7 ngày gần nhất)
    const days = [];
    const dailyRevenues = [];
    for (let i = 6; i >= 0; i--) {
      const dStr = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      days.push(formatChartDayLabel(dStr));

      let sum = 0;
      payments.forEach(p => {
        if ((p.payment_status === 'paid' || p.payment_status === 'completed') && p.created_at && isoDatePart(p.created_at) === dStr) {
          sum += p.amount;
        }
      });
      dailyRevenues.push(sum);
    }

    return {
      labels: days,
      datasets: [
        {
          label: 'Doanh thu (₫)',
          data: dailyRevenues,
          backgroundColor: 'rgba(198, 169, 106, 0.2)', // Tone Gold mờ
          borderColor: '#c6a96a', // Tone Gold
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#0a1a36',
          pointBorderColor: '#c6a96a',
          pointHoverRadius: 6
        }
      ]
    };
  }, [payments]);

  // ── HÀNH ĐỘNG GIAO DỊCH ──

  // 1. Tạo mới thanh toán
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!formBookingId || !formAmount || Number(formAmount) <= 0) {
      toast.error('Vui lòng chọn đặt phòng và nhập số tiền lớn hơn 0');
      return;
    }

    try {
      setSubmittingForm(true);
      await api.post('/payments', {
        booking_id: Number(formBookingId),
        amount: Number(formAmount),
        payment_method: formMethod,
        payment_status: formStatus,
        notes: formNotes
      });

      toast.success('Thêm mới giao dịch thanh toán thành công!');
      setShowAddModal(false);
      // Reset forms
      setFormBookingId('');
      setFormAmount('');
      setFormNotes('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tạo mới thanh toán');
    } finally {
      setSubmittingForm(false);
    }
  };

  // 2. Chỉnh sửa trạng thái thanh toán
  const handleEditPayment = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    try {
      setSubmittingForm(true);
      await api.put(`/payments/${selectedPayment.id}`, {
        payment_status: formStatus,
        payment_method: formMethod,
        notes: formNotes
      });

      toast.success('Cập nhật giao dịch thành công!');
      setShowEditModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật thanh toán');
    } finally {
      setSubmittingForm(false);
    }
  };

  // 3. Xác nhận thanh toán (Approve)
  const handleApprovePayment = async (payment) => {
    if (!window.confirm(`Xác nhận giao dịch PT-${String(payment.id).padStart(4, '0')} đã thanh toán thành công?`)) return;

    try {
      await api.post(`/payments/${payment.id}/approve`);
      toast.success('Đã xác nhận thanh toán thành công!');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xác nhận thanh toán');
    }
  };

  // 4. Từ chối thanh toán (Reject)
  const handleRejectPayment = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    try {
      setSubmittingForm(true);
      await api.post(`/payments/${selectedPayment.id}/reject`, {
        reason: rejectReason.trim() || 'Giao dịch không hợp lệ hoặc chưa nhận được tiền',
      });
      toast.success('Đã từ chối giao dịch thanh toán');
      setShowRejectModal(false);
      setRejectReason('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể từ chối thanh toán');
    } finally {
      setSubmittingForm(false);
    }
  };

  // 5. Hoàn tiền (Refund)
  const handleRefund = async (e) => {
    e.preventDefault();
    if (!selectedPayment || !refundReason.trim()) return;

    try {
      setSubmittingForm(true);
      await api.post(`/payments/${selectedPayment.id}/refund`, {
        amount: refundAmount ? Number(refundAmount) : selectedPayment.amount,
        reason: refundReason
      });

      toast.success('Xử lý hoàn tiền thành công!');
      setShowRefundModal(false);
      setRefundReason('');
      setRefundAmount('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xử lý hoàn tiền');
    } finally {
      setSubmittingForm(false);
    }
  };

  // 4. Xóa thanh toán
  const handleDeletePayment = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giao dịch thanh toán này khỏi cơ sở dữ liệu?')) return;

    try {
      await api.delete(`/payments/${id}`);
      toast.success('Đã xóa giao dịch thành công');
      loadData();
    } catch (err) {
      toast.error('Không thể xóa thanh toán');
    }
  };

  const openEdit = (p) => {
    setSelectedPayment(p);
    setFormStatus(p.payment_status);
    setFormMethod(p.payment_method);
    setFormNotes(p.notes || '');
    setShowEditModal(true);
  };

  const openRefund = (p) => {
    setSelectedPayment(p);
    setRefundAmount(p.amount);
    setRefundReason('');
    setShowRefundModal(true);
  };

  const openDetail = async (p) => {
    try {
      const response = await api.get(`/payments/${p.id}`);
      setSelectedPayment(response.data);
      setShowDetailModal(true);
    } catch (err) {
      toast.error('Không tải được chi tiết giao dịch');
    }
  };

  const openReject = (p) => {
    setSelectedPayment(p);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Render Label cho Phương thức
  const methodLabel = (m) => paymentMethodLabel(m);

  // Render Label cho Trạng thái
  const renderStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    if (isPaidPaymentStatus(s)) {
      return (
        <span className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/30 uppercase tracking-wide">
          {paymentStatusLabel(s)}
        </span>
      );
    }
    if (s === 'processing') {
      return (
        <span className="inline-flex rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300 ring-1 ring-blue-500/30 uppercase tracking-wide">
          {paymentStatusLabel(s)}
        </span>
      );
    }
    if (s === 'failed') {
      return (
        <span className="inline-flex rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:text-rose-300 ring-1 ring-rose-500/30 uppercase tracking-wide">
          {paymentStatusLabel(s)}
        </span>
      );
    }
    if (s === 'refunded') {
      return (
        <span className="inline-flex rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] font-bold text-slate-800 dark:text-slate-300 ring-1 ring-slate-500/30 uppercase tracking-wide">
          {paymentStatusLabel(s)}
        </span>
      );
    }
    return (
      <span className="inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/30 uppercase tracking-wide">
        {paymentStatusLabel(s)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif tracking-wide text-navy-900 dark:text-white uppercase">Quản lý Thanh toán</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-semibold">
            Đối soát giao dịch, theo dõi doanh thu và xử lý hoàn trả đặt phòng.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-navy-800 shadow-md"
        >
          <Plus className="h-4 w-4" />
          Tạo thanh toán thủ công
        </button>
      </div>

      {/* DASHBOARD THỐNG KÊ DOANH THU */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {[
          { label: 'Tổng doanh thu', val: stats.grandTotal, icon: CircleDollarSign, color: 'text-gold-600 bg-gold-500/10' },
          { label: 'Doanh thu hôm nay', val: stats.todayTotal, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-500/10' },
          { label: 'Doanh thu tháng này', val: stats.monthTotal, icon: Calendar, color: 'text-blue-600 bg-blue-500/10' },
          { label: 'Giao dịch thành công', val: stats.successCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10', noFormat: true },
          { label: 'Giao dịch thất bại', val: stats.failedCount, icon: XCircle, color: 'text-rose-600 bg-rose-500/10', noFormat: true },
          { label: 'Giao dịch hoàn tiền', val: stats.refundedCount, icon: RefreshCcw, color: 'text-slate-600 bg-slate-500/10', noFormat: true }
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</span>
                <span className={`rounded-xl p-1.5 ${c.color}`}><Icon className="h-4 w-4" /></span>
              </div>
              <p className="text-lg font-bold text-navy-950 dark:text-white mt-3 font-mono">
                {c.noFormat ? c.val : `${Number(c.val).toLocaleString('vi-VN')} ₫`}
              </p>
            </div>
          );
        })}
      </div>

      {/* BIỂU ĐỒ DOANH THU THEO NGÀY (7 NGÀY GẦN NHẤT) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-serif text-sm font-bold text-navy-900 dark:text-white uppercase mb-4 tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-gold-600" />
            Biểu đồ doanh thu tuần này
          </h3>
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { grid: { color: 'rgba(226, 232, 240, 0.4)' }, ticks: { font: { size: 9, family: 'monospace' } } },
                  x: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' } } }
                }
              }}
            />
          </div>
        </div>

        {/* MẸO HƯỚNG DẪN ADMIN */}
        <div className="rounded-2xl border border-slate-200/80 bg-navy-950 p-6 text-white shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-sm font-bold text-gold-500 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-4 w-4" />
              Chính sách & Quy định
            </h3>
            <p className="text-[11px] text-slate-300 mt-3 leading-relaxed font-semibold">
              · **Xác nhận thanh toán**: Chỉ chuyển sang <span className="text-emerald-400 font-bold">Đã thanh toán</span> khi admin xác nhận đã nhận tiền. Booking sẽ tự động chuyển sang Confirmed sau khi duyệt.<br /><br />
              · **Hoàn tiền một phần**: Áp dụng khi khách hàng muốn giảm bớt dịch vụ hoặc thanh toán thừa. Nhập số tiền cụ thể để hoàn.
            </p>
          </div>
          <div className="mt-6 border-t border-slate-800 pt-4 text-[10px] text-slate-400 font-bold">
            AURORA HOTEL SECURITY & REVENUE SYSTEM
          </div>
        </div>
      </div>

      {/* DANH SÁCH & BỘ LỌC */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        {/* Bộ lọc thanh */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Mã booking, khách hàng, số phòng…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-semibold outline-none ring-gold-500/20 focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="processing">Đang xử lý</option>
              <option value="paid">Đã thanh toán</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Tất cả phương thức</option>
              <option value="credit_card">Thẻ tín dụng</option>
              <option value="bank_transfer">Chuyển khoản</option>
              <option value="momo">Momo</option>
              <option value="vnpay">VNPay</option>
              <option value="zalopay">ZaloPay</option>
              <option value="cash">Tại quầy</option>
            </select>
          </div>
        </div>

        {/* Bảng Dữ liệu */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs font-semibold dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Mã TT</th>
                <th className="px-4 py-3 text-left font-bold">Booking</th>
                <th className="px-4 py-3 text-left font-bold">Khách hàng</th>
                <th className="px-4 py-3 text-left font-bold">Phòng</th>
                <th className="px-4 py-3 text-right font-bold">Số tiền (₫)</th>
                <th className="px-4 py-3 text-left font-bold">Phương thức</th>
                <th className="px-4 py-3 text-left font-bold">Trạng thái</th>
                <th className="px-4 py-3 text-left font-bold">Ngày TT</th>
                <th className="px-4 py-3 text-center font-bold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-slate-700 dark:text-slate-200">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={9} className="px-4 py-3.5">
                      <div className="h-6 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                    </td>
                  </tr>
                ))
              ) : payments.length ? (
                payments.map((p) => {
                  const pStatus = String(p.payment_status).toLowerCase();
                  const isPaid = isPaidPaymentStatus(pStatus);
                  const canReview = isAwaitingPaymentStatus(pStatus);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                      <td className="px-4 py-3 font-mono font-bold text-navy-900 dark:text-white">PT-{String(p.id).padStart(4, '0')}</td>
                      <td className="px-4 py-3 font-mono font-bold">BK-{String(p.booking_id).padStart(4, '0')}</td>
                      <td className="px-4 py-3 font-bold text-navy-950 dark:text-slate-100">{p.customer_name || 'Khách lẻ'}</td>
                      <td className="px-4 py-3 font-bold text-navy-900 dark:text-slate-200">Phòng {p.room_number || '—'}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">{Number(p.amount).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3 font-bold uppercase">{methodLabel(p.payment_method)}</td>
                      <td className="px-4 py-3">{renderStatusBadge(p.payment_status)}</td>
                      <td className="px-4 py-3 font-medium text-slate-500">{formatDateTime(p.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            title="Xem chi tiết"
                            onClick={() => openDetail(p)}
                            className="rounded-lg p-1.5 text-navy-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Chỉnh sửa"
                            onClick={() => openEdit(p)}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/25"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {canReview && (
                            <>
                              <button
                                title="Xác nhận thanh toán"
                                onClick={() => handleApprovePayment(p)}
                                className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/25"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                title="Từ chối thanh toán"
                                onClick={() => openReject(p)}
                                className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/25"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {isPaid && (
                            <button
                              title="Hoàn tiền"
                              onClick={() => openRefund(p)}
                              className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/25"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            title="Xóa"
                            onClick={() => handleDeletePayment(p.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500 font-bold">
                    Không có giao dịch thanh toán nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {!loading && total > limit && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800 text-xs font-bold text-slate-500">
            <p>
              Hiển thị <span className="text-navy-900 dark:text-white">{payments.length}</span> / {total} giao dịch
            </p>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-200 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
              >
                Trước
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage(p => p + 1)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: TẠO MỚI THANH TOÁN THỦ CÔNG ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-luxury dark:bg-slate-900">
            <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white uppercase mb-4">Tạo thanh toán thủ công</h3>
            
            <form onSubmit={handleAddPayment} className="space-y-4 text-slate-700 dark:text-slate-200">
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Chọn Booking chưa thanh toán</span>
                <select
                  value={formBookingId}
                  onChange={(e) => setFormBookingId(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">-- Chọn Đặt phòng --</option>
                  {bookings.map(b => (
                    <option key={b.id} value={b.id}>
                      BK-{String(b.id).padStart(4, '0')} (Khách: {b.customer_name} - Phòng {b.room_number})
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Số tiền (₫)</span>
                <input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  required
                  placeholder="2000000"
                  className={inputClass}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Phương thức</span>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value)}
                    className={inputClass}
                  >
                    <option value="credit_card">Thẻ tín dụng</option>
                    <option value="bank_transfer">Chuyển khoản</option>
                    <option value="cash">Tại quầy (Tiền mặt)</option>
                    <option value="momo">Momo</option>
                    <option value="vnpay">VNPay</option>
                    <option value="zalopay">ZaloPay</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Trạng thái</span>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className={inputClass}
                  >
                    <option value="pending">Chờ thanh toán (Pending)</option>
                    <option value="processing">Đang xử lý (Processing)</option>
                    <option value="paid">Đã thanh toán (Paid)</option>
                    <option value="failed">Thất bại (Failed)</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Ghi chú giao dịch</span>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ghi chú thêm thông tin đối soát..."
                  className={inputClass}
                />
              </label>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="inline-flex items-center gap-1 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-navy-800 disabled:opacity-50"
                >
                  {submittingForm && <Loader2 className="h-3 w-3 animate-spin" />}
                  Lưu giao dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CHỈNH SỬA THANH TOÁN ── */}
      {showEditModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-luxury dark:bg-slate-900">
            <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white uppercase mb-4">Cập nhật Giao dịch</h3>
            <p className="text-[10px] font-bold text-slate-400 mb-4">Mã giao dịch: {selectedPayment.transaction_id}</p>

            <form onSubmit={handleEditPayment} className="space-y-4 text-slate-700 dark:text-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Phương thức</span>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value)}
                    className={inputClass}
                  >
                    <option value="credit_card">Thẻ tín dụng</option>
                    <option value="bank_transfer">Chuyển khoản</option>
                    <option value="cash">Tại quầy (Tiền mặt)</option>
                    <option value="momo">Momo</option>
                    <option value="vnpay">VNPay</option>
                    <option value="zalopay">ZaloPay</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Trạng thái</span>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className={inputClass}
                  >
                    <option value="pending">Chờ thanh toán (Pending)</option>
                    <option value="processing">Đang xử lý (Processing)</option>
                    <option value="paid">Đã thanh toán (Paid)</option>
                    <option value="failed">Thất bại (Failed)</option>
                    <option value="refunded">Đã hoàn tiền (Refunded)</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Ghi chú giao dịch</span>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className={inputClass}
                />
              </label>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="inline-flex items-center gap-1 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-navy-800 disabled:opacity-50"
                >
                  {submittingForm && <Loader2 className="h-3 w-3 animate-spin" />}
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: HOÀN TIỀN (REFUND) ── */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-luxury dark:bg-slate-900">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <RotateCcw className="h-5 w-5" />
              <h3 className="font-serif text-base font-bold uppercase">Hoàn trả Giao dịch (Refund)</h3>
            </div>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-4">
              Thực hiện hoàn trả tiền cho giao dịch <span className="font-mono font-bold text-navy-950 dark:text-white">PT-{String(selectedPayment.id).padStart(4, '0')}</span> của khách hàng <span className="font-bold text-navy-900 dark:text-gold-500">{selectedPayment.customer_name}</span>.
            </p>

            <form onSubmit={handleRefund} className="space-y-4 text-slate-700 dark:text-slate-200">
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Số tiền hoàn trả (₫)</span>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  required
                  max={selectedPayment.amount}
                  className={inputClass}
                />
                <span className="text-[10px] text-slate-400 font-bold mt-1">
                  * Tối đa có thể hoàn: {Number(selectedPayment.amount).toLocaleString('vi-VN')} ₫
                </span>
              </label>

              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Lý do hoàn trả tiền</span>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  required
                  placeholder="Lý do hoàn tiền (bắt buộc)..."
                  className={inputClass}
                />
              </label>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submittingForm || !refundReason.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  {submittingForm && <Loader2 className="h-3 w-3 animate-spin" />}
                  Xác nhận Hoàn tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: TỪ CHỐI THANH TOÁN (REJECT) ── */}
      {showRejectModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-luxury dark:bg-slate-900">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <Ban className="h-5 w-5" />
              <h3 className="font-serif text-base font-bold uppercase">Từ chối giao dịch</h3>
            </div>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-4">
              Từ chối giao dịch <span className="font-mono font-bold text-navy-950 dark:text-white">PT-{String(selectedPayment.id).padStart(4, '0')}</span>.
              Khách hàng có thể tạo yêu cầu thanh toán mới sau khi bị từ chối.
            </p>

            <form onSubmit={handleRejectPayment} className="space-y-4 text-slate-700 dark:text-slate-200">
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Lý do từ chối</span>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Chưa nhận được chuyển khoản, thông tin không khớp..."
                  className={inputClass}
                />
              </label>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  {submittingForm && <Loader2 className="h-3 w-3 animate-spin" />}
                  Từ chối thanh toán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CHI TIẾT THANH TOÁN (DETAIL MODAL) ── */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-luxury dark:bg-slate-900">
            <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white uppercase mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              Chi tiết giao dịch thanh toán
            </h3>

            <div className="grid grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thông tin Khách hàng</h4>
                <p>Họ tên: <span className="font-bold text-navy-950 dark:text-slate-100">{selectedPayment.customer_name || 'Khách lẻ'}</span></p>
                <p>Email: <span className="font-bold text-navy-950 dark:text-slate-100">{selectedPayment.customer_email || '—'}</span></p>
                <p>Số điện thoại: <span className="font-bold text-navy-950 dark:text-slate-100">{selectedPayment.customer_phone || '—'}</span></p>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thông tin Đặt phòng</h4>
                <p>Mã Booking: <span className="font-mono font-bold text-navy-900 dark:text-gold-500">BK-{String(selectedPayment.booking_id).padStart(4, '0')}</span></p>
                <p>Số phòng: <span className="font-bold text-navy-950 dark:text-slate-100">Phòng {selectedPayment.room_number || '—'}</span></p>
                <p>Thời gian: <span className="font-bold text-navy-950 dark:text-slate-100">{formatDateRange(selectedPayment.check_in_date, selectedPayment.check_out_date, ' đến ')}</span></p>
              </div>

              <div className="col-span-2 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thông tin giao dịch</h4>
                <div className="grid grid-cols-2 gap-4">
                  <p>Mã giao dịch: <span className="font-mono font-bold text-navy-950 dark:text-slate-100">{selectedPayment.transaction_id || '—'}</span></p>
                  <p>Số tiền: <span className="font-mono font-bold text-gold-600 text-sm">{Number(selectedPayment.amount).toLocaleString('vi-VN')} ₫</span></p>
                  <p>Phương thức: <span className="uppercase font-bold">{methodLabel(selectedPayment.payment_method)}</span></p>
                  <p>Trạng thái: <span>{renderStatusBadge(selectedPayment.payment_status)}</span></p>
                  <p>Ngày thanh toán: <span className="font-medium">{formatDateTime(selectedPayment.created_at)}</span></p>
                  <p>Lịch sử cập nhật: <span className="font-medium">{selectedPayment.updated_at ? formatDateTime(selectedPayment.updated_at) : 'Chưa cập nhật'}</span></p>
                </div>
              </div>

              {selectedPayment.notes && (
                <div className="col-span-2 space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ghi chú</h4>
                  <p className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                    {selectedPayment.notes}
                  </p>
                </div>
              )}

              {selectedPayment.payment_status === 'refunded' && (
                <div className="col-span-2 space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 bg-rose-500/5 p-3 rounded-xl border border-rose-500/20">
                  <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Thông tin Hoàn trả tiền (Refunded)</h4>
                  <p className="font-semibold text-rose-950 dark:text-rose-200">
                    Thời gian hoàn tiền: <span className="font-bold">{selectedPayment.refunded_at ? formatDateTime(selectedPayment.refunded_at) : '—'}</span>
                  </p>
                  <p className="font-semibold text-rose-950 dark:text-rose-200">
                    Lý do hoàn tiền: <span className="font-mono text-[11px] italic">"{selectedPayment.refund_reason || '—'}"</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-5 mt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

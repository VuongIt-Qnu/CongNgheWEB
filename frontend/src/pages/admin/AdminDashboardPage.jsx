import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { BedDouble, ClipboardList, Coins, DoorOpen, RefreshCw, Users as UsersIcon } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/admin/StatCard';
import clsx from 'clsx';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import { displayRoomName, bookingStatusLabel, bookingStatusBadgeClass } from '../../constants/labels';
import { formatDate, formatDateRange, formatMonthYear, formatChartDayLabel } from '../../utils/dateFormat';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

function dashCardOptions(dark) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: dark ? '#e2e8f0' : '#334155' } },
    },
    scales: dark
      ? {
          x: { ticks: { color: '#94a3b8' }, grid: { color: '#33415544' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: '#33415544' } },
        }
      : {
          x: { ticks: { color: '#64748b' }, grid: { color: '#e2e8f0' } },
          y: { ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' } },
        },
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const { dark } = useAdminTheme();

  const reload = () => {
    setLoading(true);
    setErr('');
    api
      .get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setErr('Không tải được dữ liệu dashboard.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const revLine = useMemo(() => {
    if (!data?.revenueByMonth) return null;
    return {
      labels: data.revenueByMonth.map((r) => formatMonthYear(r.ym)),
      datasets: [
        {
          label: 'Doanh thu booking (₫)',
          data: data.revenueByMonth.map((r) => Number(r.amount || 0)),
          fill: true,
          borderColor: '#c6a96a',
          backgroundColor: dark ? 'rgba(198,169,106,0.08)' : 'rgba(198,169,106,0.2)',
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    };
  }, [data, dark]);

  const bookBar = useMemo(() => {
    if (!data?.bookingsByDay) return null;
    return {
      labels: data.bookingsByDay.map((r) => formatChartDayLabel(r.day)),
      datasets: [
        {
          label: 'Số booking',
          data: data.bookingsByDay.map((r) => Number(r.count || 0)),
          backgroundColor: dark ? '#3b82f6aa' : '#1e3a8a99',
          borderRadius: 8,
        },
      ],
    };
  }, [data, dark]);

  const pieStatus = useMemo(() => {
    if (!data?.pieBookingsStatus) return null;
    return {
      labels: data.pieBookingsStatus.map((p) => p.label),
      datasets: [
        {
          data: data.pieBookingsStatus.map((p) => Number(p.count || 0)),
          backgroundColor: ['#0f172a', '#16a34a', '#ca8a04', '#dc2626', '#64748b'],
        },
      ],
    };
  }, [data]);

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900/50 dark:bg-rose-950/30">
        <p className="font-semibold text-rose-700 dark:text-rose-300">{err}</p>
        <button
          type="button"
          className="mt-4 rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white dark:bg-white dark:text-navy-900"
          onClick={reload}
        >
          Thử lại
        </button>
      </div>
    );
  }

  const s = data?.summary || {};

  const statGrid = (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Tổng phòng"
        value={s.totalRooms ?? 0}
        icon={BedDouble}
        delay={0}
        hint={`Trống ${s.availableRooms ?? 0} · Bận ${s.busyRooms ?? 0}`}
      />
      <StatCard title="Phòng đang ở" value={s.occupiedRooms ?? 0} icon={DoorOpen} accent="blue" delay={0.06} />
      <StatCard title="Tổng booking" value={s.totalBookings ?? 0} icon={ClipboardList} accent="rose" delay={0.1} />
      <StatCard title="Khách hàng" value={s.totalCustomers ?? 0} icon={UsersIcon} accent="emerald" delay={0.14} />
      <StatCard
        title="Doanh thu hôm nay"
        value={`${Number(s.revenueToday || 0).toLocaleString('vi-VN')} ₫`}
        icon={Coins}
        delay={0.18}
        accent="gold"
      />
      <StatCard
        title="Doanh thu tháng"
        value={`${Number(s.revenueMonth || 0).toLocaleString('vi-VN')} ₫`}
        icon={Coins}
        delay={0.22}
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white lg:text-3xl">Tổng quan vận hành</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Chỉ số theo thời gian thực, occupancy và dòng booking mới.
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          className={clsx(
            'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition',
            'border-slate-200 bg-white hover:border-gold-500/40 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-gold-500/35'
          )}
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới dữ liệu
        </button>
      </div>

      {statGrid}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800/60 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-navy-900 dark:text-white">Doanh thu theo tháng</h3>
          </div>
          <div className="h-[280px]">{revLine && <Line data={revLine} options={dashCardOptions(dark)} />}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800/60">
          <h3 className="mb-4 font-bold text-navy-900 dark:text-white">Trạng thái booking</h3>
          <div className="mx-auto h-[220px] max-w-[260px]">{pieStatus && <Pie data={pieStatus} options={dashCardOptions(dark)} />}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800/60">
        <h3 className="mb-4 font-bold text-navy-900 dark:text-white">Booking gần đây</h3>
        <div className="h-[280px]">{bookBar && <Bar data={bookBar} options={dashCardOptions(dark)} />}</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800/60">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-navy-900 dark:text-white">Booking mới</h3>
            <Link className="text-xs font-bold uppercase tracking-wider text-gold-600 hover:underline" to="/admin/bookings">
              Mở đầy đủ
            </Link>
          </div>
          <ul className="space-y-3">
            {(data?.recentBookings || []).slice(0, 8).map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2 text-sm dark:border-slate-700"
              >
                <div>
                  <p className="font-semibold text-navy-900 dark:text-white">
                    #{b.id} · {displayRoomName(b.room_number)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {b.customer_name} · {formatDateRange(b.check_in_date, b.check_out_date)}
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${bookingStatusBadgeClass(b.status)}`}>
                  {bookingStatusLabel(b.status)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800/60">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-navy-900 dark:text-white">Top phòng được đặt</h3>
            <Link className="text-xs font-bold uppercase tracking-wider text-gold-600 hover:underline" to="/admin/reports">
              Báo cáo
            </Link>
          </div>
          <ul className="space-y-2">
            {(data?.topRooms || []).map((r, i) => (
              <li
                key={r.room_id}
                className="flex items-center justify-between rounded-xl border border-slate-50 px-3 py-2 dark:border-slate-700/80"
              >
                <span className="text-sm font-semibold text-navy-900 dark:text-white">
                  {i + 1}. {displayRoomName(r.room_number)}
                  <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">({r.room_type_name})</span>
                </span>
                <span className="text-xs font-bold text-gold-600">{r.booking_count} lượt</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

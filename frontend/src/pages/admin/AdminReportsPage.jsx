import { useEffect, useMemo, useState } from 'react';
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
import { BarChart3, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import clsx from 'clsx';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import { formatMonthYear, formatChartDayLabel } from '../../utils/dateFormat';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

function chartOpts(dark) {
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

export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const { dark } = useAdminTheme();

  const load = () => {
    setLoading(true);
    setErr('');
    api
      .get('/dashboard')
      .then((r) => setData(r.data))
      .catch(() => setErr('Không tải được dữ liệu báo cáo.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const revLine = useMemo(() => {
    if (!data?.revenueByMonth) return null;
    return {
      labels: data.revenueByMonth.map((r) => formatMonthYear(r.ym)),
      datasets: [
        {
          label: 'Doanh thu ghi nhận (₫)',
          data: data.revenueByMonth.map((r) => Number(r.amount || 0)),
          fill: true,
          borderColor: '#c6a96a',
          backgroundColor: dark ? 'rgba(198,169,106,0.08)' : 'rgba(198,169,106,0.18)',
          tension: 0.35,
        },
      ],
    };
  }, [data, dark]);

  const bookingsBar = useMemo(() => {
    if (!data?.bookingsByDay) return null;
    return {
      labels: data.bookingsByDay.map((r) => formatChartDayLabel(r.day)),
      datasets: [
        {
          label: 'Booking theo ngày',
          data: data.bookingsByDay.map((r) => Number(r.count || 0)),
          backgroundColor: dark ? '#2563eb99' : '#1e40af88',
          borderRadius: 6,
        },
      ],
    };
  }, [data, dark]);

  const roomsPie = useMemo(() => {
    const tops = data?.topRooms?.slice(0, 8) || [];
    if (!tops.length) return null;
    return {
      labels: tops.map((t) => `Phòng ${t.room_number}`),
      datasets: [
        {
          data: tops.map((t) => Number(t.booking_count || 0)),
          backgroundColor: ['#0a1a36', '#c6a96a', '#1d4ed8', '#059669', '#c2410c', '#7c3aed', '#be123c', '#475569'],
        },
      ],
    };
  }, [data]);

  const opts = chartOpts(dark);
  const pieOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: dark ? '#e2e8f0' : '#334155', padding: 12 } } },
    }),
    [dark]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white lg:text-3xl">Báo cáo &amp; phân tích</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <BarChart3 className="h-4 w-4 text-gold-500" />
            Line · Bar · Pie — dữ liệu đồng bộ dashboard vận hành.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className={clsx(
            'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition',
            'border-slate-200 bg-white hover:border-gold-500/35 dark:border-slate-600 dark:bg-slate-800'
          )}
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={clsx('h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800', i === 0 && 'lg:col-span-2')} />
          ))}
        </div>
      ) : err ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/30">
          <p className="font-semibold text-rose-700 dark:text-rose-300">{err}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition dark:border-slate-700 dark:bg-slate-900/70 lg:col-span-2">
              <h3 className="mb-4 text-lg font-bold text-navy-900 dark:text-white">Doanh thu theo tháng</h3>
              <div className="h-[300px]">{revLine && <Line data={revLine} options={opts} />}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition dark:border-slate-700 dark:bg-slate-900/70">
              <h3 className="mb-4 text-lg font-bold text-navy-900 dark:text-white">Phòng được đặt nhiều nhất</h3>
              <div className="mx-auto h-[260px] max-w-[280px]">{roomsPie && <Pie data={roomsPie} options={pieOpts} />}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900/70">
            <h3 className="mb-4 text-lg font-bold text-navy-900 dark:text-white">Số booking tạo theo ngày (21 ngày gần nhất)</h3>
            <div className="h-[300px]">{bookingsBar && <Bar data={bookingsBar} options={opts} />}</div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900/70">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
              <h3 className="font-bold text-navy-900 dark:text-white">Bảng xếp hạng phòng</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Lượt đặt · doanh thu tích lũy theo booking</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Phòng</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Loại</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Lượt đặt</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {(data?.topRooms || []).map((r, i) => (
                    <tr key={r.room_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-bold">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold">{r.room_number}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.room_type_name}</td>
                      <td className="px-4 py-3 text-right font-medium">{r.booking_count}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gold-600">
                        {Number(r.revenue || 0).toLocaleString('vi-VN')} ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

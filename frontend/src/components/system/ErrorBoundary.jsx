import { Component } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { BRAND } from '../../constants/branding';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Giữ thấy console để gỡ lỗi trong dev.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const message =
      (this.state.error && (this.state.error.message || String(this.state.error))) ||
      'Đã xảy ra lỗi không mong muốn.';

    return (
      <div className="min-h-[70vh] bg-slate-50">
        <div className="page-container py-16">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
                  <AlertTriangle className="h-5 w-5 text-gold-400" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-300/90">
                    {BRAND.full}
                  </p>
                  <h1 className="text-lg font-bold">Trang này đang gặp sự cố</h1>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <p className="text-sm leading-relaxed text-slate-600">
                Hệ thống đã chặn lỗi để tránh màn hình trắng. Bạn có thể tải lại trang hoặc quay về danh sách phòng.
              </p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                <p className="font-semibold text-slate-700">Chi tiết lỗi</p>
                <p className="mt-1 break-words-safe">{message}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-navy-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tải lại
                </button>
                <Link
                  to="/rooms"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-navy-900 transition hover:bg-slate-50"
                >
                  Về danh sách phòng
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Trang chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}


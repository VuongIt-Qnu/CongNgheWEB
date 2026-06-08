import { Printer, Download, X } from 'lucide-react';
import { formatDate, formatDateRange, nightsBetween } from '../../utils/dateFormat';

export default function InvoiceUI({ booking, onClose }) {
  if (!booking) return null;

  const nights = nightsBetween(booking.check_in_date, booking.check_out_date);
  const roomTotal = (booking.room_price || (booking.total_price / nights)) * nights;
  const serviceCharge = roomTotal * 0.05; // Phí dịch vụ 5%
  const vat = (roomTotal + serviceCharge) * 0.1; // Thuế VAT 10%
  const grandTotal = roomTotal + serviceCharge + vat;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:absolute print:inset-0 print:z-0 print:bg-white print:p-0 print:backdrop-blur-none">
      {/* Container Hóa Đơn */}
      <div className="relative flex h-full max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-luxury print:h-auto print:max-h-none print:w-full print:rounded-none print:shadow-none">
        
        {/* Thanh công cụ (Ẩn khi in) */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 print:hidden">
          <h3 className="font-serif text-lg font-bold text-navy-900">Chi tiết Hóa đơn</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-navy-800"
            >
              <Printer className="h-4 w-4" />
              In hóa đơn / PDF
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Nội dung Hóa đơn chính */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 print:overflow-visible print:p-0">
          <div className="mx-auto max-w-2xl font-sans text-slate-800">
            
            {/* Header: Logo & resort info */}
            <div className="flex flex-col justify-between gap-6 border-b-2 border-navy-900 pb-8 sm:flex-row sm:items-start">
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-wide text-navy-900 uppercase">
                  Aurora Resort Quy Nhơn
                </h1>
                <p className="mt-1.5 text-xs text-slate-500">
                  Bãi biển Quy Nhơn, Bình Định, Việt Nam<br />
                  SĐT: 1900 6868 · Email: hello@auroraresort.vn<br />
                  Mã số thuế: 3502482910
                </p>
              </div>
              <div className="text-left sm:text-right">
                <h2 className="font-serif text-xl font-bold text-gold-600 uppercase">HÓA ĐƠN THANH TOÁN</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Mã HĐ: <span className="font-mono font-bold text-navy-900">INV-{String(booking.id).padStart(5, '0')}</span><br />
                  Mã Booking: <span className="font-mono font-bold text-navy-900">BK-{String(booking.id).padStart(4, '0')}</span><br />
                  Ngày in: {formatDate(new Date())}
                </p>
              </div>
            </div>

            {/* Thông tin khách hàng & Giao dịch */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Khách hàng</h4>
                <div className="mt-2 text-sm text-navy-950">
                  <p className="font-bold">{booking.customer_name || 'Khách hàng lẻ'}</p>
                  <p className="mt-0.5 text-slate-500 font-medium">{booking.customer_email || '—'}</p>
                  <p className="mt-0.5 text-slate-500 font-medium">{booking.customer_phone || '—'}</p>
                </div>
              </div>
              <div className="sm:text-right">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Chi tiết giao dịch</h4>
                <div className="mt-2 text-sm text-navy-950 font-medium">
                  <p>
                    Mã GD: <span className="font-mono font-bold text-navy-900">{booking.transaction_id || 'MOCK-TX'}</span>
                  </p>
                  <p className="mt-0.5 text-slate-500">
                    Phương thức: <span className="uppercase font-semibold">{booking.payment_method || 'Thẻ tín dụng'}</span>
                  </p>
                  <p className="mt-0.5 text-slate-500">
                    Trạng thái: <span className="text-emerald-600 font-bold">ĐÃ THANH TOÁN</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Chi tiết dịch vụ lưu trú */}
            <div className="mt-10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Thông tin lưu trú</h4>
              <table className="mt-4 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase text-slate-500">
                    <th className="py-2.5 font-bold">Phòng & Loại phòng</th>
                    <th className="py-2.5 text-center font-bold">Thời gian</th>
                    <th className="py-2.5 text-center font-bold">Số đêm</th>
                    <th className="py-2.5 text-right font-bold">Đơn giá</th>
                    <th className="py-2.5 text-right font-bold">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="text-navy-950">
                    <td className="py-4">
                      <p className="font-bold">Phòng {booking.room_number || 'N/A'}</p>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">Aurora Deluxe Sea View</p>
                    </td>
                    <td className="py-4 text-center text-xs font-medium text-slate-600">
                      {formatDateRange(booking.check_in_date, booking.check_out_date, ' đến ')}
                    </td>
                    <td className="py-4 text-center font-mono font-semibold">{nights}</td>
                    <td className="py-4 text-right font-mono font-medium">
                      {(booking.room_price || (booking.total_price / nights)).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-4 text-right font-mono font-bold">
                      {roomTotal.toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tổng hợp Chi phí & Stamp */}
            <div className="mt-8 flex flex-col justify-between gap-6 border-t border-slate-200 pt-6 sm:flex-row sm:items-start">
              {/* Dấu PAID mộc đỏ sang trọng */}
              <div className="relative mt-2 flex justify-center sm:justify-start">
                <div className="rotate-[-12deg] rounded-2xl border-4 border-emerald-500/80 px-6 py-2.5 text-center font-serif text-lg font-black tracking-widest text-emerald-500/80 uppercase shadow-sm">
                  PAID
                  <div className="text-[9px] font-sans font-bold tracking-normal text-emerald-400 uppercase mt-0.5">
                    Aurora Resort
                  </div>
                </div>
              </div>
              
              {/* Chi tiết tiền */}
              <div className="w-full max-w-xs space-y-2 text-sm text-slate-600 sm:text-right">
                <div className="flex justify-between font-medium">
                  <span>Tiền phòng:</span>
                  <span className="font-mono font-bold text-navy-950">{roomTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Phí dịch vụ (5%):</span>
                  <span className="font-mono font-bold text-navy-950">{serviceCharge.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Thuế VAT (10%):</span>
                  <span className="font-mono font-bold text-navy-950">{vat.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-navy-900">
                  <span className="font-serif">Tổng cộng:</span>
                  <span className="font-mono text-gold-600 text-lg">{grandTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>

            {/* Footer chân hóa đơn */}
            <div className="mt-16 text-center text-xs font-medium text-slate-400">
              <p className="italic">Cảm ơn Quý khách đã lựa chọn dịch vụ tại Aurora Resort Quy Nhơn.</p>
              <p className="mt-1">Chúc Quý khách có một kỳ nghỉ thật tuyệt vời!</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

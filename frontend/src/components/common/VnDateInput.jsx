import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, parseDisplayDate, isValidCalendarDate } from '../../utils/dateFormat';

/**
 * Ô nhập ngày hiển thị DD/MM/YYYY, giá trị nội bộ YYYY-MM-DD (ISO).
 */
export default function VnDateInput({
  value = '',
  onChange,
  min,
  max,
  className,
  placeholder = 'DD/MM/YYYY',
  required,
  disabled,
  id,
  name,
}) {
  const [text, setText] = useState(() => formatDate(value));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setText(formatDate(value));
    setHasError(false);
  }, [value]);

  const commit = (raw) => {
    const trimmed = String(raw || '').trim();
    if (!trimmed) {
      onChange?.('');
      setText('');
      setHasError(false);
      return;
    }
    // Kiểm tra format DD/MM/YYYY hợp lệ
    if (!isValidCalendarDate(trimmed)) {
      toast.error('Ngày không hợp lệ. Vui lòng nhập đúng DD/MM/YYYY.');
      setText(formatDate(value));
      setHasError(true);
      setTimeout(() => setHasError(false), 2000);
      return;
    }
    const iso = parseDisplayDate(trimmed);
    if (!iso) {
      setText(formatDate(value));
      setHasError(true);
      setTimeout(() => setHasError(false), 2000);
      return;
    }
    if (min && iso < min) {
      toast.error('Ngày không được trước ngày tối thiểu cho phép.');
      setText(formatDate(value));
      setHasError(true);
      setTimeout(() => setHasError(false), 2000);
      return;
    }
    if (max && iso > max) {
      toast.error('Ngày không được sau ngày tối đa cho phép.');
      setText(formatDate(value));
      setHasError(true);
      setTimeout(() => setHasError(false), 2000);
      return;
    }
    setHasError(false);
    onChange?.(iso);
    setText(formatDate(iso));
  };

  return (
    <div className="relative">
      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        required={required}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit(e.target.value);
        }}
        className={clsx('pl-9', className, hasError && 'border-red-400 ring-2 ring-red-400/30')}
      />
    </div>
  );
}

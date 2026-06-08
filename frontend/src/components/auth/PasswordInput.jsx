import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder = 'Mật khẩu',
  autoComplete = 'current-password',
  icon: IconComponent,
  error,
  ...rest
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      {IconComponent && (
        <IconComponent className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-gold-500" />
      )}
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`peer w-full rounded-xl border bg-white/80 py-3.5 pr-12 text-sm font-medium text-navy-900 outline-none ring-gold-500/30 transition-all duration-200 placeholder:text-slate-400 focus:border-gold-500 focus:bg-white focus:ring-2 ${
          IconComponent ? 'pl-11' : 'pl-4'
        } ${
          error
            ? 'border-rose-400 ring-rose-400/20 focus:border-rose-500 focus:ring-rose-500/30'
            : 'border-slate-200 hover:border-slate-300'
        }`}
        {...rest}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-navy-900"
        aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
      </button>
    </div>
  );
}

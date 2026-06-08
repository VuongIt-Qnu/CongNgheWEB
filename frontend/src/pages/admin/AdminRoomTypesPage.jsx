import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import AppModal from '../../components/admin/AppModal';

export default function AdminRoomTypesPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState({ name: '', description: '' });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/room-types');
      setTypes(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Không tải được loại phòng');
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({ name: '', description: '' });
    setModal({ open: true, editing: null });
  };

  const openEdit = (t) => {
    setForm({ name: t.name, description: t.description || '' });
    setModal({ open: true, editing: t });
  };

  const save = async () => {
    try {
      if (!form.name.trim()) {
        toast.error('Tên loại phòng là bắt buộc');
        return;
      }
      if (modal.editing) {
        await api.put(`/room-types/${modal.editing.id}`, form);
        toast.success('Đã cập nhật loại phòng');
      } else {
        await api.post('/room-types', form);
        toast.success('Đã tạo loại phòng');
      }
      setModal({ open: false, editing: null });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lưu thất bại');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Xóa loại phòng? Các phòng liên quan có thể bị ảnh hưởng (CASCADE).')) return;
    try {
      await api.delete(`/room-types/${id}`);
      toast.success('Đã xóa');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không xóa được');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Loại phòng</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Standard, Deluxe, Suite, VIP …</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 px-4 py-2.5 text-sm font-bold text-white shadow-lg dark:from-white dark:to-slate-200 dark:text-navy-900"
        >
          <Plus className="h-4 w-4" /> Thêm loại
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900/70">
        {loading ? (
          <div className="grid gap-2 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  Id
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  Tên
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  Mô tả
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {types.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{t.id}</td>
                  <td className="px-4 py-3 font-semibold text-navy-900 dark:text-white">{t.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.description || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-white dark:border-slate-600 dark:text-slate-200"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(t.id)}
                        className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AppModal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Sửa loại phòng' : 'Loại phòng mới'}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className={btnSecondary} onClick={() => setModal({ open: false, editing: null })}>
              Hủy
            </button>
            <button type="button" className={btnPrimary} onClick={save}>
              Lưu
            </button>
          </div>
        }
      >
        <div className="grid gap-4">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-navy-900 dark:text-white">Tên loại phòng</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
              placeholder="VD: Deluxe Room"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-navy-900 dark:text-white">Mô tả</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
            />
          </label>
        </div>
      </AppModal>
    </div>
  );
}

const btnPrimary =
  'rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 px-4 py-2.5 text-sm font-bold text-white dark:from-white dark:to-slate-200 dark:text-navy-900';
const btnSecondary =
  'rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200';

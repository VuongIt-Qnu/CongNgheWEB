import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, ImagePlus, Images, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { API_HOST } from '../../services/api';
import AppModal from '../../components/admin/AppModal';
import { ROOM_STATUS_OPTIONS, roomStatusLabel, roomStatusBadgeClass, displayRoomName } from '../../constants/labels';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState({
    room_number: '',
    room_type_id: '',
    price: '',
    capacity: '2',
    status: 'available',
    description: '',
  });
  const [uploading, setUploading] = useState(false);

  // Image gallery state
  const [gallery, setGallery] = useState({ open: false, room: null, images: [], loading: false });
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { imageId, imageUrl }

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/rooms', {
        params: {
          search: search.trim() || undefined,
          status: statusF || undefined,
          page,
          limit,
        },
      });
      setRooms(data.rooms || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Không tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  }, [search, statusF, page, limit]);

  useEffect(() => {
    api.get('/room-types').then((r) => setTypes(Array.isArray(r.data) ? r.data : []));
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const openCreate = () => {
    setForm({
      room_number: '',
      room_type_id: types[0]?.id || '',
      price: '',
      capacity: '2',
      status: 'available',
      description: '',
    });
    setModal({ open: true, editing: null });
  };

  const openEdit = (room) => {
    setForm({
      room_number: room.room_number,
      room_type_id: String(room.room_type_id),
      price: String(room.price),
      capacity: String(room.capacity),
      status: room.status,
      description: room.description || '',
    });
    setModal({ open: true, editing: room });
  };

  const save = async () => {
    try {
      if (!form.room_number.trim() || !form.room_type_id || !form.price) {
        toast.error('Số phòng, loại và giá là bắt buộc');
        return;
      }
      const payload = {
        room_number: form.room_number.trim(),
        room_type_id: Number(form.room_type_id),
        price: Number(form.price),
        capacity: Number(form.capacity) || 1,
        status: form.status,
        description: form.description || null,
      };
      if (modal.editing) {
        await api.put(`/rooms/${modal.editing.id}`, payload);
        toast.success('Đã cập nhật phòng');
      } else {
        await api.post('/rooms', payload);
        toast.success('Đã thêm phòng');
      }
      setModal({ open: false, editing: null });
      loadRooms();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lưu thất bại');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Xóa phòng này?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Đã xóa');
      loadRooms();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không xóa được');
    }
  };

  const uploadImages = async (roomId, files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('room_id', String(roomId));
        await api.post('/rooms/upload-image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      toast.success(`Đã tải ${files.length} ảnh`);
      loadRooms();
      // Refresh gallery if it's open for this room
      if (gallery.open && gallery.room?.id === roomId) {
        loadGalleryImages(roomId);
      }
    } catch {
      toast.error('Upload ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  // Gallery functions
  const loadGalleryImages = async (roomId) => {
    try {
      const { data } = await api.get(`/rooms/${roomId}/images`);
      setGallery((prev) => ({ ...prev, images: data || [], loading: false }));
    } catch {
      toast.error('Không tải được ảnh');
      setGallery((prev) => ({ ...prev, loading: false }));
    }
  };

  const openGallery = (room) => {
    setGallery({ open: true, room, images: [], loading: true });
    setDeletingImageId(null);
    setConfirmDelete(null);
    loadGalleryImages(room.id);
  };

  const closeGallery = () => {
    setGallery({ open: false, room: null, images: [], loading: false });
    setDeletingImageId(null);
    setConfirmDelete(null);
  };

  const handleDeleteImage = async (imageId) => {
    setConfirmDelete(null);
    setDeletingImageId(imageId);
    try {
      await api.delete(`/rooms/images/${imageId}`);
      toast.success('Đã xóa ảnh');
      // Remove image from local state immediately
      setGallery((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.id !== imageId),
      }));
      loadRooms();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không xóa được ảnh');
    } finally {
      setDeletingImageId(null);
    }
  };

  const resolveUrl = (url) => {
    if (!url) return '';
    const clean = url.replace(/\\/g, '/');
    return clean.startsWith('http') ? clean : `${API_HOST}${clean.startsWith('/') ? clean : '/' + clean}`;
  };

  const thumb = (room) => {
    const u = room.cover_image_url;
    if (!u) return 'https://images.unsplash.com/photo-1631049307264-da0c9adc7d23?auto=format&fit=crop&w=200&q=75';
    const clean = u.replace(/\\/g, '/');
    return clean.startsWith('http') ? clean : `${API_HOST}${clean.startsWith('/') ? clean : '/' + clean}`;
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Phòng</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">CRUD, ảnh, trạng thái housekeeping.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            placeholder="Tìm phòng / loại…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="min-w-[160px] rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <select
            value={statusF}
            onChange={(e) => {
              setStatusF(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="">Mọi trạng thái</option>
            {ROOM_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-navy-900 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-navy-900"
          >
            + Thêm phòng
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase text-slate-500">Ảnh</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase text-slate-500">Phòng</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase text-slate-500">Loại</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase text-slate-500">Giá</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase text-slate-500">Khách</th>
                <th className="px-3 py-3 text-left text-xs font-bold uppercase text-slate-500">TT</th>
                <th className="px-3 py-3 text-right text-xs font-bold uppercase text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center">
                    Đang tải…
                  </td>
                </tr>
              ) : (
                rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2">
                      <img
                        src={thumb(r)}
                        alt=""
                        className="h-14 w-20 rounded-lg object-cover ring-1 ring-slate-100 bg-slate-200"
                        loading="lazy"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0c9adc7d23?auto=format&fit=crop&w=200&q=75'; }}
                      />
                    </td>
                    <td className="px-3 py-2 font-semibold text-navy-900 dark:text-white">{displayRoomName(r.room_number)}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{r.room_type_name}</td>
                    <td className="px-3 py-2 font-medium">{Number(r.price).toLocaleString('vi-VN')} ₫</td>
                    <td className="px-3 py-2">{r.capacity}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${roomStatusBadgeClass(r.status)}`}>
                        {roomStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap justify-end gap-1">
                        <button
                          type="button"
                          title="Quản lý ảnh"
                          onClick={() => openGallery(r)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-600"
                        >
                          <Images className="h-4 w-4" />
                        </button>
                        <label className="cursor-pointer rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 dark:border-slate-600">
                          <ImagePlus className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={uploading}
                            onChange={(e) => {
                              uploadImages(r.id, e.target.files);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <Link
                          to={`/room/${r.id}`}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button type="button" className="rounded-lg border border-slate-200 p-1.5" onClick={() => openEdit(r)}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" className="rounded-lg border border-rose-200 p-1.5 text-rose-600" onClick={() => remove(r.id)}>
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
          <div className="flex justify-end gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border px-3 py-1 text-sm font-bold disabled:opacity-40 dark:border-slate-600"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border px-3 py-1 text-sm font-bold disabled:opacity-40 dark:border-slate-600"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Room Modal */}
      <AppModal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? `Sửa phòng ${modal.editing.room_number}` : 'Phòng mới'}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-xl border px-4 py-2 text-sm font-bold dark:border-slate-600" onClick={() => setModal({ open: false, editing: null })}>
              Hủy
            </button>
            <button type="button" className="rounded-xl bg-navy-900 px-5 py-2 text-sm font-bold text-white dark:bg-white dark:text-navy-900" onClick={save}>
              Lưu
            </button>
          </div>
        }
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm sm:col-span-1">
            <span className="font-semibold">Số phòng</span>
            <input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Loại phòng</span>
            <select value={form.room_type_id} onChange={(e) => setForm({ ...form, room_type_id: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950">
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Giá / đêm (₫)</span>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Sức chứa</span>
            <input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold">Trạng thái</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950">
              {ROOM_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="font-semibold">Mô tả</span>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-slate-600 dark:bg-slate-950" />
          </label>
          {modal.editing && (
            <p className="text-xs text-slate-500 sm:col-span-2">
              Upload thêm ảnh từ bảng sau khi lưu bằng biểu tượng hình trong hàng hoặc tại đây:
              <input
                type="file"
                accept="image/*"
                multiple
                className="mt-2 block w-full text-xs"
                onChange={(e) => uploadImages(modal.editing.id, e.target.files)}
              />
            </p>
          )}
        </div>
      </AppModal>

      {/* Image Gallery Modal */}
      <AppModal
        open={gallery.open}
        onClose={closeGallery}
        title={gallery.room ? `Ảnh ${displayRoomName(gallery.room.room_number)}` : 'Ảnh phòng'}
        subtitle={gallery.images.length > 0 ? `${gallery.images.length} ảnh · Bấm nút thùng rác để xóa` : undefined}
        size="lg"
        footer={
          <div className="flex items-center justify-between gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-navy-800 dark:bg-white dark:text-navy-900 dark:hover:bg-slate-100">
              <ImagePlus className="h-4 w-4" />
              Thêm ảnh
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  if (gallery.room) {
                    uploadImages(gallery.room.id, e.target.files);
                  }
                  e.target.value = '';
                }}
              />
            </label>
            <button type="button" className="rounded-xl border px-4 py-2 text-sm font-bold dark:border-slate-600" onClick={closeGallery}>
              Đóng
            </button>
          </div>
        }
      >
        {gallery.loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Đang tải ảnh…</span>
          </div>
        ) : gallery.images.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Images className="mx-auto mb-3 h-12 w-12 opacity-40" />
            <p className="font-medium">Phòng chưa có ảnh nào.</p>
            <p className="mt-1 text-xs">Bấm "Thêm ảnh" bên dưới để upload.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {gallery.images.map((img) => {
              const isDeleting = deletingImageId === img.id;
              return (
                <div
                  key={img.id}
                  className={`relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all duration-300 dark:border-slate-700 ${
                    isDeleting ? 'scale-95 opacity-40' : ''
                  }`}
                >
                  <img
                    src={resolveUrl(img.image_url)}
                    alt=""
                    className="aspect-[4/3] w-full object-cover bg-slate-200"
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0c9adc7d23?auto=format&fit=crop&w=600&q=75'; }}
                  />
                  {/* Delete overlay — always visible on hover */}
                  <div className="absolute inset-0 flex items-start justify-end bg-gradient-to-t from-black/40 via-transparent to-black/20 p-2 opacity-0 transition-opacity duration-200 hover:opacity-100">
                    <button
                      type="button"
                      title="Xóa ảnh này"
                      disabled={isDeleting}
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete({ imageId: img.id, imageUrl: img.image_url });
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform hover:scale-110 hover:bg-red-700 disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Always-visible small delete button at corner */}
                  <button
                    type="button"
                    title="Xóa ảnh"
                    disabled={isDeleting}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete({ imageId: img.id, imageUrl: img.image_url });
                    }}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 text-white shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </AppModal>

      {/* Confirm Delete Image Modal */}
      <AppModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Xác nhận xóa ảnh"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold transition hover:bg-slate-50 dark:border-slate-600"
              onClick={() => setConfirmDelete(null)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700"
              onClick={() => {
                if (confirmDelete) handleDeleteImage(confirmDelete.imageId);
              }}
            >
              Xóa ảnh
            </button>
          </div>
        }
      >
        <div className="text-center">
          {confirmDelete?.imageUrl && (
            <img
              src={resolveUrl(confirmDelete.imageUrl)}
              alt=""
              className="mx-auto mb-4 h-32 w-48 rounded-xl object-cover shadow-md bg-slate-200"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0c9adc7d23?auto=format&fit=crop&w=400&q=75'; }}
            />
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Ảnh sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.
          </p>
          <p className="mt-1 text-xs text-slate-400">Bạn có chắc chắn muốn xóa?</p>
        </div>
      </AppModal>
    </div>
  );
}

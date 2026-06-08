import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import RoomDetail, { RoomDetailHeroFallback } from '../../components/rooms/RoomDetail';

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="aspect-[21/11] shimmer rounded-3xl bg-slate-200/90" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 w-24 flex-shrink-0 rounded-xl shimmer bg-slate-200/80 md:h-20 md:w-[120px]" />
          ))}
        </div>
      </div>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="h-10 w-2/3 rounded-xl shimmer bg-slate-200/90" />
          <div className="h-4 w-full rounded-lg shimmer bg-slate-100" />
          <div className="h-4 w-5/6 rounded-lg shimmer bg-slate-100" />
        </div>
        <div className="lg:col-span-4">
          <div className="h-96 rounded-3xl shimmer bg-slate-200/80 ring-1 ring-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function RoomDetailPage() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/rooms/${id}`);
        if (cancelled) return;
        setRoom(data);
        try {
          const list = await api.get('/rooms', {
            params: { type: data.room_type_id, limit: 8, page: 1 },
          });
          if (cancelled) return;
          const others = (list.data.rooms || []).filter((r) => r.id !== Number(id)).slice(0, 3);
          setRelated(others);
        } catch {
          setRelated([]);
        }
      } catch {
        toast.error('Không tải được thông tin phòng.');
        if (!cancelled) setRoom(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const refetchRoom = useCallback(async () => {
    try {
      const { data } = await api.get(`/rooms/${id}`);
      setRoom(data);
    } catch {
      /* ignore */
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <RoomDetailHeroFallback />
        <DetailSkeleton />
      </>
    );
  }

  if (!room) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-navy-900">Không tìm thấy phòng.</h1>
        <Link to="/rooms" className="mt-6 rounded-full bg-navy-900 px-8 py-3 text-sm font-bold text-white">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return <RoomDetail room={room} relatedRooms={related} onReviewsUpdated={refetchRoom} />;
}

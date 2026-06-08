export default function RoomCard({ room, onEdit, onDelete, onBook }) {
  const imageUrl = room.image_path ? `http://localhost:5000${room.image_path}` : 'https://via.placeholder.com/300x200?text=Phòng+khách+sạn';

  return (
    <div className="card h-100 shadow-sm border-0 overflow-hidden">
      <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
        <img src={imageUrl} alt={`Phòng ${room.room_number}`} className="card-img-top w-100 h-100 object-fit-cover" />
        <span
          className={`position-absolute top-0 end-0 m-2 badge ${
            room.status === 'available'
              ? 'bg-success'
              : room.status === 'occupied'
                ? 'bg-danger'
                : room.status === 'booked'
                  ? 'bg-warning text-dark'
                  : 'bg-secondary'
          }`}
        >
          {room.status}
        </span>
      </div>
      <div className="card-body">
        <div className="mb-2">
          <h5 className="card-title mb-1">Phòng {room.room_number}</h5>
          <p className="text-muted small mb-0">{room.room_type_name || room.room_type_id}</p>
        </div>
        <div className="mb-3">
          <p className="mb-1">
            <strong>Giá:</strong> {room.price?.toLocaleString()} ₫/đêm
          </p>
          <p className="mb-0">
            <strong>Sức chứa:</strong> {room.capacity} khách
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {onBook && (
            <button className="btn btn-sm btn-primary flex-grow-1" onClick={onBook}>
              Đặt phòng
            </button>
          )}
          {onEdit && (
            <button className="btn btn-sm btn-outline-secondary" onClick={onEdit}>
              Sửa
            </button>
          )}
          {onDelete && (
            <button className="btn btn-sm btn-outline-danger" onClick={onDelete}>
              Xóa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { storageGet } from '../utils/storage';

export default function Sidebar() {
  const user = JSON.parse(storageGet('user') || '{}');

  return (
    <div className="col-md-2 bg-light vh-100 p-3">
      <h5>Menu</h5>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link className="nav-link" to="/">
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/rooms">
            Phòng
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/bookings">
            Đặt phòng
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/customers">
            Khách hàng
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/services">
            Dịch vụ
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/room-types">
            Loại phòng
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/payments">
            Thanh toán
          </Link>
        </li>
        {user?.role === 'admin' && (
          <li className="nav-item">
            <Link className="nav-link" to="/users">
              Người dùng
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

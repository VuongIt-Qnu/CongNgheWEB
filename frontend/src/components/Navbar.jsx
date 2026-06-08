import { Link, useNavigate } from 'react-router-dom';

import { storageGet, storageRemove } from '../utils/storage';

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const user = JSON.parse(storageGet('user') || '{}');

  const logout = () => {
    storageRemove('token');
    storageRemove('user');

    if (onLogout) {
      onLogout();
    }

    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Aurora Admin
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
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
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/profile">
                Profile
              </Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-outline-light" onClick={logout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

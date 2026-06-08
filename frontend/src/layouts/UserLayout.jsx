import { Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function isHeroOverlayRoute(pathname) {
  if (pathname === '/' || pathname === '/rooms') return true;
  if (/^\/room\/\d+$/.test(pathname)) return true;
  return false;
}

export default function UserLayout() {
  const { pathname } = useLocation();
  const heroOverlay = isHeroOverlayRoute(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className={clsx('flex-grow', !heroOverlay && 'page-offset-top')}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

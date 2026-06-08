import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AdminThemeContext = createContext(null);

const STORAGE = 'hotel_admin_dark';

export function AdminThemeProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('hotel_admin_sidebar') === '1');
  const [dark, setDark] = useState(() => localStorage.getItem(STORAGE) === '1');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE, dark ? '1' : '0');
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('hotel_admin_sidebar', sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  const toggleDark = useCallback(() => setDark((d) => !d), []);
  const toggleSidebar = useCallback(() => setSidebarCollapsed((s) => !s), []);

  const value = useMemo(
    () => ({
      dark,
      toggleDark,
      sidebarCollapsed,
      toggleSidebar,
      mobileNavOpen,
      setMobileNavOpen,
    }),
    [dark, sidebarCollapsed, mobileNavOpen, toggleDark, toggleSidebar]
  );

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error('useAdminTheme requires AdminThemeProvider');
  return ctx;
}

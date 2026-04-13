import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiMenu, FiBell, FiKey, FiLogOut, FiGrid, FiTool, FiMail, FiSettings } from 'react-icons/fi';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../lib/api';
import BrandLogo from './BrandLogo';

const COPYRIGHT_EMAIL = 'gnanasekaran.mernstack@gmail.com';
const COPYRIGHT_TEXT = '\u00A9 gnanasekaran.mernstack@gmail.com';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [dashboardData, setDashboardData] = useState(null);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState([]);
  const seenNotificationIds = useRef(new Set());

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiGrid },
    { name: 'Tools Tracker', href: '/tools', icon: FiTool },
    { name: 'Email Accounts', href: '/emails', icon: FiMail },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  const showDesktopNotification = (notification) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification('AI Tool Tracker Alert', {
        body: notification.text,
        tag: notification.id,
      });
      return;
    }

    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('AI Tool Tracker Alert', {
            body: notification.text,
            tag: notification.id,
          });
        }
      });
    }
  };

  const refreshDashboardData = async ({ announce = false } = {}) => {
    try {
      const { data } = await api.get('/dashboard');
      setDashboardData((previousData) => {
        const previousIds = new Set(previousData?.notifications?.map((item) => item.id) || []);

        data.notifications?.forEach((notification) => {
          if (announce && !previousIds.has(notification.id) && !seenNotificationIds.current.has(notification.id)) {
            toast.info(notification.text, {
              autoClose: 5000,
              hideProgressBar: false,
              position: 'top-right',
            });
            showDesktopNotification(notification);
          }
          seenNotificationIds.current.add(notification.id);
        });

        return data;
      });
    } catch {
      // Keep layout usable even if dashboard summary fails.
    }
  };

  useEffect(() => {
    refreshDashboardData({ announce: true });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      refreshDashboardData({ announce: true });
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      toast.success('Password updated successfully! (Demo)');
      setShowPasswordModal(false);
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch {
      toast.error('Failed to update password');
    }
  };

  const visibleNotifications = dashboardData?.notifications?.filter(
    (notification) => !dismissedNotificationIds.includes(notification.id)
  ) || [];

  const handleDismissNotification = (id) => {
    setDismissedNotificationIds((current) => (
      current.includes(id) ? current : [...current, id]
    ));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <div
        className={`${isSidebarExpanded ? 'w-64' : 'w-20'} glass-panel relative z-20 hidden border-l-0 border-y-0 transition-all duration-300 ease-in-out md:flex md:flex-col`}
      >
        <div className={`flex h-24 shrink-0 border-b border-white/10 ${isSidebarExpanded ? 'items-center px-4' : 'items-center justify-center px-2'}`}>
          <BrandLogo compact={!isSidebarExpanded} />
        </div>

        <nav className="hide-scrollbar flex-1 overflow-y-auto space-y-2 px-3 py-6">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center rounded-xl py-3.5 text-sm font-medium transition-all duration-300 ${
                  isSidebarExpanded ? 'px-4' : 'justify-center'
                } ${
                  isActive
                    ? 'bg-linear-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300 shadow-[inset_2px_0_0_0_#818cf8]'
                    : 'text-gray-400 hover:translate-x-1 hover:bg-white/5 hover:text-white'
                }`}
                title={!isSidebarExpanded ? item.name : ''}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-indigo-400'
                  } ${isSidebarExpanded ? 'mr-3' : ''}`}
                />
                {isSidebarExpanded && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 bg-black/20 p-4">
          <div className={`mb-4 flex items-center ${!isSidebarExpanded && 'justify-center'}`}>
            <div
              className={`shrink-0 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 font-bold text-white shadow-lg shadow-indigo-500/30 ${
                isSidebarExpanded ? 'flex h-10 w-10 items-center justify-center' : 'flex h-8 w-8 items-center justify-center text-sm'
              }`}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            {isSidebarExpanded && (
              <div className="ml-3 overflow-hidden">
                <p className="w-32 truncate text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="w-40 truncate text-xs text-indigo-300/80">{user?.email || COPYRIGHT_EMAIL}</p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className={`flex w-full items-center rounded-xl py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400 ${
              isSidebarExpanded ? 'px-4' : 'justify-center'
            }`}
            title={!isSidebarExpanded ? 'Logout' : ''}
          >
            <FiLogOut className={`h-5 w-5 ${isSidebarExpanded ? 'mr-3' : ''}`} />
            {isSidebarExpanded && <span>Logout</span>}
          </button>

          {isSidebarExpanded && (
            <div className="mt-4 space-y-1 border-t border-white/10 pt-4">
              <p className="break-all text-xs text-gray-400">{COPYRIGHT_TEXT}</p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500">Version 1.0.0</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-0 flex h-screen flex-1 flex-col overflow-hidden">
        <header className="glass-panel relative z-30 flex h-20 shrink-0 items-center justify-between border-x-0 border-t-0 px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="hidden rounded-xl bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white md:block"
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <h2 className="hidden text-xl font-bold text-white md:block">
              {navigation.find((n) => n.href === location.pathname)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-2 md:hidden">
              <BrandLogo compact className="max-w-[220px]" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-xl bg-white/5 p-2.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <FiBell className="h-5 w-5" />
                {visibleNotifications.length > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <div className="glass-panel absolute right-0 mt-3 w-96 overflow-hidden rounded-2xl border border-white/20 py-2 shadow-2xl animate-fade-in-up">
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
                    <div>
                      <h3 className="font-bold text-white">Alerts & Notifications</h3>
                      <p className="mt-1 text-xs text-gray-400">Live renewal, expiry, and limit updates</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Close notifications"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="hide-scrollbar max-h-80 overflow-y-auto">
                    {visibleNotifications.length ? (
                      visibleNotifications.map((notification) => (
                        <div key={notification.id} className="border-b border-white/5 px-4 py-3 transition-colors last:border-0 hover:bg-white/5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm text-gray-200">{notification.text}</p>
                                <button
                                  type="button"
                                  onClick={() => handleDismissNotification(notification.id)}
                                  className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
                                  aria-label="Dismiss notification"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                                    notification.type === 'renewal'
                                      ? 'bg-emerald-500/15 text-emerald-300'
                                      : notification.type === 'expired'
                                        ? 'bg-rose-500/15 text-rose-300'
                                        : 'bg-amber-500/15 text-amber-300'
                                  }`}
                                >
                                  {notification.type}
                                </span>
                                <p className="text-xs text-gray-500">{new Date(notification.date).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">No new notifications right now.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2.5 px-4 text-indigo-300 transition-colors hover:bg-indigo-500/20"
            >
              <FiKey className="h-4 w-4" />
              <span className="hidden text-sm font-medium sm:block">Security</span>
            </button>

            <button onClick={logout} className="p-2 text-gray-400 hover:text-red-400 md:hidden">
              <FiLogOut className="h-6 w-6" />
            </button>
          </div>
        </header>

        <main className="hide-scrollbar flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 md:p-8">
          <div className="mx-auto h-full max-w-7xl">
            <Outlet context={{ dashboardData, refreshDashboardData }} />
          </div>
        </main>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="glass-panel w-full max-w-sm rounded-3xl border-white/20 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-white">
                x
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Current Password</label>
                <input
                  type="password"
                  required
                  className="w-full rounded-xl glass-input px-4 py-3 placeholder-gray-500"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">New Password</label>
                <input
                  type="password"
                  required
                  className="w-full rounded-xl glass-input px-4 py-3 placeholder-gray-500"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-linear-to-r from-indigo-500 to-cyan-500 py-3 font-medium text-white transition-all hover:from-indigo-400 hover:to-cyan-400"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

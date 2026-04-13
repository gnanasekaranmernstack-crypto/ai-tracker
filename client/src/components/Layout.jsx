import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiMenu, FiBell, FiKey, FiLogOut, FiGrid, FiTool, FiMail, FiSettings, FiHexagon } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  // States for Topbar Modals/Dropdowns
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiGrid },
    { name: 'Tools Tracker', href: '/tools', icon: FiTool },
    { name: 'Email Accounts', href: '/emails', icon: FiMail },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  const notifications = [
    { id: 1, text: 'Midjourney subscription ends in 3 days.', time: '1 hr ago' },
    { id: 2, text: 'New email account added.', time: '5 hrs ago' },
    { id: 3, text: 'Welcome to AI Tracker Pro!', time: '1 day ago' }
  ];

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      // Assuming a password change endpoint exists, otherwise this is a UI stub
      // await api.put('/auth/password', passwordData);
      toast.success('Password updated successfully! (Demo)');
      setShowPasswordModal(false);
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch {
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <div 
        className={`${isSidebarExpanded ? 'w-64' : 'w-20'} 
        glass-panel border-y-0 border-l-0 hidden md:flex md:flex-col relative z-20 
        transition-all duration-300 ease-in-out`}
      >
        {/* Top: Branding (Fixed) */}
        <div className="flex items-center justify-center h-20 border-b border-white/10 shrink-0">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-50 animate-pulse-glow"></div>
            <FiHexagon className="w-8 h-8 text-indigo-400 relative z-10" />
          </div>
          {isSidebarExpanded && (
            <h1 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-cyan-400 whitespace-nowrap animate-fade-in-up">
              AI Tracker
            </h1>
          )}
        </div>

        {/* Middle: Navigation (Scrollable) */}
        <nav className="flex-1 overflow-y-auto hide-scrollbar py-6 space-y-2 px-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center ${isSidebarExpanded ? 'px-4' : 'justify-center'} py-3.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-linear-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300 shadow-[inset_2px_0_0_0_#818cf8]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                }`}
                title={!isSidebarExpanded ? item.name : ""}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-indigo-400'} ${isSidebarExpanded ? 'mr-3' : ''}`} />
                {isSidebarExpanded && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User & Logout (Fixed) */}
        <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
          <div className={`flex items-center mb-4 ${!isSidebarExpanded && 'justify-center'}`}>
            <div className={`shrink-0 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 ${isSidebarExpanded ? 'w-10 h-10' : 'w-8 h-8 text-sm'}`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            {isSidebarExpanded && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate w-32">{user?.name || 'User'}</p>
                <p className="text-xs text-indigo-300/80 truncate w-32">Pro Member</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={`flex items-center w-full py-2.5 text-sm font-medium text-gray-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors ${isSidebarExpanded ? 'px-4' : 'justify-center'}`}
            title={!isSidebarExpanded ? "Logout" : ""}
          >
            <FiLogOut className={`w-5 h-5 ${isSidebarExpanded ? 'mr-3' : ''}`} />
            {isSidebarExpanded && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-0 h-screen">
        
        {/* Topbar */}
        <header className="glass-panel border-x-0 border-t-0 h-20 flex items-center justify-between px-6 shrink-0 relative z-30">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle */}
            <button 
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors hidden md:block"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white hidden md:block">
              {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
            </h2>
            
            {/* Mobile Branding */}
            <div className="flex items-center gap-2 md:hidden">
              <FiHexagon className="w-6 h-6 text-indigo-400" />
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-cyan-400">AI Tracker</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors relative"
              >
                <FiBell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-panel border border-white/20 rounded-2xl shadow-2xl py-2 animate-fade-in-up">
                  <div className="px-4 py-2 border-b border-white/10">
                    <h3 className="font-bold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto hide-scrollbar">
                    {notifications.map(n => (
                      <div key={n.id} className="px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 cursor-pointer transition-colors">
                        <p className="text-sm text-gray-300">{n.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Button */}
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 p-2.5 px-4 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-colors"
            >
              <FiKey className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:block">Security</span>
            </button>
            
            {/* Mobile Logout */}
            <button onClick={logout} className="text-gray-400 hover:text-red-400 p-2 md:hidden">
               <FiLogOut className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Main Scrolling Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 hide-scrollbar bg-transparent">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="glass-panel w-full max-w-sm p-6 rounded-3xl border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 glass-input rounded-xl placeholder-gray-500"
                  value={passwordData.oldPassword}
                  onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 glass-input rounded-xl placeholder-gray-500"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 mt-4 text-white font-medium rounded-xl bg-linear-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 transition-all"
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

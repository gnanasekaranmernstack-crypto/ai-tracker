import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Bell, Mail, ShieldCheck } from 'lucide-react';

export default function Settings() {
  const { user, updateNotificationEmail } = useContext(AuthContext);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNotificationEmail(user.notificationEmail || user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateNotificationEmail(notificationEmail);
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update notification email');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl animate-fade-in-up">
      <h2 className="text-3xl font-bold text-white mb-6">Account Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_20px_rgba(99,102,241,0.5)] mb-4 border-2 border-indigo-300">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <h3 className="text-xl font-bold text-white">{user?.name}</h3>
              <p className="text-sm text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full mt-2 font-medium border border-indigo-500/20">Pro Member</p>
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Full Name</p>
                <div className="flex items-center text-gray-200">
                  <User className="w-4 h-4 mr-2 text-indigo-400" />
                  {user?.name}
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Login Email</p>
                <div className="flex items-center text-gray-200">
                  <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preferences */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center">
              <Bell className="w-5 h-5 mr-3 text-indigo-400" />
              Notification Preferences
            </h3>
            <p className="text-sm text-gray-400 mb-8 border-b border-white/10 pb-6">
              Configure where you want to receive alerts for expiring tools and renewal reminders. Ensure this is an inbox you check frequently.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2 text-indigo-400" />
                  Primary Notification Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 glass-input rounded-xl placeholder-gray-500 transition-all focus:bg-white/10"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-white font-medium bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Saving...
                    </span>
                  ) : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>

          <div className="glass-panel p-8 rounded-3xl border-rose-500/20 bg-rose-500/5">
             <h3 className="text-lg font-bold text-rose-400 mb-2">Danger Zone</h3>
             <p className="text-sm text-gray-400 mb-4">You cannot currently delete your account from the dashboard. Contact support if you wish to purge all data.</p>
             <button disabled className="px-4 py-2 text-sm text-rose-500 border border-rose-500/20 rounded-lg opacity-50 cursor-not-allowed bg-rose-500/5">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}

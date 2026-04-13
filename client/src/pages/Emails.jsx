import { useState, useEffect } from 'react';
import api from '../lib/api';
import { toast } from 'react-toastify';
import { Trash2, Edit, Plus, X, Mail } from 'lucide-react';

export default function Emails() {
  const [emails, setEmails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    id: null,
    emailAddress: '',
    description: ''
  });

  const fetchEmails = async () => {
    try {
      const { data } = await api.get('/emails');
      setEmails(data);
    } catch {
      toast.error('Failed to fetch emails');
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmails();
  }, []);

  const handleOpenModal = (email = null) => {
    if (email) {
      setFormData({ id: email._id, emailAddress: email.emailAddress, description: email.description || '' });
    } else {
      setFormData({ id: null, emailAddress: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/emails/${formData.id}`, formData);
        toast.success('Email updated successfully');
      } else {
        await api.post('/emails', formData);
        toast.success('Email added successfully');
      }
      setIsModalOpen(false);
      fetchEmails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving email');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this email account?')) {
      try {
        await api.delete(`/emails/${id}`);
        toast.success('Email deleted successfully');
        fetchEmails();
      } catch {
        toast.error('Failed to delete email');
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse-glow"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center glass-panel p-5 rounded-2xl">
        <h2 className="text-2xl font-bold text-white">Linked Email Accounts</h2>
        <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all outline-none">
          <Plus className="w-4 h-4 mr-2" />
          Add Email
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {emails.map((email) => (
          <div key={email._id} className="glass-panel p-6 rounded-2xl relative group overflow-hidden hover:-translate-y-1 transition-all duration-300">
             <div className="absolute opacity-10 -bottom-4 -right-4 group-hover:scale-110 group-hover:text-indigo-400 transition-all duration-500">
                <Mail className="w-32 h-32" />
             </div>
             
             <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(email)} className="text-gray-400 hover:text-indigo-400 bg-white/5 hover:bg-indigo-500/20 p-2 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(email._id)} className="text-gray-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/20 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
             </div>
             
             <div className="relative z-10 pt-2">
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="font-semibold text-lg text-white mt-2 truncate pr-16" title={email.emailAddress}>{email.emailAddress}</p>
                <p className="text-sm text-indigo-300 mt-1">{email.description || 'No description provided'}</p>
             </div>
          </div>
        ))}
        {emails.length === 0 && (
            <div className="col-span-full text-center py-16 glass-panel rounded-2xl flex flex-col items-center">
              <div className="p-4 bg-white/5 border border-white/10 rounded-full mb-4">
                <Mail className="w-10 h-10 text-gray-500 opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No email accounts added yet</h3>
              <p className="text-gray-400 max-w-sm text-sm">Add email accounts to track which specific emails were used to register for various AI tools.</p>
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-sm p-6 border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{formData.id ? 'Edit Email Details' : 'Add New Email'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              <div>
                <label className="block mb-1.5 font-medium text-gray-300">Email Address <span className="text-rose-500">*</span></label>
                <input required type="email" placeholder="name@example.com" className="w-full px-4 py-2.5 glass-input rounded-xl placeholder-gray-500" value={formData.emailAddress} onChange={e => setFormData({...formData, emailAddress: e.target.value})} />
              </div>
              <div>
                <label className="block mb-1.5 font-medium text-gray-300">Description</label>
                <input type="text" placeholder="e.g. Personal Gmail, Work Email" className="w-full px-4 py-2.5 glass-input rounded-xl placeholder-gray-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-300 font-medium bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-white font-medium bg-indigo-600 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all">Save Email</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

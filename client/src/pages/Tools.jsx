import { useState, useEffect } from 'react';
import api from '../lib/api';
import { toast } from 'react-toastify';
import { Trash2, Edit, Plus, Download, X } from 'lucide-react';
import { format } from 'date-fns';

export default function Tools() {
  const [tools, setTools] = useState([]);
  const [emailsContext, setEmailsContext] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    id: null,
    toolName: '',
    emails: [],
    startDate: '',
    endDate: '',
    renewalDate: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [toolsRes, emailsRes] = await Promise.all([
        api.get('/tools'),
        api.get('/emails')
      ]);
      setTools(toolsRes.data);
      setEmailsContext(emailsRes.data);
    } catch {
      toast.error('Failed to fetch data');
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleOpenModal = (tool = null) => {
    if (tool) {
      setFormData({
        id: tool._id,
        toolName: tool.toolName,
        emails: tool.emails.map(e => e._id),
        startDate: format(new Date(tool.startDate), "yyyy-MM-dd'T'HH:mm"),
        endDate: format(new Date(tool.endDate), "yyyy-MM-dd'T'HH:mm"),
        renewalDate: format(new Date(tool.renewalDate), "yyyy-MM-dd'T'HH:mm"),
        notes: tool.notes || ''
      });
    } else {
      setFormData({ id: null, toolName: '', emails: [], startDate: '', endDate: '', renewalDate: '', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (formData.id) {
        await api.put(`/tools/${formData.id}`, payload);
        toast.success('Tool updated successfully');
      } else {
        await api.post('/tools', payload);
        toast.success('Tool added successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving tool');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this tool?')) {
      try {
        await api.delete(`/tools/${id}`);
        toast.success('Tool deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete tool');
      }
    }
  };

  const handleExport = (type) => {
    window.open(`http://localhost:5001/api/export/${type}?token=${localStorage.getItem('token')}`, '_blank');
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
      <div className="flex flex-col sm:flex-row justify-between items-center glass-panel p-5 rounded-2xl">
        <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">Tracked AI Tools</h2>
        <div className="flex space-x-3">
          <button onClick={() => handleExport('pdf')} className="flex items-center px-4 py-2 text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </button>
          <button onClick={() => handleExport('excel')} className="flex items-center px-4 py-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Excel
          </button>
          <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Add Tool
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Tool Name</th>
                <th className="px-6 py-4">Emails Attached</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">End Date</th>
                <th className="px-6 py-4">Renewal Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {tools.map((tool) => (
                <tr key={tool._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-medium text-white">{tool.toolName}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 w-48">
                      {tool.emails.map(e => (
                        <span key={e._id} className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                          {e.emailAddress}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{format(new Date(tool.startDate), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${new Date(tool.endDate) < new Date() ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-gray-400'}`}>
                      {format(new Date(tool.endDate), 'MMM dd, yyyy')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{format(new Date(tool.renewalDate), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenModal(tool)} className="p-2 text-gray-400 hover:text-indigo-400 transition-colors bg-white/5 hover:bg-indigo-500/20 rounded-lg mr-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(tool._id)} className="p-2 text-gray-400 hover:text-rose-400 transition-colors bg-white/5 hover:bg-rose-500/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {tools.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-3">
                        <Trash2 className="w-8 h-8 opacity-50" />
                      </div>
                      No tools tracked yet. Add your first AI tool!
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="glass-panel w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto rounded-2xl border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{formData.id ? 'Edit AI Tool' : 'Add New AI Tool'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              <div>
                <label className="block mb-1.5 font-medium text-gray-300">Tool Name <span className="text-rose-500">*</span></label>
                <input required type="text" className="w-full px-4 py-2.5 rounded-xl glass-input placeholder-gray-500" placeholder="e.g. Midjourney Pro" value={formData.toolName} onChange={e => setFormData({...formData, toolName: e.target.value})} />
              </div>
              
              <div>
                <label className="block mb-1.5 font-medium text-gray-300">Associated Emails</label>
                <select multiple className="w-full px-4 py-2.5 rounded-xl glass-input h-28 [&>option]:p-2 [&>option:hover]:bg-indigo-500/40 [&>option:checked]:bg-indigo-500/40" value={formData.emails} onChange={e => setFormData({...formData, emails: Array.from(e.target.selectedOptions, option => option.value)})}>
                  {emailsContext.map(email => (
                    <option key={email._id} value={email._id} className="rounded-md mb-1 cursor-pointer">{email.emailAddress} {email.description && `(${email.description})`}</option>
                  ))}
                </select>
                <p className="text-xs text-indigo-400/80 mt-2 flex items-center">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
                  Hold CTRL/CMD to select multiple emails
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 font-medium text-gray-300">Limit Start <span className="text-rose-500">*</span></label>
                  <input required type="datetime-local" className="w-full px-4 py-2.5 rounded-xl glass-input scheme-dark" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block mb-1.5 font-medium text-gray-300">Limit End <span className="text-rose-500">*</span></label>
                  <input required type="datetime-local" className="w-full px-4 py-2.5 rounded-xl glass-input scheme-dark" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block mb-1.5 font-medium text-gray-300">Renewal Date <span className="text-rose-500">*</span></label>
                <input required type="datetime-local" className="w-full px-4 py-2.5 rounded-xl glass-input scheme-dark" value={formData.renewalDate} onChange={e => setFormData({...formData, renewalDate: e.target.value})} />
              </div>
              
              <div>
                <label className="block mb-1.5 font-medium text-gray-300">Notes (Optional)</label>
                <textarea className="w-full px-4 py-2.5 rounded-xl glass-input placeholder-gray-500 resize-none" placeholder="Add some details..." rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-300 font-medium bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-white font-medium bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all">Save Tool</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

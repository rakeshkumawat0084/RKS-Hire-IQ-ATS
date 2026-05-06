import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { 
  Users as UsersIcon, 
  Search, 
  Trash2, 
  Shield, 
  User, 
  Edit2,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserRecord {
  _id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', isAdmin: false });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        alert('User deleted successfully');
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const startEdit = (user: UserRecord) => {
    setEditingUser(user);
    setEditForm({ 
      fullName: user.fullName, 
      email: user.email, 
      isAdmin: user.isAdmin 
    });
  };

  const saveUser = async () => {
    if (!editingUser) return;
    try {
      const response = await api.patch(`/admin/users/${editingUser._id}`, editForm);
      setUsers(users.map(u => u._id === editingUser._id ? response.data : u));
      setEditingUser(null);
      alert('User updated successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-8 relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-accent/5 blur-[100px] md:blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-500/5 blur-[100px] md:blur-[130px] rounded-full pointer-events-none"></div>

      {/* Header Section */}
      <div className="flex flex-col gap-3 md:gap-4 relative z-10">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-black italic uppercase tracking-tighter flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <UsersIcon className="text-accent w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8" />
            </div>
            <span className="truncate">User Matrix</span>
          </h1>
          <p className="text-text-muted mt-1 md:mt-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-60">Global access control system</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full overflow-hidden group">
          <Search className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors flex-shrink-0" size={16} />
          <input 
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-bg-secondary/60 border border-white/5 text-text-primary text-sm md:text-base rounded-lg md:rounded-2xl pl-10 md:pl-14 pr-4 md:pr-6 py-2.5 md:py-4 outline-none input-glow w-full transition-all font-bold italic backdrop-blur-md"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card-modern rounded-2xl md:rounded-[2.5rem] border border-white/5 overflow-hidden relative z-10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-bg-secondary/40 backdrop-blur-md">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">Email</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">Role</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-bg-card/20">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-text-muted animate-pulse font-black uppercase tracking-widest italic opacity-40">Loading...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-text-muted italic font-black uppercase tracking-widest opacity-40">No users found</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-accent/5 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${user.isAdmin ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div className="font-black text-text-primary text-xs italic uppercase tracking-tighter truncate">{user.fullName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-text-primary opacity-80 truncate">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full inline-flex items-center gap-1 italic shadow-sm border ${
                        user.isAdmin ? 'bg-accent/20 text-accent border-accent/40' : 'bg-white/5 text-text-muted border-white/10'
                      }`}>
                        {user.isAdmin && <Shield size={10} />}
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-text-muted uppercase opacity-60">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 group-hover:opacity-100">
                        <button 
                          onClick={() => startEdit(user)}
                          className="p-2 bg-white/5 border border-white/5 rounded-lg text-text-secondary hover:text-accent hover:border-accent hover:bg-accent/5 transition-all"
                          aria-label="Edit user"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteUser(user._id)}
                          className="p-2 bg-white/5 border border-white/5 rounded-lg text-text-secondary hover:text-accent-soft transition-all"
                          aria-label="Delete user"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-2 md:hidden relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-text-muted animate-pulse font-black uppercase tracking-widest italic opacity-40">Loading...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-text-muted italic font-black uppercase tracking-widest opacity-40">No users found</div>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <motion.div 
              key={user._id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-modern p-3 md:p-4 rounded-lg md:rounded-xl border border-white/5 bg-bg-card/20 hover:bg-accent/5 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 ${user.isAdmin ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-text-primary text-xs italic uppercase tracking-tight truncate">{user.fullName}</div>
                  <div className="text-[11px] text-text-muted opacity-70 truncate">{user.email}</div>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full inline-flex items-center gap-1 flex-shrink-0 border ${
                  user.isAdmin ? 'bg-accent/20 text-accent border-accent/40' : 'bg-white/5 text-text-muted border-white/10'
                }`}>
                  {user.isAdmin && <Shield size={8} />}
                  {user.isAdmin ? 'A' : 'U'}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-text-muted uppercase opacity-60">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => startEdit(user)}
                  className="flex-1 p-2 bg-white/5 border border-white/5 rounded-lg text-text-secondary hover:text-accent hover:border-accent hover:bg-accent/5 transition-all flex items-center justify-center gap-1 text-xs font-bold"
                  aria-label="Edit"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  onClick={() => deleteUser(user._id)}
                  className="flex-1 p-2 bg-white/5 border border-white/5 rounded-lg text-text-secondary hover:text-accent-soft transition-all flex items-center justify-center gap-1 text-xs font-bold"
                  aria-label="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md card-modern rounded-2xl md:rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-4 md:p-8 pb-0 flex items-center justify-between">
                <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tight text-gradient">Edit User</h3>
                <button 
                  onClick={() => setEditingUser(null)} 
                  className="p-2 hover:bg-white/5 rounded-lg text-text-primary outline-none transition-all"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 md:p-8 space-y-4 md:space-y-6 max-h-[calc(100vh-150px)] overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic opacity-60">Full Name</label>
                  <input 
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    className="w-full bg-bg-secondary/40 border border-white/5 text-text-primary rounded-lg md:rounded-xl px-3 md:px-6 py-2 md:py-4 outline-none input-glow font-bold italic text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic opacity-60">Email</label>
                  <input 
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full bg-bg-secondary/40 border border-white/5 text-text-primary rounded-lg md:rounded-xl px-3 md:px-6 py-2 md:py-4 outline-none input-glow font-bold italic text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 bg-accent/5 p-3 md:p-5 rounded-lg md:rounded-xl border border-accent/20 transition-all hover:bg-accent/10">
                  <div className="relative w-5 h-5">
                    <input 
                      type="checkbox"
                      id="isAdmin"
                      checked={editForm.isAdmin}
                      onChange={(e) => setEditForm({...editForm, isAdmin: e.target.checked})}
                      className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-5 h-5 rounded-lg border-2 border-accent/40 bg-transparent flex items-center justify-center transition-all peer-checked:bg-accent peer-checked:border-accent">
                      <Check className="text-white w-3 h-3 scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                  </div>
                  <label htmlFor="isAdmin" className="text-xs md:text-sm font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer text-text-primary italic">
                    <Shield size={14} className={`${editForm.isAdmin ? 'text-accent fill-accent/20' : 'text-text-muted opacity-40'} transition-all`} />
                    Administrator
                  </label>
                </div>
              </div>

              <div className="p-4 md:p-8 border-t border-white/5 flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 bg-bg-secondary/40 backdrop-blur-sm">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 md:py-4 bg-bg-secondary/60 text-text-primary border border-white/5 rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-bg-hover transition-all italic"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveUser}
                  className="flex-1 py-2.5 md:py-4 bg-accent text-white rounded-lg md:rounded-xl font-black uppercase tracking-[0.15em] text-[10px] md:text-xs hover:bg-accent/90 transition-all italic flex items-center justify-center gap-2"
                >
                  <Check size={14} />
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

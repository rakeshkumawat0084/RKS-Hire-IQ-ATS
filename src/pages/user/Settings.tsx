import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Trash2 } from 'lucide-react';
import { useUserStore } from '../../store';
import api from '../../lib/api';

export default function UserSettings() {
  const navigate = useNavigate();
  const { logout } = useUserStore();
  const [mfaEnabled, setMfaEnabled] = useState(() => localStorage.getItem('hireiq-mfa') === 'on');
  const [notice, setNotice] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const toggleMfa = () => {
    const next = !mfaEnabled;
    setMfaEnabled(next);
    localStorage.setItem('hireiq-mfa', next ? 'on' : 'off');
    setNotice(next ? 'MFA is enabled for this browser session.' : 'MFA is disabled.');
  };

  const deleteAccount = () => {
    const confirmed = window.confirm('Delete this account data from this browser? This clears your local app session and activity history.');
    if (!confirmed) return;
    localStorage.removeItem('rks-activity-history');
    localStorage.removeItem('rks-resume-pipeline');
    logout();
    navigate('/register');
  };

  const updatePassword = async () => {
    if (passwordForm.newPassword.length < 6) {
      setNotice('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotice('New password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put('/user/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setNotice('Password updated successfully.');
    } catch (err: any) {
      setNotice(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-text-secondary">Manage your account preferences and security.</p>
      </header>

      {notice && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-bold text-emerald-300">
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}

      <div className="glass p-8 rounded-3xl border border-border space-y-8 career-coach-card">
        <section>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ShieldCheck className="text-accent" /> Security</h3>
          <div className="space-y-4">
             <div className="flex flex-col sm:justify-between sm:flex-row sm:items-center p-5 md:p-6 bg-bg-hover rounded-2xl border border-border gap-4">
                <div>
                   <div className="font-bold text-lg">Two-Factor Authentication</div>
                   <div className="text-xs text-text-muted mt-1">Add an extra layer of security to your account.</div>
                </div>
                <button
                  onClick={toggleMfa}
                  className="w-full sm:w-auto px-6 py-2.5 border border-accent text-accent rounded-xl text-sm font-bold hover:bg-accent hover:text-white transition-all active:scale-95 shadow-sm"
                >
                  {mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
                </button>
             </div>
             <div className="flex flex-col sm:justify-between sm:flex-row sm:items-center p-5 md:p-6 bg-bg-hover rounded-2xl border border-border gap-4">
                <div>
                   <div className="font-bold text-lg">Password Management</div>
                   <div className="text-xs text-text-muted mt-1">Change your current login password directly.</div>
                </div>
                <div className="grid w-full sm:max-w-xl grid-cols-1 gap-3 md:grid-cols-3">
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Current password"
                    className="w-full rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm outline-none focus:border-accent/40"
                  />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="New password"
                    className="w-full rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm outline-none focus:border-accent/40"
                  />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className="w-full rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm outline-none focus:border-accent/40"
                  />
                  <button
                    onClick={updatePassword}
                    disabled={passwordSaving}
                    className="md:col-span-3 w-full px-6 py-2.5 glass rounded-xl text-sm font-bold hover:bg-white/5 transition-all active:scale-95 shadow-sm border border-white/10 disabled:opacity-50"
                  >
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
             </div>
          </div>
        </section>

        <section className="pt-10 md:pt-12 border-t border-border">
          <h3 className="text-xl font-bold mb-6 text-accent">Danger Zone</h3>
          <div className="p-6 md:p-8 bg-accent/5 border border-accent/20 rounded-[2rem]">
             <div className="flex flex-col sm:justify-between sm:flex-row sm:items-center gap-6">
                <div>
                   <div className="font-bold text-lg">Delete Account</div>
                   <div className="text-xs text-text-muted mt-1 max-w-sm">Permanently remove all your data, analysis history, and recordings from RKS. This cannot be undone.</div>
                </div>
                <button
                  onClick={deleteAccount}
                  className="w-full sm:w-auto px-10 py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all active:scale-95 shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}

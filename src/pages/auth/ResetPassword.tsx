import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import api from '../../lib/api';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-bg-primary">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <Link to="/" className="text-4xl font-bold mb-8 block tracking-tighter">RKS</Link>
          <h2 className="text-3xl font-bold">Set New Password</h2>
          <p className="text-text-secondary mt-2">Almost there! Create your new secure password</p>
        </div>

        {error && (
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl text-accent-soft text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Password Reset Successful</h3>
              <p className="text-text-secondary">Redirecting you to login in a few seconds...</p>
            </div>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-accent font-bold hover:underline"
            >
              Go to Login Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  {...register('password')}
                  type="password"
                  className="w-full bg-bg-secondary border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 ring-accent/20 transition-all font-medium" 
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-accent-soft text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  {...register('confirmPassword')}
                  type="password"
                  className="w-full bg-bg-secondary border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 ring-accent/20 transition-all font-medium" 
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="text-accent-soft text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              {loading ? 'Updating password...' : 'Update Password'}
            </button>

            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-text-secondary hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Return to Login
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}

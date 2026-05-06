import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useState } from 'react';
import api from '../../lib/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset link. Please try again.');
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
          <h2 className="text-3xl font-bold">Reset Password</h2>
          <p className="text-text-secondary mt-2">Enter your email and we'll send you instructions</p>
        </div>

        {error && (
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl text-accent-soft text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <Send size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Check your inbox</h3>
              <p className="text-text-secondary">If an account exists for that email, we've sent instructions to reset your password.</p>
              <p className="text-accent text-sm bg-accent/5 p-3 rounded-lg border border-accent/10">
                <strong>Dev Tip:</strong> Since this is a dev environment, check the <strong>Server Console</strong> (terminal logs) to find the reset password link!
              </p>
            </div>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-accent font-bold hover:underline"
            >
              <ArrowLeft size={18} />
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  {...register('email')}
                  className="w-full bg-bg-secondary border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 ring-accent/20 transition-all font-medium" 
                  placeholder="name@email.com"
                />
              </div>
              {errors.email && <p className="text-accent-soft text-xs mt-1">{errors.email.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>

            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-text-secondary hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}

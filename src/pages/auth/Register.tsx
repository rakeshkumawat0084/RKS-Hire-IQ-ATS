import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Target, User, ArrowLeft } from 'lucide-react';
import { useUserStore } from '../../store';
import { useState } from 'react';
import api from '../../lib/api';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onRegister = async (data: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', data);
      const { user, token } = response.data;
      
      setUser(user, token);
      
      navigate('/app/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative">
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-50">
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors italic"
        >
          <div className="w-8 h-8 rounded-full border border-border bg-bg-secondary flex items-center justify-center group-hover:border-accent/30 transition-all">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Back to Home
        </button>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6 md:space-y-8"
        >
          <div className="text-center">
            <Link to="/" className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 block tracking-tighter uppercase italic text-text-primary">RKS</Link>
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight text-text-primary">Create Account</h2>
            <p className="text-text-secondary mt-2 text-sm md:text-base font-medium opacity-80 italic">Start your AI-powered career journey</p>
          </div>

          {error && (
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl text-accent text-sm font-bold italic">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onRegister)} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-text-muted italic">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                <input 
                  {...register('fullName')}
                  className="w-full bg-bg-secondary border border-border rounded-xl md:rounded-2xl pl-12 pr-4 py-3.5 md:py-4 outline-none input-glow font-medium text-sm md:text-base placeholder:text-text-muted/30 text-text-primary" 
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="text-accent text-[10px] mt-1 font-bold uppercase italic">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-text-muted italic">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                <input 
                  {...register('email')}
                  className="w-full bg-bg-secondary border border-border rounded-xl md:rounded-2xl pl-12 pr-4 py-3.5 md:py-4 outline-none input-glow font-medium text-sm md:text-base placeholder:text-text-muted/30 text-text-primary" 
                  placeholder="name@email.com"
                />
              </div>
              {errors.email && <p className="text-accent text-[10px] mt-1 font-bold uppercase italic">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-text-muted italic">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4.5 h-4.5" />
                <input 
                  {...register('password')}
                  type="password"
                  className="w-full bg-bg-secondary border border-border rounded-xl md:rounded-2xl pl-12 pr-4 py-3.5 md:py-4 outline-none input-glow font-medium text-sm md:text-base placeholder:text-text-muted/30 text-text-primary" 
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-accent text-[10px] mt-1 font-bold uppercase italic">{errors.password.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 mt-4 h-12 md:h-14 flex items-center justify-center"
            >
              {loading ? 'Initializing...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-text-muted text-[10px] font-black uppercase tracking-widest italic">
            Already have an account? <Link to="/login" className="text-accent font-black hover:underline ml-1">Sign in instead</Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:block bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg-primary to-transparent"></div>
        <div className="h-full flex flex-col justify-center p-20 relative z-10 text-center lg:text-left">
           <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-8 border border-accent/30 mx-auto lg:mx-0">
            <Target className="text-accent" size={32} />
          </div>
          <h2 className="text-5xl font-bold mb-6 text-text-primary">Join the Revolution</h2>
          <p className="text-text-secondary text-xl max-w-lg leading-relaxed mx-auto lg:mx-0">
            RKS is more than a platform; it's your personal AI career co-pilot, designed to navigate the complexities of the modern job market.
          </p>
        </div>
      </div>
    </div>
  );
}

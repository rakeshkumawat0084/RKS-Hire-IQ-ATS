import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import api from '../../lib/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  type: z.string().min(1, 'Inquiry type is required'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  interests: z.array(z.string()).optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      interests: [],
      subject: '',
      type: 'General',
    }
  });

  const onSubmit = async (data: ContactFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/leads', {
        ...data,
        status: 'new',
        priority: 'medium',
        source: 'contact_form',
      });
      setSubmitted(true);
      reset();
    } catch (err: any) {
      console.error('Submission error:', err);
      const message = err.response?.data?.error || 'Failed to send message. Please check your connection.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center px-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 bg-success/20 text-success flex items-center justify-center rounded-3xl mx-auto mb-8 border border-success/30">
            <Send size={40} />
          </div>
          <h2 className="text-4xl font-bold mb-4 text-text-primary">Message Sent!</h2>
          <p className="text-text-secondary mb-8">We've received your inquiry and our team will get back to you within 24 hours.</p>
          <button onClick={() => setSubmitted(false)} className="bg-accent px-8 py-3 rounded-full font-bold">Send Another Message</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 md:py-20 px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center md:text-left"
      >
        <span className="text-accent font-bold mb-4 block uppercase tracking-widest text-xs">GET IN TOUCH</span>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 md:mb-8 tracking-tight text-text-primary">Let's start a conversation</h1>
        <p className="text-text-secondary text-base md:text-lg mb-10 md:mb-12 max-w-lg mx-auto md:mx-0">
          Have questions about our platform or interested in an enterprise plan? We're here to help you power your innovation.
        </p>

        <div className="space-y-6 md:space-y-8 max-w-sm mx-auto md:mx-0">
          {[
            { icon: <Mail className="text-accent w-5 h-5" />, title: "Email Us", detail: "rkscode@gmail.com" },
            { icon: <Phone className="text-accent w-5 h-5" />, title: "Call Us", detail: "+91-94139074XX" },
            { icon: <MapPin className="text-accent w-5 h-5" />, title: "Visit Us", detail: "123 Innovation Drive, Tech City, TC 10101" }
          ].map((item, i) => (
            <div key={i} className="flex gap-4 md:gap-6 items-center text-left">
              <div className="w-10 h-10 md:w-12 md:h-12 glass rounded-xl md:rounded-2xl flex items-center justify-center border border-border shrink-0">
                {item.icon}
              </div>
              <div>
                <div className="font-bold text-sm md:text-base text-text-primary">{item.title}</div>
                <div className="text-text-secondary text-xs md:text-sm">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass p-6 md:p-12 rounded-3xl md:rounded-[2.5rem] border border-border shadow-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl text-accent text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-text-secondary">Full Name</label>
              <input 
                {...register('name')}
                className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3.5 outline-none focus:border-accent/50 transition-all text-sm text-text-primary" 
                placeholder="John Doe"
              />
              {errors.name && <p className="text-accent text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-text-secondary">Email</label>
              <input 
                {...register('email')}
                className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3.5 outline-none focus:border-accent/50 transition-all text-sm text-text-primary" 
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-accent text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-text-secondary">Subject</label>
                <select 
                  {...register('subject')}
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3.5 outline-none focus:border-accent/50 transition-all text-sm appearance-none text-text-primary"
                >
                  <option value="">Select Subject</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Billing Support">Billing Support</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Technical Issue">Technical Issue</option>
                </select>
                {errors.subject && <p className="text-accent text-xs mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-text-secondary">Inquiry Type</label>
                <select 
                  {...register('type')}
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3.5 outline-none focus:border-accent/50 transition-all text-sm appearance-none text-text-primary"
                >
                  <option value="Individual">Individual</option>
                  <option value="Business">Business</option>
                  <option value="Student">Student</option>
                  <option value="Other">Other</option>
                </select>
                {errors.type && <p className="text-accent text-xs mt-1">{errors.type.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-text-secondary">Message</label>
              <textarea 
                {...register('message')}
                rows={4}
                className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3.5 outline-none focus:border-accent/50 transition-all resize-none text-sm text-text-primary" 
                placeholder="Tell us more about your needs..."
              />
              {errors.message && <p className="text-accent text-xs mt-1">{errors.message.message}</p>}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-accent py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent/90 transition-all disabled:opacity-50 text-white active:scale-95 shadow-lg shadow-accent/20"
          >
            {loading ? 'Sending...' : 'Send Message'} <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

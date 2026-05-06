import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Shield, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
}

export default function PaymentModal({ isOpen, onClose, planName, price }: PaymentModalProps) {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [cardName, setCardName] = useState('');

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setTimeout(() => setStep('success'), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-bg-primary border border-border w-full max-w-lg rounded-3xl overflow-hidden relative z-10 shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-text-muted hover:text-text-primary transition-colors z-20"
            >
              <X size={20} />
            </button>

            {step === 'details' && (
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                    <CreditCard className="text-accent" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight italic">Secure Checkout</h3>
                    <p className="text-text-muted text-xs uppercase font-bold tracking-widest">Plan: {planName}</p>
                  </div>
                </div>

                <div className="bg-bg-secondary p-4 rounded-2xl mb-8 border border-border/50">
                  <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest mb-2">
                    <span className="text-text-secondary">{planName} Subscription</span>
                    <span>₹{price}/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-accent text-lg font-black italic">
                    <span>TOTAL DUE TODAY</span>
                    <span>₹{price}</span>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 italic">Cardholder Name</label>
                    <input 
                      required
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="JOHN DOE"
                      className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-all uppercase placeholder:opacity-30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 italic">Card Number</label>
                    <div className="relative">
                      <input 
                        required
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-all pl-12"
                      />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 italic">Expiry</label>
                      <input required type="text" placeholder="MM/YY" className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 italic">CVC</label>
                      <input required type="text" placeholder="***" className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-all" />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-accent text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm mt-4 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
                  >
                    Pay ₹{price} <ArrowRight size={16} />
                  </button>

                  <div className="flex items-center justify-center gap-4 mt-6 opacity-40 grayscale">
                    <Shield size={16} />
                    <Lock size={16} />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">SSL Encrypted</span>
                  </div>
                </form>
              </div>
            )}

            {step === 'processing' && (
              <div className="p-20 text-center">
                <div className="mb-8 flex justify-center">
                  <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-2">Processing Payment...</h3>
                <p className="text-text-muted text-xs uppercase font-bold tracking-widest">Please do not refresh the page</p>
              </div>
            )}

            {step === 'success' && (
              <div className="p-12 text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center border border-success/20 mx-auto mb-8"
                >
                  <CheckCircle2 size={40} className="text-success" />
                </motion.div>
                <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-4">Payment Successful!</h3>
                <p className="text-text-secondary text-base mb-8 font-medium">
                  Welcome to the {planName} tier, {cardName}. Your account has been upgraded successfully.
                </p>
                <button 
                  onClick={onClose}
                  className="px-10 py-4 bg-bg-secondary border border-border rounded-xl font-black uppercase tracking-widest text-xs hover:bg-bg-hover transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

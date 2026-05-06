import { motion } from 'framer-motion';
import { Check, Zap, Shield, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import PaymentModal from '../../components/modals/PaymentModal';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for starters and students.',
    features: [
      '2 Resume Analyses / month',
      '1 Portfolio creation',
      '3 Skills Lab sessions',
      '2 Mock Interviews / month',
      '1 AI Career Roadmap',
      'Basic Interview Prep',
      'Standard Job Matching'
    ],
    buttonText: 'Get Started',
    highlight: false
  },
  {
    name: 'Pro',
    price: '999',
    description: 'Best for active job seekers.',
    features: [
      'Unlimited Resume Analyses',
      '5 Portfolios creation',
      '7 Skills Lab sessions',
      '10 Mock Interviews / month',
      '5 AI Career Roadmaps',
      'Priority Job Matching',
      'Personal Branding Guide'
    ],
    buttonText: 'Upgrade to Pro',
    highlight: true,
    icon: <Zap className="text-accent" />
  },
  {
    name: 'Ultra Pro',
    price: '3999',
    description: 'Elite coaching and placement.',
    features: [
      'Everything in Pro',
      'Unlimited Portfolios',
      'Unlimited Skills Lab',
      'Unlimited Mock Interviews',
      'Unlimited AI Roadmaps',
      '1-on-1 Human Sessions',
      'Guaranteed Interviews',
      'Global Job Placement'
    ],
    buttonText: 'Get Elite Access',
    highlight: false,
    icon: <Star className="text-yellow-500" />
  }
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  return (
    <div className="px-6 md:px-12 py-12 md:py-20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-7xl font-black mb-4 md:mb-6 tracking-tighter leading-tight text-text-primary">
              CHOOSE YOUR <span className="text-accent">PATH</span>
            </h1>
            <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto px-4">
              Simple, transparent pricing built for professionals who want to lead.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] relative flex flex-col border transition-all hover:scale-[1.01] ${
                plan.highlight ? 'border-accent shadow-[0_0_40px_rgba(99,102,241,0.15)] ring-1 ring-accent/20' : 'border-border'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 right-6 bg-accent text-white text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1.5 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-text-primary">{plan.name}</h3>
                  <p className="text-text-muted text-xs md:text-sm mt-1">{plan.description}</p>
                </div>
                <div className="shrink-0 scale-90 md:scale-100">
                  {plan.icon}
                </div>
              </div>

              <div className="mb-6 md:mb-8 flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-black text-text-primary">₹{plan.price}</span>
                <span className="text-text-muted text-xs md:text-sm">/month</span>
              </div>

              <div className="space-y-3 md:space-y-4 mb-8 md:mb-10 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-xs md:text-sm text-text-secondary">
                    <Check size={14} className="text-accent shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedPlan(plan)}
                className={`w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-sm md:text-base ${
                  plan.highlight 
                    ? 'bg-accent text-white shadow-xl shadow-accent/20 hover:bg-accent/90' 
                    : 'bg-bg-hover border border-border hover:bg-bg-secondary'
                }`}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 md:mt-20 glass p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-border flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-success/10 flex items-center justify-center border border-success/20 shrink-0">
              <Shield className="text-success w-7 h-7 md:w-8 md:h-8" />
            </div>
            <div>
              <h4 className="text-lg md:text-xl font-bold text-text-primary">Secure Transactions</h4>
              <p className="text-text-secondary text-sm md:text-base">We use bank-grade encryption for all payments.</p>
            </div>
          </div>
          <p className="text-text-muted text-xs md:text-sm max-w-sm">
            Need a custom plan for your organization? <Link to="/contact" className="text-accent font-bold hover:underline">Contact us</Link> for enterprise solutions.
          </p>
        </div>
      </div>

      <PaymentModal 
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        planName={selectedPlan?.name || ''}
        price={selectedPlan?.price || '0'}
      />
    </div>
  );
}

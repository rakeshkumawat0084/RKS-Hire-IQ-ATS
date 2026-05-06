import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="px-4 md:px-6 py-12 md:py-20 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 md:p-20 rounded-3xl md:rounded-[3rem] border border-border"
        >
          <header className="mb-8 md:mb-12 border-b border-white/10 pb-8">
            <h1 className="text-3xl md:text-6xl font-black mb-4 tracking-tighter uppercase italic">Privacy Policy</h1>
            <p className="text-text-muted italic text-xs md:text-base">Last Updated: April 2024</p>
          </header>

          <div className="space-y-8 md:space-y-10 text-text-secondary leading-relaxed text-sm md:text-base">
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
              <p className="mb-4 opacity-80 leading-relaxed">
                At RKS HIREIQ, we collect personal information that you provide to us, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80 leading-relaxed">
                <li>Account Information: Name, email address, and password.</li>
                <li>Professional Information: Resumes, work history, and skills provided for analysis.</li>
                <li>Interaction Data: Responses provided during AI mock interviews.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Data</h2>
              <p>
                We use your information to provide and improve our services, specifically:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Generating AI-powered resume insights and scores.</li>
                <li>Providing behavioral feedback on mock interviews.</li>
                <li>Matching your profile with relevant career opportunities.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
              <p>
                We prioritize the security of your professional data. We use industry-standard encryption and security protocols to protect your information from unauthorized access, disclosure, or alteration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal data at any time through your account settings. If you wish to permanently delete your data, please contact our support team.
              </p>
            </section>

            <section className="pt-8 border-t border-white/10 mt-12 text-sm text-text-muted">
              <p>
                If you have any questions about this Privacy Policy, please reach out to us at <span className="text-accent font-bold">privacy@rkshireiq.com</span>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

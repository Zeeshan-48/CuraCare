import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left leading-relaxed">
      <h1 className="text-4xl font-extrabold font-display text-txt-title mb-6">
        Terms & Conditions
      </h1>
      <p className="text-sm text-dark-500 mb-8">Last updated: July 17, 2026</p>

      <div className="space-y-6 text-dark-600 dark:text-dark-350">
        <section>
          <h2 className="text-xl font-bold font-display text-txt-title mb-3">1. Agreement to Terms</h2>
          <p>
            By accessing and ordering from CuraCare, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-display text-txt-title mb-3">2. Prescription Verification Policy</h2>
          <p>
            Prescription medicines will only be sold and dispatched after verification of a valid prescription document by our licensed pharmacists. We reserve the right to cancel orders if the uploaded prescription is invalid, expired, or has discrepancies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-display text-txt-title mb-3">3. Medical Disclaimer</h2>
          <p>
            The content, health tips, and AI medicine recommendations on CuraCare are for informational purposes only and do NOT substitute professional medical advice, diagnosis, or treatment. Always consult with your doctor before starting any medication.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-display text-txt-title mb-3">4. Limitation of Liability</h2>
          <p>
            CuraCare is not liable for any health complications arising from self-medication, incorrect dosage intake, or misuse of products purchased on our website.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;

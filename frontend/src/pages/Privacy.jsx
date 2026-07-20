import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left leading-relaxed">
      <h1 className="text-4xl font-extrabold font-display text-txt-title mb-6">
        Privacy Policy
      </h1>
      <p className="text-sm text-dark-500 mb-8">Last updated: July 17, 2026</p>

      <div className="space-y-6 text-dark-600 dark:text-dark-350">
        <section>
          <h2 className="text-xl font-bold font-display text-txt-title mb-3">1. Introduction</h2>
          <p>
            CuraCare ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our pharmacy and healthcare services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-display text-txt-title mb-3">2. Information We Collect</h2>
          <p>
            We collect personal information that you provide to us, including your name, address, email address, phone number, payment details, and medical prescriptions when required to complete your health orders.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-display text-txt-title mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>To process and deliver your medical orders and billing.</li>
            <li>To verify prescriptions through licensed pharmacists.</li>
            <li>To send order notifications, updates, and customer support communications.</li>
            <li>To customize health recommendations and wellness articles.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold font-display text-txt-title mb-3">4. Information Sharing & Security</h2>
          <p>
            We do not sell or rent your personal or medical data to third parties. We use strict encryption algorithms (AES-256) and security certificates to protect database logs against unverified queries.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;

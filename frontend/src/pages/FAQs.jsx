import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      question: 'How do I upload a prescription?',
      answer: 'During the checkout process, if any item in your cart requires a prescription, a file upload prompt will automatically appear. You can upload an image or PDF of your valid doctor prescription. Our pharmacist team will verify it before dispatching your order.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 2-3 business days. We also offer Express Delivery in selected metropolitan areas, which delivers your medications within 24 hours of prescription approval.',
    },
    {
      question: 'Can I return my medicines?',
      answer: 'Due to safety and regulation policies regarding pharmaceutical storage stability, we cannot accept returns of prescription medicines once they have left our pharmacy. For non-medical devices, returns are accepted within 7 days in original packaging.',
    },
    {
      question: 'Is my personal data and medical history secure?',
      answer: 'Yes, patient privacy is our top priority. All prescription documents, medical details, and transaction data are stored securely using AES-256 encryption. We are fully compliant with standard data protection guidelines.',
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order is approved, you will receive an email confirmation with a tracking number (e.g., CC-XXXX-XXXX). You can copy this number and track the status in the "My Orders" tab on your profile page.',
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-sm font-bold text-primary-500 tracking-wider uppercase font-display">
          Got Questions?
        </span>
        <h1 className="text-4xl font-extrabold font-display text-txt-title mt-3 mb-6">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-txt-muted">
          Find fast answers to common inquiries regarding prescriptions, orders, billing, and account management.
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="glass-panel rounded-2xl overflow-hidden border border-bdr-light transition-all duration-300"
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center justify-between p-6 text-left font-display font-semibold text-txt-title hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <HelpCircle size={18} className="text-primary-500 shrink-0" />
                {faq.question}
              </span>
              {activeIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <AnimatePresence initial={false}>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="px-6 pb-6 pt-1 text-sm text-dark-550 dark:text-dark-400 border-t border-bdr-light/50 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;

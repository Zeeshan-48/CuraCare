import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useToast } from '../components/ui/Toast.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { submitMessageApi, getErrorMessage } from '../utils/api.js';

const Contact = () => {
  const { showToast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.target;
    const data = new FormData(formEl);
    
    setIsSending(true);
    try {
      await submitMessageApi({
        name: data.get('name'),
        email: data.get('email'),
        subject: data.get('subject'),
        message: data.get('message'),
      });
      showToast(`Thank you, ${data.get('name')}! Your message has been sent. We'll reply soon.`, 'success');
      formEl.reset();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-sm font-bold text-primary-500 tracking-wider uppercase font-display">
          Get In Touch
        </span>
        <h1 className="text-4xl font-extrabold font-display text-txt-title mt-3 mb-6">
          We'd Love To Hear From You
        </h1>
        <p className="text-lg text-txt-muted">
          Have questions about prescriptions, orders, or drug usage? Our licensed pharmacists and customer service team are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-bdr-light">
            <h3 className="text-xl font-bold font-display text-txt-title mb-6">
              Contact Details
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary-500 shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-txt-title">Our Location</p>
                  <p className="text-sm text-txt-muted mt-1">
                    123 Medical Avenue, Clinic Tower, NY 10001
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary-500 shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-txt-title">Call Us</p>
                  <p className="text-sm text-txt-muted mt-1">+1 (800) 555-CURA</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary-500 shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-txt-title">Email Us</p>
                  <p className="text-sm text-txt-muted mt-1">support@curacare.com</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary-500 shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-txt-title">Business Hours</p>
                  <p className="text-sm text-txt-muted mt-1">
                    Mon - Sat: 9:00 AM - 9:00 PM<br />Sunday: 10:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-2xl">
          <h3 className="text-xl font-bold font-display text-txt-title mb-6">
            Send Us a Message
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Your Name" name="name" type="text" placeholder="John Doe" required />
              <Input label="Your Email" name="email" type="email" placeholder="john@example.com" required />
            </div>
            <Input label="Subject" name="subject" type="text" placeholder="Prescription Question / Delivery Inquiry" required />
            <div className="text-left mb-4">
              <label className="block text-sm font-medium text-txt-main mb-1.5 font-display">
                Message
              </label>
              <textarea
                name="message"
                rows="5"
                placeholder="Write your query details here..."
                required
                className="form-input resize-none"
              />
            </div>
            <div className="text-right">
              <Button type="submit" variant="primary" isLoading={isSending}>
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

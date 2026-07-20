import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '../ui/Toast.jsx';

const Footer = () => {
  const { showToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      showToast('Thank you for subscribing to our health tips!', 'success');
      e.target.reset();
    }
  };

  return (
    <footer className="bg-dark-900 text-dark-400 font-sans border-t border-dark-800">
      {/* Newsletter Block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-dark-800">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-left max-w-md">
            <h3 className="text-xl font-semibold font-display text-white mb-2">
              Subscribe to our Newsletter
            </h3>
            <p className="text-sm text-dark-400">
              Get the latest health updates, drug safety announcements, and promotional discounts delivered to your inbox.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-3">
            <input
              name="email"
              type="email"
              placeholder="Enter your email address"
              required
              className="footer-input"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-left">
          {/* Brand Info */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="CuraCare Icon"
                  className="w-full h-full object-cover scale-[1.15]"
                />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Cura<span className="text-primary-400">Care</span>
              </span>
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed mb-6">
              Your trusted online pharmacy and healthcare partner. High-quality medicines, fast home delivery, and expert pharmaceutical care at your fingertips.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Facebook link"
                className="w-9 h-9 rounded-lg bg-dark-950 border border-dark-800 flex items-center justify-center hover:text-primary-400 hover:border-primary-500 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a
                href="#"
                aria-label="Twitter link"
                className="w-9 h-9 rounded-lg bg-dark-950 border border-dark-800 flex items-center justify-center hover:text-primary-400 hover:border-primary-500 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a
                href="#"
                aria-label="Instagram link"
                className="w-9 h-9 rounded-lg bg-dark-950 border border-dark-800 flex items-center justify-center hover:text-primary-400 hover:border-primary-500 transition-colors"
              >
                <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a
                href="#"
                aria-label="Linkedin link"
                className="w-9 h-9 rounded-lg bg-dark-950 border border-dark-800 flex items-center justify-center hover:text-primary-450 hover:border-primary-500 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white text-base mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary-400 transition-colors">
                  Our Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-400 transition-colors">
                  About CuraCare
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-primary-400 transition-colors">
                  FAQs & Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-white text-base mb-5">
              Services
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-dark-400">Prescription Upload</span>
              </li>
              <li>
                <span className="text-dark-400">AI Medicine Guide</span>
              </li>
              <li>
                <span className="text-dark-400">24/7 Pharmacist Chat</span>
              </li>
              <li>
                <span className="text-dark-400">Express Delivery</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-display font-semibold text-white text-base mb-5">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary-400 shrink-0 mt-0.5" />
                <span>123 Medical Avenue, Clinic Tower, Suite 404, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary-400 shrink-0" />
                <span>+1 (800) 555-CURA</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary-400 shrink-0" />
                <span>support@curacare.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-dark-950 py-6 border-t border-dark-800 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} CuraCare Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-primary-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-conditions" className="hover:text-primary-400 transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

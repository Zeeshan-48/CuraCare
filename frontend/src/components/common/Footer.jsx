import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
const Footer = () => {
  return (
    <footer className="bg-primary-900 text-primary-100/80 font-sans border-t border-primary-800">

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-10 text-left">
          {/* Brand Info */}
          <div className="lg:w-1/4 xl:w-1/3">
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
            <p className="text-sm text-primary-100/80 leading-relaxed mb-6">
              Your trusted online pharmacy and healthcare partner. High-quality medicines, fast home delivery, and expert pharmaceutical care at your fingertips.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Facebook link"
                className="w-9 h-9 rounded-lg bg-black/20 border border-primary-800 flex items-center justify-center hover:text-white hover:border-primary-400 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
              </a>
              <a
                href="#"
                aria-label="Twitter link"
                className="w-9 h-9 rounded-lg bg-black/20 border border-primary-800 flex items-center justify-center hover:text-white hover:border-primary-400 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a
                href="#"
                aria-label="Instagram link"
                className="w-9 h-9 rounded-lg bg-black/20 border border-primary-800 flex items-center justify-center hover:text-white hover:border-primary-400 transition-colors"
              >
                <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a
                href="#"
                aria-label="Linkedin link"
                className="w-9 h-9 rounded-lg bg-black/20 border border-primary-800 flex items-center justify-center hover:text-white hover:border-primary-400 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" /></svg>
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:w-3/4 xl:w-2/3 grid grid-cols-3 gap-3 sm:gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="font-display font-semibold text-white text-[11px] sm:text-base mb-3 sm:mb-5">
                Quick Links
              </h4>
              <ul className="space-y-2 sm:space-y-3 text-[10px] sm:text-sm text-primary-100/80">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home Page
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="hover:text-white transition-colors">
                    Our Products
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About CuraCare
                  </Link>
                </li>
                <li>
                  <Link to="/faqs" className="hover:text-white transition-colors">
                    FAQs & Help
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-display font-semibold text-white text-[11px] sm:text-base mb-3 sm:mb-5">
                Services
              </h4>
              <ul className="space-y-2 sm:space-y-3 text-[10px] sm:text-sm text-primary-100/80">
                <li>
                  <span>Prescription Upload</span>
                </li>
                <li>
                  <span>AI Medicine Guide</span>
                </li>
                <li>
                  <span>24/7 Pharmacist Chat</span>
                </li>
                <li>
                  <span>Express Delivery</span>
                </li>
              </ul>
            </div>

            {/* Contact Details */}
            <div>
              <h4 className="font-display font-semibold text-white text-[11px] sm:text-base mb-3 sm:mb-5">
                Contact Us
              </h4>
              <ul className="space-y-2 sm:space-y-3 text-[10px] sm:text-sm text-primary-100/80">
                <li className="flex items-start gap-1.5 sm:gap-3">
                  <MapPin size={14} className="text-primary-300 shrink-0 mt-0.5 sm:w-4.5 sm:h-4.5" />
                  <a href="https://maps.google.com/?q=987P%2BJ3F%2C%20Near%20Pathal%20kudwa%20Chowk%2C%20Pathalkudwa%2C%20Ranchi%2C%20Jharkhand%20834001" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    987P+J3F, Near Pathal kudwa Chowk, Pathalkudwa, Ranchi, Jharkhand 834001
                  </a>
                </li>
                <li className="flex items-center gap-1.5 sm:gap-3">
                  <Phone size={14} className="text-primary-300 shrink-0 sm:w-4.5 sm:h-4.5" />
                  <span className="truncate">7903719233</span>
                </li>
                <li className="flex items-center gap-1.5 sm:gap-3">
                  <Mail size={14} className="text-primary-300 shrink-0 sm:w-4.5 sm:h-4.5" />
                  <span className="truncate">zeshan1234anwar@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/20 py-4 border-t border-primary-800 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center text-xs">
          <div className="flex gap-6 text-primary-100/80">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-conditions" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

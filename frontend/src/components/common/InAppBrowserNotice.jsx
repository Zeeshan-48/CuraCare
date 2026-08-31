import React, { useState } from 'react';
import { Globe, Copy, Check, Compass } from 'lucide-react';
import {
  isInAppBrowser,
  getInAppName,
  openInChrome,
  copyCurrentUrl,
} from '../../utils/browserDetection.js';
import { useToast } from '../ui/Toast.jsx';

const InAppBrowserNotice = ({ className = '' }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!isInAppBrowser()) {
    return null;
  }

  const appName = getInAppName();

  const handleOpenChrome = async () => {
    try {
      await copyCurrentUrl();
      openInChrome();
      showToast('Opening in Google Chrome...', 'info');
    } catch {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyCurrentUrl();
      setCopied(true);
      showToast('Link copied! Open Chrome and paste.', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showToast('Please copy the URL to open in Chrome.', 'info');
    }
  };

  return (
    <div className={`w-full mb-6 ${className}`}>
      <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-primary-500/10 to-transparent border border-amber-500/30 text-left shadow-lg shadow-amber-500/5">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <Compass size={22} className="animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-txt-title font-display">
                Detected {appName} Browser
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                Action Required
              </span>
            </div>

            <p className="text-xs text-txt-muted mt-1.5 leading-relaxed">
              Google blocks authentication inside {appName}'s in-app browser for security. Tap below to automatically open in Google Chrome:
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mt-4">
              <button
                type="button"
                onClick={handleOpenChrome}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-md shadow-primary-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Globe size={15} />
                Open in Google Chrome
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-bg-panel hover:bg-bdr-light text-txt-title border border-bdr-main/40 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? 'Link Copied' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InAppBrowserNotice;

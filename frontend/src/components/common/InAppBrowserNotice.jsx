import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Info, MoreVertical, Compass, Share } from 'lucide-react';
import { isInAppBrowser, getInAppName, openInExternalBrowser, isIOS, isAndroid } from '../../utils/browserDetection.js';
import { useToast } from '../ui/Toast.jsx';

const InAppBrowserNotice = ({ className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { showToast } = useToast();

  if (!isInAppBrowser()) {
    return null;
  }

  const appName = getInAppName();
  const isApple = isIOS();
  const isDroid = isAndroid();

  const handleOpenBrowser = () => {
    if (isDroid) {
      const opened = openInExternalBrowser();
      if (!opened) {
        handleCopyLink();
      }
    } else {
      setShowIOSGuide(true);
      handleCopyLink(false);
    }
  };

  const handleCopyLink = async (notify = true) => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (notify) {
        showToast('Link copied! Open Chrome or Safari and paste the link.', 'success');
      }
      setTimeout(() => setCopied(false), 3000);
    } catch {
      if (notify) {
        showToast('Please open in browser using the top-right menu (•••).', 'info');
      }
    }
  };

  return (
    <>
      <div className={`p-4 rounded-2xl .bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent border border-primary-500/30 text-left mb-6 shadow-sm ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary-500/20 text-primary-500 shrink-0 mt-0.5">
            <Compass size={20} className="animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-txt-title font-display">
                Using {appName}?
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-primary-500/20 text-primary-600 dark:text-primary-300 text-[10px] font-bold uppercase">
                Google Login
              </span>
            </div>

            <p className="text-xs text-txt-muted mt-1 leading-relaxed">
              Google restricts OAuth logins inside {appName}'s in-app browser. Tap below to switch to your default browser for seamless <strong>Google Sign-In</strong>:
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3.5">
              <button
                type="button"
                onClick={handleOpenBrowser}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-md shadow-primary-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <ExternalLink size={14} />
                {isDroid ? 'Open in Chrome' : 'Open in Safari / Browser'}
              </button>

              <button
                type="button"
                onClick={() => handleCopyLink(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-panel hover:bg-bdr-light text-txt-title border border-bdr-main/30 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
              >
                {copied ? <Check size={13} className="text-primary-500" /> : <Copy size={13} />}
                {copied ? 'Link Copied' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Modal Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-panel max-w-sm w-full p-6 rounded-3xl border border-bdr-light shadow-2xl text-left relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-txt-title flex items-center gap-2">
                <Compass size={20} className="text-primary-500" />
                Open in Safari
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-txt-muted hover:text-txt-title p-1 rounded-lg text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-txt-muted leading-relaxed">
              To sign in with Google on iPhone / iPad, follow these 2 quick steps:
            </p>

            <div className="space-y-3 bg-bdr-light/40 p-3.5 rounded-2xl text-xs text-txt-title">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span>
                  Tap the <strong>three dots (•••)</strong> in the top-right corner (or <strong>Share <Share size={12} className="inline" /></strong> at the bottom).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span>
                  Select <strong>"Open in Safari"</strong> or <strong>"Open in Default Browser"</strong>.
                </span>
              </div>
            </div>

            <p className="text-[11px] text-txt-muted">
              ✓ <em>We have automatically copied the website link to your clipboard!</em>
            </p>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer text-center"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InAppBrowserNotice;

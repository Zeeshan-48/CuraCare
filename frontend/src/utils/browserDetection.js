/**
 * Utilities to detect in-app browsers / webviews (Instagram, Facebook, LinkedIn, TikTok, Twitter, etc.)
 * and redirect users to standalone browsers (Chrome, Safari) where Google OAuth is supported.
 */

export const isIOS = () => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const ua = window.navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isAndroid = () => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const ua = window.navigator.userAgent || '';
  return /Android/i.test(ua);
};

export const isInAppBrowser = () => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const ua = window.navigator.userAgent || window.navigator.vendor || '';

  const inAppTokens = [
    'LinkedInApp',
    'LinkedIn',
    'Instagram',
    'FBAN',
    'FBAV',
    'FB_IAB',
    'FB4A',
    'FBSS',
    'Twitter',
    'Tweetbot',
    'TikTok',
    'ByteDance',
    'musical_ly',
    'Snapchat',
    'Pinterest',
    'MicroMessenger',
    'Line/',
    'Slack',
    'KAKAOTALK',
    'GSA/',
    'WhatsApp',
    'Telegram',
  ];

  const hasInAppToken = inAppTokens.some((token) => new RegExp(token, 'i').test(ua));
  const isAndroidWebView = /Android/i.test(ua) && /wv|\.0\.0\.0/i.test(ua);
  const isIOSWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);

  return hasInAppToken || isAndroidWebView || isIOSWebView;
};

export const getInAppName = () => {
  if (typeof window === 'undefined' || !window.navigator) return 'In-App Browser';
  const ua = window.navigator.userAgent || '';

  if (/LinkedIn/i.test(ua)) return 'LinkedIn';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/FBAN|FBAV|FB_IAB|FB4A|FBSS/i.test(ua)) return 'Facebook';
  if (/Twitter|Tweetbot/i.test(ua)) return 'Twitter / X';
  if (/TikTok|ByteDance/i.test(ua)) return 'TikTok';
  if (/Snapchat/i.test(ua)) return 'Snapchat';
  if (/Pinterest/i.test(ua)) return 'Pinterest';
  if (/MicroMessenger/i.test(ua)) return 'WeChat';
  if (/Slack/i.test(ua)) return 'Slack';
  if (/WhatsApp/i.test(ua)) return 'WhatsApp';
  if (/Telegram/i.test(ua)) return 'Telegram';
  return 'In-App Browser';
};

/**
 * Attempt to open the current page in Google Chrome
 */
export const openInChrome = () => {
  const currentUrl = window.location.href;
  const cleanUrl = currentUrl.replace(/^https?:\/\//i, '');

  if (isAndroid()) {
    // Android Chrome Intent
    window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    return true;
  }

  if (isIOS()) {
    // iOS Chrome deep link
    window.location.href = `googlechromes://${cleanUrl}`;
    return true;
  }

  // Fallback: navigate directly
  window.open(currentUrl, '_system');
  return true;
};

/**
 * Attempt to open the current page in Safari / default system browser
 */
export const openInSafari = () => {
  const currentUrl = window.location.href;
  const cleanUrl = currentUrl.replace(/^https?:\/\//i, '');

  if (isIOS()) {
    // iOS Safari custom scheme fallback
    window.location.href = `x-safari-https://${cleanUrl}`;
    return true;
  }

  if (isAndroid()) {
    // Standard Android View Intent for default browser
    window.location.href = `intent://${cleanUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
    return true;
  }

  window.open(currentUrl, '_system');
  return true;
};

/**
 * Copy URL to clipboard with fallback
 */
export const copyCurrentUrl = async () => {
  const url = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(url);
    return true;
  }
  
  // Fallback for older WebViews
  const textArea = document.createElement('textarea');
  textArea.value = url;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  const successful = document.execCommand('copy');
  document.body.removeChild(textArea);
  return successful;
};

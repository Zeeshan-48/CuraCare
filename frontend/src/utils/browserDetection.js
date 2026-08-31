/**
 * Utility functions for detecting in-app browsers (WebViews)
 * such as LinkedIn, Instagram, Facebook, TikTok, Twitter, etc.
 * where Google OAuth is restricted by Google's disallowed_useragent security policy.
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

  const inAppRules = [
    'LinkedInApp',
    'LinkedIn',
    'Instagram',
    'FBAN',
    'FBAV', // Facebook
    'Twitter',
    'Tweetbot',
    'TikTok',
    'ByteDance',
    'musical_ly',
    'Snapchat',
    'Pinterest',
    'MicroMessenger', // WeChat
    'Line/',
    'Slack',
    'KAKAOTALK',
    'GSA/', // Google Search App
  ];

  const hasInAppToken = inAppRules.some((rule) => new RegExp(rule, 'i').test(ua));
  const isAndroidWebView = /Android/i.test(ua) && /wv|\.0\.0\.0/i.test(ua);
  const isIOSWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);

  return hasInAppToken || isAndroidWebView || isIOSWebView;
};

export const getInAppName = () => {
  if (typeof window === 'undefined' || !window.navigator) return 'In-App Browser';
  const ua = window.navigator.userAgent || '';

  if (/LinkedIn/i.test(ua)) return 'LinkedIn';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/FBAN|FBAV/i.test(ua)) return 'Facebook';
  if (/Twitter|Tweetbot/i.test(ua)) return 'Twitter / X';
  if (/TikTok|ByteDance/i.test(ua)) return 'TikTok';
  if (/Snapchat/i.test(ua)) return 'Snapchat';
  if (/Pinterest/i.test(ua)) return 'Pinterest';
  if (/MicroMessenger/i.test(ua)) return 'WeChat';
  if (/Slack/i.test(ua)) return 'Slack';
  return 'In-App Browser';
};

export const openInExternalBrowser = () => {
  const currentUrl = window.location.href;
  const ua = window.navigator.userAgent || '';

  if (/Android/i.test(ua)) {
    // Android Chrome Intent - opens the URL directly in Google Chrome outside the webview
    const cleanUrl = currentUrl.replace(/^https?:\/\//i, '');
    window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    return true;
  }

  return false;
};

/* 2by2 site tracking: Meta pixel + Google Analytics 4 + first-touch attribution.
   Fill in the two IDs below. Leave one blank to switch that platform off.
   Every page loads this file; pages call window.tt(name, params) for funnel events. */
(function () {
  var META_PIXEL_ID = '';   // e.g. '123456789012345' (Meta Events Manager > Data sources)
  var GA4_ID        = 'G-ZT24DXBJMW';   // 2by2academy.co web stream (jackson@2by2academy.co)    (Google Analytics > Admin > Data streams)

  /* ---------- first-touch attribution (stored in this browser for 90 days) ---------- */
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
  var STORE = '2by2_attr', attr = {};
  try { attr = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { attr = {}; }
  if (attr.first_seen && Date.now() - Date.parse(attr.first_seen) > 90 * 864e5) attr = {};
  var q = new URLSearchParams(location.search), fresh = {};
  KEYS.forEach(function (k) { if (q.get(k)) fresh[k] = q.get(k).slice(0, 200); });
  var hasNew = Object.keys(fresh).length > 0;
  if (hasNew) {
    // a new ad click replaces the old campaign info, but we keep the very first landing date
    KEYS.forEach(function (k) { delete attr[k]; });
    for (var k in fresh) attr[k] = fresh[k];
    attr.landing_page = location.origin + location.pathname;
    attr.referrer = document.referrer || '';
  }
  if (!attr.first_seen) {
    attr.first_seen = new Date().toISOString();
    if (!attr.landing_page) attr.landing_page = location.origin + location.pathname;
    if (!('referrer' in attr)) attr.referrer = document.referrer || '';
  }
  try { localStorage.setItem(STORE, JSON.stringify(attr)); } catch (e) {}
  window.TWOBY2_ATTR = attr;

  /* ---------- Meta pixel ---------- */
  if (META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', META_PIXEL_ID);
    fbq('track', 'PageView');
  }

  /* ---------- Google Analytics 4 ---------- */
  if (GA4_ID) {
    var g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA4_ID);
  }

  /* ---------- one call for both platforms ---------- */
  // Standard Meta events used: Lead, Schedule, Contact. Everything else goes to Meta as a custom event.
  var META_STD = { Lead: 1, Schedule: 1, Contact: 1, ViewContent: 1 };
  var GA_NAME = { Lead: 'generate_lead', Schedule: 'book_call', Contact: 'chat_lead', StartQuiz: 'quiz_start', QuizStep: 'quiz_step', BookingClick: 'booking_click' };
  window.tt = function (name, params) {
    params = params || {};
    try { if (window.fbq) { META_STD[name] ? fbq('track', name, params) : fbq('trackCustom', name, params); } } catch (e) {}
    try { if (window.gtag) gtag('event', GA_NAME[name] || name, params); } catch (e) {}
  };
})();

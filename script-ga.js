(function () {
  'use strict';

  // 1. Setup DataLayer & Google Consent Mode v2 Default State instantly
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag; 

  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  });

  // Helper function to update consent state
  function updateConsent(state) {
    gtag('consent', 'update', {
      'analytics_storage': state,
      'ad_storage': state,
      'ad_user_data': state,
      'ad_personalization': state
    });

    // Dynamically load Google Analytics only when consent is granted or initialized with prior choice
    loadGA();
  }

  function loadGA() {
    if (window.gaLoaded) return;
    window.gaLoaded = true;

    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-1XQ05KGVMN';
    document.head.appendChild(gaScript);

    gtag('js', new Date());
    gtag('config', 'G-1XQ05KGVMN');
  }

  // 2. Handle Banner Interactions
  document.addEventListener('DOMContentLoaded', function () {
    const banner = document.getElementById('js-cookie-banner');
    if (!banner) return;

    const savedConsent = localStorage.getItem('cookie_consent_choice');

    if (savedConsent) {
      // If user already made a choice, apply it and keep banner hidden
      updateConsent(savedConsent);
      banner.remove();
      return;
    }

    // Show banner if no choice exists
    banner.style.display = 'block';

    document.getElementById('js-cookie-accept').addEventListener('click', function () {
      localStorage.setItem('cookie_consent_choice', 'granted');
      updateConsent('granted');
      banner.remove();
    });

    document.getElementById('js-cookie-reject').addEventListener('click', function () {
      localStorage.setItem('cookie_consent_choice', 'denied');
      updateConsent('denied');
      banner.remove();
    });
  });
})();

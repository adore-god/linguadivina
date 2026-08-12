(function () {
  // 1. Setup DataLayer & Google Consent Mode v2 Default State
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }

  // Set default consent state to 'denied' BEFORE GA loads
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  });

  // 2. Dynamically Load Google Analytics Tag
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-1XQ05KGVMN';
  document.head.appendChild(gaScript);

  gtag('js', new Date());
  gtag('config', 'G-1XQ05KGVMN');

  // Helper function to update consent state
  function updateConsent(state) {
    gtag('consent', 'update', {
      'analytics_storage': state,
      'ad_storage': state,
      'ad_user_data': state,
      'ad_personalization': state
    });
  }

  // Check for prior consent choice
  const savedConsent = localStorage.getItem('cookie_consent_choice');
  if (savedConsent === 'granted') {
    updateConsent('granted');
  }

  // 3. Inject CSS Styles Dynamically
  const style = document.createElement('style');
  style.textContent = `
    #js-cookie-banner {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 550px;
      background-color: #1a1a1a;
      color: #ffffff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      z-index: 999999;
      box-sizing: border-box;
    }
    .js-cookie-content p {
      margin: 0 0 16px 0;
      font-size: 14px;
      line-height: 1.5;
      color: #d1d5db;
    }
    .js-cookie-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    .js-cookie-btn {
      padding: 10px 18px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      transition: background-color 0.2s ease;
    }
    .js-btn-accept {
      background-color: #2563eb;
      color: #ffffff;
    }
    .js-btn-accept:hover {
      background-color: #1d4ed8;
    }
    .js-btn-reject {
      background-color: #374151;
      color: #ffffff;
    }
    .js-btn-reject:hover {
      background-color: #4b5563;
    }
  `;
  document.head.appendChild(style);

  // 4. Build and Append Banner HTML if Choice Not Saved
  function initBanner() {
    if (savedConsent) return; // Don't show banner if user already chose

    const banner = document.createElement('div');
    banner.id = 'js-cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie Consent Banner');

    banner.innerHTML = `
      <div class="js-cookie-content">
        <p>We use cookies, including Google Analytics, to analyze website traffic and improve your browsing experience. Choose whether you accept performance tracking.</p>
      </div>
      <div class="js-cookie-actions">
        <button id="js-cookie-reject" class="js-cookie-btn js-btn-reject">Reject All</button>
        <button id="js-cookie-accept" class="js-cookie-btn js-btn-accept">Accept All</button>
      </div>
    `;

    document.body.appendChild(banner);

    // 5. Add Event Listeners
    document.getElementById('js-cookie-accept').addEventListener('click', function () {
      updateConsent('granted');
      localStorage.setItem('cookie_consent_choice', 'granted');
      banner.remove();
    });

    document.getElementById('js-cookie-reject').addEventListener('click', function () {
      updateConsent('denied');
      localStorage.setItem('cookie_consent_choice', 'denied');
      banner.remove();
    });
  }

  // Ensure DOM is ready before appending elements
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();
 
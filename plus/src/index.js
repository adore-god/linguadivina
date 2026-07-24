
const FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400..800;1,14..32,400..900&display=swap" rel="stylesheet">`;

const BRAND_FONT = "'Inter', serif";
const BRAND_COLOR = "#445bad";
const BRAND_COLOR_DARK = "#10214e";
const TEXT_COLOR = "#111";

const ARTICLE_STYLE = `
  body { font-family: ${BRAND_FONT}; max-width: 680px; margin: 60px auto; padding: 0 20px; color: ${TEXT_COLOR}; line-height: 1.6; }
  a { color: ${BRAND_COLOR}; }
`;

const INDEX_STYLE = `
  body { font-family: ${BRAND_FONT}; max-width: 640px; margin: 60px auto; padding: 0 20px; color: ${TEXT_COLOR}; }
  h1 { font-size: 1.6rem; margin-bottom: 1.5rem; }
  ul { list-style: none; padding: 0; }
  li { padding: 12px 0; border-bottom: 1px solid #eee; }
  a { color: ${BRAND_COLOR}; text-decoration: none; font-size: 1.05rem; }
  a:hover { text-decoration: underline; }
`;

const PAYWALL_STYLE = `
  body { font-family: ${BRAND_FONT}; max-width: 480px; margin: 100px auto; padding: 0 20px; color: ${TEXT_COLOR}; text-align: center; }
  h1 { font-size: 1.4rem; }
  button { margin-top: 20px; padding: 12px 28px; font-size: 1rem; background: ${BRAND_COLOR}; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
  button:hover { background: ${BRAND_COLOR_DARK}; }
  #error { color: #b00020; margin-top: 14px; font-size: 0.9rem; }
`;

// Shared site chrome — mirrors the header/footer used on the main
// linguadivina.uk pages (see creation-amnon-tamar.html), simplified to not
// depend on the main site's external stylesheets/scripts (dark-light
// toggle, sidebar nav, etc.), which this Worker doesn't have access to.

const SITE_HOME_URL = "https://linguadivina.uk";

const HEADER_FOOTER_STYLE = `
  .site-header { text-align: center; padding-bottom: 24px; margin-bottom: 32px; border-bottom: 1px solid #eee; }
  .site-header .site-title { font-size: 1.3rem; font-weight: 700; color: ${BRAND_COLOR_DARK}; text-decoration: none; }
  .site-header .site-tagline { margin: 4px 0 0; color: #777; font-size: 0.9rem; }
  .site-footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 0.85rem; }
  .site-footer a { color: ${BRAND_COLOR}; }
  .site-footer img { display: block; margin: 16px auto 0; max-width: 200px; height: auto; }
`;

const HEADER_HTML = `<header class="site-header">
  <a class="site-title" href="${SITE_HOME_URL}">Lingua Divina</a>
  <p class="site-tagline">The Court &amp; The Creation</p>
</header>`;

const FOOTER_HTML = `<footer class="site-footer">
  <p>&copy; 2025&ndash;2026 <a href="${SITE_HOME_URL}">Lingua Divina</a>. All rights reserved. &middot; <a href="${SITE_HOME_URL}/terms-of-use.html">Terms of Use</a></p>
  <a href="${SITE_HOME_URL}"><img src="${SITE_HOME_URL}/images/wp/lingua-divina-uk.webp" alt="Lingua Divina" width="200" height="35" loading="lazy"></a>
</footer>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.endsWith("/api/create-checkout-session") && request.method === "POST") {
      return createCheckoutSession(request, env);
    }
    if (path.endsWith("/api/checkout-webhook") && request.method === "POST") {
      return checkoutWebhook(request, env);
    }
    if (path.endsWith("/api/verify-checkout") && request.method === "GET") {
      return verifyCheckout(request, env);
    }
    if (path.endsWith("/api/login") && request.method === "GET") {
      return restoreExistingSubscriber(request, env);
    }
    if (path.endsWith("/api/article-content") && request.method === "GET") {
      return articleContent(request, env);
    }

    // Anything else under /plus/* that isn't an /api/ call is a page a
    // human is trying to visit in their browser — e.g. /plus itself, or
    // /plus/my-article-slug. Serve real HTML for those.
    if (request.method === "GET" && !path.includes("/api/")) {
      return renderPlusRoute(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

// ---------------------------------------------------------------------
// Cookie / signature helpers (formerly cookie.js — now inlined here)
// ---------------------------------------------------------------------

function toBase64Url(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}
async function hmac(secret, data) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return toBase64Url(String.fromCharCode(...new Uint8Array(sigBuffer)));
}

async function createSessionCookie(email, expiresAt, secret) {
  const encodedPayload = toBase64Url(JSON.stringify({ email, exp: expiresAt }));
  const sig = await hmac(secret, encodedPayload);
  return `${encodedPayload}.${sig}`;
}

async function verifySessionCookie(cookieValue, secret) {
  if (!cookieValue) return null;
  const [encodedPayload, sig] = cookieValue.split(".");
  if (!encodedPayload || !sig) return null;
  const expectedSig = await hmac(secret, encodedPayload);
  if (expectedSig !== sig) return null;
  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

// Browsers cap how long a cookie can live (Chrome enforces a hard ~400 day
// ceiling on Set-Cookie Max-Age no matter what value is sent), so there's
// no such thing as a literal "forever" cookie. Access itself is lifetime
// (subscriber records have no expiresAt — see checkoutWebhook below), and
// we slide this cookie's expiry forward on every authenticated page view
// (see withRefreshedSession), so a subscriber who visits at least once
// within any 400-day window never actually gets logged out.
const SESSION_MAX_AGE = 400 * 24 * 60 * 60; // ~400 days, in seconds

async function buildSessionCookie(email, env) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const cookieValue = await createSessionCookie(email, expiresAt, env.COOKIE_SECRET);
  return `paywall_session=${cookieValue}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

// Attaches a freshly-dated session cookie to an outgoing Response when the
// visitor has an active subscription, so the sliding window above actually
// keeps sliding. No-op if there's no active subscriber to refresh.
async function withRefreshedSession(response, subscriber, env) {
  if (!subscriber) return response;
  response.headers.append("Set-Cookie", await buildSessionCookie(subscriber.email, env));
  return response;
}

async function verifyStripeSignature(payload, sigHeader, secret) {
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")));
  const signedPayload = `${parts.t}.${payload}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(signedPayload));
  const expectedSig = [...new Uint8Array(sigBuffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return expectedSig === parts.v1;
}

// ---------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------

async function createCheckoutSession(request, env) {
  let redirectSlug = "/plus";
  try {
    const body = await request.json();
    if (body?.redirectSlug) redirectSlug = body.redirectSlug;
  } catch (_) {}

  const params = new URLSearchParams();
  params.append("mode", "subscription");
  params.append("line_items[0][price]", env.STRIPE_PRICE_ID);
  params.append("line_items[0][quantity]", "1");
  params.append(
    "success_url",
    `${env.SITE_URL}/plus/api/verify-checkout?session_id={CHECKOUT_SESSION_ID}&redirect=${encodeURIComponent(redirectSlug)}`
  );
  params.append("cancel_url", `${env.SITE_URL}${redirectSlug}`);
  params.append("managed_payments[enabled]", "true");

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2026-02-25.preview",
    },
    body: params.toString(),
  });
  const session = await stripeRes.json();

  if (!stripeRes.ok) {
    return new Response(JSON.stringify({ error: session.error?.message || "Stripe error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function checkoutWebhook(request, env) {
  const payload = await request.text();
  const sigHeader = request.headers.get("Stripe-Signature");
  const valid = await verifyStripeSignature(payload, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) return new Response("Invalid signature", { status: 400 });

  const event = JSON.parse(payload);

  // First-time subscribe — grants access.
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_details?.email;
    if (email) {
      await env.SUBSCRIBERS.put(
        email.toLowerCase(),
        JSON.stringify({
          status: "active",
          customerId: session.customer,
          subscriptionId: session.subscription,
          purchasedAt: Math.floor(Date.now() / 1000),
          expiresAt: null, // gated by live subscription status below, not a fixed date
        })
      );
    }
  }

  // Ongoing subscription lifecycle — keeps SUBSCRIBERS in sync as billing
  // status changes (renewed, past due, canceled, etc). These events don't
  // include the email directly, only the Stripe customer ID, so we look it
  // up via the API.
  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const email = await getStripeCustomerEmail(subscription.customer, env);
    if (email) {
      const raw = await env.SUBSCRIBERS.get(email);
      const existing = raw ? JSON.parse(raw) : {};
      const isActive = ["active", "trialing"].includes(subscription.status);
      await env.SUBSCRIBERS.put(
        email,
        JSON.stringify({
          ...existing,
          status: isActive ? "active" : "inactive",
          customerId: subscription.customer,
          subscriptionId: subscription.id,
        })
      );
    }
  }

  return new Response("ok");
}

async function getStripeCustomerEmail(customerId, env) {
  const res = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });
  if (!res.ok) return null;
  const customer = await res.json();
  return customer.email ? customer.email.toLowerCase() : null;
}

async function verifyCheckout(request, env) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const redirectPath = url.searchParams.get("redirect") || "/plus";
  if (!sessionId) return new Response("Missing session_id", { status: 400 });

  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });
  const session = await res.json();

  if (!res.ok || session.payment_status !== "paid" || !session.customer_details?.email) {
    return new Response("Payment not confirmed", { status: 402 });
  }

  const email = session.customer_details.email.toLowerCase();

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectPath,
      "Set-Cookie": await buildSessionCookie(email, env),
    },
  });
}

// Handles Stripe's "customer already has a subscription" redirect (set up
// via Dashboard → Checkout and Payment Links settings → "Limit customers to
// one subscription" → redirect to your website). When someone who lost
// their cookie clicks Subscribe again, Stripe recognizes their email
// already has an active subscription and sends them here instead of
// charging them twice, with a real Checkout Session ID. We verify that
// session ID against Stripe's API — so this can't be spoofed just by typing
// an email into the URL — then cross-check our own subscriber record before
// granting a session cookie.
async function restoreExistingSubscriber(request, env) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) return new Response("Missing session_id in redirect URL", { status: 400 });

  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });
  const session = await res.json();

  if (!res.ok) {
    return new Response(`Could not verify session: ${session.error?.message || "unknown Stripe error"}`, { status: 400 });
  }

  // 1. Try customer_details.email first
  let email = session.customer_details?.email ? session.customer_details.email.toLowerCase() : null;

  // 2. Fallback: If Stripe didn't attach customer_details, retrieve the email via customer ID
  if (!email && session.customer) {
    email = await getStripeCustomerEmail(session.customer, env);
  }

  if (!email) return new Response("Session verified but no email was found on it", { status: 400 });

  const raw = await env.SUBSCRIBERS.get(email);
  const subscriber = raw ? JSON.parse(raw) : null;
  if (!subscriber || subscriber.status !== "active") {
    return new Response("No active subscription found for this account", { status: 402 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/plus",
      "Set-Cookie": await buildSessionCookie(email, env),
    },
  });
}


async function articleContent(request, env) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });

  const subscriber = await getActiveSubscriber(request, env);
  if (!subscriber) return new Response(JSON.stringify({ error: "Not subscribed" }), { status: 401 });

  const articleHtml = await getArticleHtml(request, env, slug);
  if (!articleHtml) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  const response = new Response(JSON.stringify({ html: articleHtml }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
  return withRefreshedSession(response, subscriber, env);
}

// ---------------------------------------------------------------------
// Article storage — now a folder of static files (env.ARTICLES asset
// binding, see wrangler.toml) instead of a KV namespace.
//
//   /articles/manifest.json      -> [{ "slug": "...", "title": "..." }, ...]
//   /articles/<slug>.html        -> the article body HTML
//
// To add a new article: drop `<slug>.html` into the articles/ folder,
// add a line for it in manifest.json, and push to GitHub — the
// Cloudflare Workers Build will redeploy automatically.
// ---------------------------------------------------------------------

async function getArticleHtml(request, env, slug) {
  const assetUrl = new URL(`/${slug}.html`, request.url);
  const res = await env.ARTICLES.fetch(new Request(assetUrl));
  if (!res.ok) return null;
  return res.text();
}

async function getArticleManifest(request, env) {
  const assetUrl = new URL("/manifest.json", request.url);
  const res = await env.ARTICLES.fetch(new Request(assetUrl));
  if (!res.ok) return [];
  try {
    return await res.json();
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------
// Human-facing pages
// ---------------------------------------------------------------------

// Looks up the visitor's session cookie and checks SUBSCRIBERS in KV.
// Returns the subscriber record if they have an active subscription,
// otherwise null. This is the one place "are they allowed in" is decided.
async function getActiveSubscriber(request, env) {
  const cookieValue = getCookie(request, "paywall_session");
  const session = await verifySessionCookie(cookieValue, env.COOKIE_SECRET);
  if (!session) return null;

  const raw = await env.SUBSCRIBERS.get(session.email);
  const subscriber = raw ? JSON.parse(raw) : null;
  if (!subscriber || subscriber.status !== "active") return null;
  if (subscriber.expiresAt && subscriber.expiresAt < Math.floor(Date.now() / 1000)) return null;
  return { ...subscriber, email: session.email };
}

async function renderPlusRoute(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean); // e.g. ["plus", "some-slug"]
  if (parts[0] === "plus") parts.shift();
  const slug = parts.join("/");

  if (!slug) {
    return renderIndexPage(request, env);
  }
  return renderArticlePage(request, env, slug);
}

async function renderIndexPage(request, env) {
  const subscriber = await getActiveSubscriber(request, env);
  const manifest = await getArticleManifest(request, env);
  const items = manifest
    .map((a) => `<li><a href="/plus/${encodeURIComponent(a.slug)}">${escapeHtml(a.title || a.slug)}</a></li>`)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Plus Articles — LinguaDivina</title>
${FONT_LINK}
<style>${INDEX_STYLE}${HEADER_FOOTER_STYLE}</style>
</head>
<body>
  ${HEADER_HTML}
  <h1>Plus Articles</h1>
  <ul>${items || "<li>No articles yet.</li>"}</ul>
  ${FOOTER_HTML}
</body>
</html>`;

  const response = new Response(html, { headers: { "Content-Type": "text/html; charset=UTF-8" } });
  return withRefreshedSession(response, subscriber, env);
}

async function renderArticlePage(request, env, slug) {
  const subscriber = await getActiveSubscriber(request, env);

  if (!subscriber) {
    return new Response(renderPaywallHtml(slug), {
      status: 402,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  }

  const articleHtml = await getArticleHtml(request, env, slug);
  if (!articleHtml) {
    return new Response("Article not found", { status: 404 });
  }

  // Your articles/<slug>.html file only needs to be the article body —
  // this wraps it in the shared page template below (see ARTICLE_STYLE).
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(slug)} — LinguaDivina Plus</title>
${FONT_LINK}
<style>${ARTICLE_STYLE}${HEADER_FOOTER_STYLE}</style>
</head>
<body>
  ${HEADER_HTML}
  <p><a href="/plus">&larr; All articles</a></p>
  ${articleHtml}
  ${FOOTER_HTML}
</body>
</html>`;

  const response = new Response(html, {
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store" },
  });
  return withRefreshedSession(response, subscriber, env);
}

function renderPaywallHtml(slug) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Subscribe — LinguaDivina Plus</title>
${FONT_LINK}
<style>${PAYWALL_STYLE}${HEADER_FOOTER_STYLE}</style>
</head>
<body>
  ${HEADER_HTML}
  <h1>This article is for Plus subscribers</h1>
  <p>Subscribe to read this and every other Plus article.</p>
  <button id="subscribe-btn">Subscribe</button>
  <p id="error"></p>
  ${FOOTER_HTML}
  <script>
    document.getElementById('subscribe-btn').addEventListener('click', async () => {
      const res = await fetch('/plus/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectSlug: '/plus/${slug}' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        document.getElementById('error').textContent = data.error || 'Something went wrong.';
      }
    });
  </script>
</body>
</html>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

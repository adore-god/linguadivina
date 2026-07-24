const FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400..800;1,14..32,400..900&display=swap" rel="stylesheet">`;

const BRAND_FONT = "'Inter', serif";
const BRAND_COLOR = "#445bad";
const BRAND_COLOR_DARK = "#10214e";
const BRAND_COLOR_WHITE = "#FFFFFF";
const TEXT_COLOR = "#111";

const ARTICLE_STYLE = `
  body { font-family: ${BRAND_FONT}; margin: 60px auto; padding: 0 0; color: ${TEXT_COLOR}; line-height: 1.6; }
  a { color: ${BRAND_COLOR}; font-weight:500;}
  h1 { text-align-left;  padding-left:0.8em; padding-right:3em; font-size: 2rem; margin-bottom: 1.5rem; line-height:1.2; }
  
  h2 { text-align-left;  padding-left:1.2em; padding-right:1.5em; font-size: 1.6rem; margin-top: 0.5rem;margin-bottom: 1.5rem; line-height:1.4; }
  
  blockquote { padding:1.3em; border-radius: 10px; font-weight:500;background: ${BRAND_COLOR_DARK}; color: ${BRAND_COLOR_WHITE}; }
  p { width:90%; padding: 0;  margin: 3em auto}
`;

const INDEX_STYLE = `
  body { font-family: ${BRAND_FONT}; max-width: 640px; margin: 60px auto; padding: 0 20px; color: ${TEXT_COLOR}; }
  h1 { font-size: 3.6rem; margin-bottom: 1.5rem; }
  ul { list-style: none; padding: 0; }
  li { padding: 12px 0; }
  a { color: ${BRAND_COLOR}; font-weight:600; text-decoration: none; font-size: 1.05rem; }
  a:hover { text-decoration: underline; }
`;

const PAYWALL_STYLE = `
  body { font-family: ${BRAND_FONT}; max-width: 480px; margin: 100px auto; padding: 0 20px; color: ${TEXT_COLOR}; text-align: center; }
  h1 { font-size: 1.4rem; }
  button { margin-top: 20px; padding: 12px 28px; font-size: 1rem; background: ${BRAND_COLOR_DARK}; color: ${BRAND_COLOR_WHITE}; border: none; border-radius: 4px; cursor: pointer; }
  button:hover { background: ${BRAND_COLOR}; }
  #error { color: #b00020; margin-top: 14px; font-size: 0.9rem; }
  .login-box { margin-top: 40px; padding-top: 24px; border-top: 1px solid #eee; text-align: center; }
  .login-box h2 { font-size: 1.1rem; margin-bottom: 8px; font-weight: 600; }
  .login-box p { font-size: 0.9rem; color: #666; margin-bottom: 16px; }
  .login-box input { padding: 10px 14px; font-size: 0.95rem; width: 100%; max-width: 280px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
  .login-box button { margin-top: 10px; font-size: 0.9rem; padding: 10px 20px; }
  #msg { margin-top: 12px; font-size: 0.9rem; color: ${BRAND_COLOR_DARK}; }
`;

const SITE_HOME_URL = "https://plus.linguadivina.uk";

const HEADER_FOOTER_STYLE = `
  .site-header { font-size: 1.4rem; text-transform: uppercase;text-align: center; padding-bottom: 24px; margin-bottom: 32px; }
  .site-header .site-title { font-size: 1rem; font-weight: 700; color: ${BRAND_COLOR_DARK}; text-decoration: none; }
  .site-header .site-tagline { text-transform: uppercase; margin: 4px 0 0; color: #111; font-size: 0.8rem; text-align: center;}
  .site-footer { font-weight:600; margin-top: 48px; padding-top: 20px;  text-align: center; color: #888; font-size: 0.85rem; }
  .site-footer a { color: ${BRAND_COLOR}; }
`;

const HEADER_HTML = `<header class="site-header">
  <a class="site-title" href="${SITE_HOME_URL}">Lingua Divina </a>
  <div class="site-tagline">The Court &amp; The Creation</div>
  <div style="font-size:1.5em;">Plus</div>
</header>`;

const FOOTER_HTML = `<footer class="site-footer">
  <p>&copy; 2025&ndash;2026 <a href="${SITE_HOME_URL}">Lingua Divina</a>. All rights reserved. &middot; <a href="${SITE_HOME_URL}/terms-of-use.html">Terms of Use</a></p>

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
    if (path.endsWith("/api/send-magic-link") && request.method === "POST") {
      return sendMagicLink(request, env);
    }
    if (path.endsWith("/api/verify-magic-link") && request.method === "GET") {
      return verifyMagicLink(request, env);
    }

    if (request.method === "GET" && !path.includes("/api/")) {
      return renderPlusRoute(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

// ---------------------------------------------------------------------
// Cookie / signature helpers
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

const SESSION_MAX_AGE = 400 * 24 * 60 * 60; // ~400 days, in seconds

async function buildSessionCookie(email, env) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const cookieValue = await createSessionCookie(email, expiresAt, env.COOKIE_SECRET);
  
  return `paywall_session=${cookieValue}; Path=/; Domain=linguadivina.uk; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

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
// Magic Link Handlers
// ---------------------------------------------------------------------

async function sendMagicLink(request, env) {
  try {
    const { email, redirectSlug } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required." }), { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const raw = await env.SUBSCRIBERS.get(cleanEmail);
    const subscriber = raw ? JSON.parse(raw) : null;

    if (!subscriber || subscriber.status !== "active") {
      return new Response(JSON.stringify({ message: "If an active account exists, a link has been sent to your email." }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Token valid for 15 minutes
    const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;
    const tokenPayload = toBase64Url(JSON.stringify({ email: cleanEmail, exp: expiresAt }));
    const sig = await hmac(env.COOKIE_SECRET, tokenPayload);
    const magicToken = `${tokenPayload}.${sig}`;

    const safeRedirect = typeof redirectSlug === "string" && redirectSlug.startsWith("/") ? redirectSlug : "/";
    const magicLink = `${env.SITE_URL}/api/verify-magic-link?token=${magicToken}&redirect=${encodeURIComponent(safeRedirect)}`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Lingua Divina <noreply@plus.linguadivina.uk>", 
        to: [cleanEmail],
        subject: "Sign in to Lingua Divina Plus",
        html: `<p>Hello,</p>
               <p>Click the link below to sign in to your Lingua Divina Plus account:</p>
               <p><a href="${magicLink}"><strong>Sign in to Lingua Divina Plus</strong></a></p>
               <p>This link will expire in 15 minutes.</p>`,
      }),
    });

if (!emailRes.ok) {
  const errDetails = await emailRes.text();
  return new Response(JSON.stringify({ error: `Resend error: ${errDetails}` }), { status: 500 });
}


    return new Response(JSON.stringify({ message: "Check your email! We sent you a sign-in link." }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (_) {
    return new Response(JSON.stringify({ error: "Server error handling request." }), { status: 500 });
  }
}

async function verifyMagicLink(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return new Response("Missing token", { status: 400 });

  const requestedRedirect = url.searchParams.get("redirect") || "/";
  const redirectPath = requestedRedirect.startsWith("/") ? requestedRedirect : "/";

  const payload = await verifySessionCookie(token, env.COOKIE_SECRET);
  if (!payload || !payload.email) {
    return new Response("Invalid or expired sign-in link.", { status: 401 });
  }

  const raw = await env.SUBSCRIBERS.get(payload.email);
  const subscriber = raw ? JSON.parse(raw) : null;
  if (!subscriber || subscriber.status !== "active") {
    return new Response("No active subscription found.", { status: 403 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectPath,
      "Set-Cookie": await buildSessionCookie(payload.email, env),
    },
  });
}

// ---------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------

async function createCheckoutSession(request, env) {
  let redirectSlug = "/";
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
    `${env.SITE_URL}/api/verify-checkout?session_id={CHECKOUT_SESSION_ID}&redirect=${encodeURIComponent(redirectSlug)}`
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
          expiresAt: null,
        })
      );
    }
  }

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
  const redirectPath = url.searchParams.get("redirect") || "/";
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

async function restoreExistingSubscriber(request, env) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) {
    return new Response("Missing session_id in redirect URL", { status: 400 });
  }

  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });

  const session = await res.json();

  if (!res.ok) {
    return new Response(
      `Could not verify session: ${session.error?.message || "unknown Stripe error"}`,
      { status: 400 }
    );
  }

  let email =
    session.customer_details?.email?.toLowerCase() ||
    session.customer_email?.toLowerCase() ||
    null;

  if (!email && session.customer) {
    email = await getStripeCustomerEmail(session.customer, env);
  }

  if (!email) {
    return new Response("Could not determine subscriber email", { status: 400 });
  }

  const raw = await env.SUBSCRIBERS.get(email);
  const subscriber = raw ? JSON.parse(raw) : null;

  if (!subscriber || subscriber.status !== "active") {
    return new Response("No active subscription found for this account", { status: 402 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
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
// Googlebot verification (for serving paywalled content to the crawler)
// ---------------------------------------------------------------------
//
// We only ever grant the "Googlebot view" based on a match against Google's
// own published IP ranges below — never on User-Agent alone, since that
// header is trivially spoofable and would otherwise let anyone read paid
// articles for free by pretending to be Googlebot.

const GOOGLEBOT_RANGES_URL = "https://developers.google.com/static/search/apis/ipranges/googlebot.json";

function ipv4ToLong(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isIPv4InCidr(ip, cidr) {
  const [range, bitsStr] = cidr.split("/");
  const bits = parseInt(bitsStr, 10);
  const ipLong = ipv4ToLong(ip);
  const rangeLong = ipv4ToLong(range);
  if (ipLong === null || rangeLong === null) return false;
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipLong & mask) === (rangeLong & mask);
}

function ipv6ToBigInt(ip) {
  const [headPart, tailPart] = ip.split("::");
  const head = headPart ? headPart.split(":") : [];
  const tail = tailPart ? tailPart.split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (missing < 0) return null;
  const groups = [...head, ...Array(missing).fill("0"), ...tail];
  let result = 0n;
  for (const g of groups) {
    const val = parseInt(g || "0", 16);
    if (Number.isNaN(val)) return null;
    result = (result << 16n) + BigInt(val);
  }
  return result;
}

function isIPv6InCidr(ip, cidr) {
  const [range, bitsStr] = cidr.split("/");
  const bits = BigInt(parseInt(bitsStr, 10));
  const ipInt = ipv6ToBigInt(ip);
  const rangeInt = ipv6ToBigInt(range);
  if (ipInt === null || rangeInt === null) return false;
  const fullMask = (1n << 128n) - 1n;
  const mask = bits === 0n ? 0n : (fullMask << (128n - bits)) & fullMask;
  return (ipInt & mask) === (rangeInt & mask);
}

async function isVerifiedGooglebot(request) {
  const ua = request.headers.get("User-Agent") || "";
  if (!/googlebot/i.test(ua)) return false;

  const clientIp = request.headers.get("CF-Connecting-IP");
  if (!clientIp) return false;

  try {
    // cf.cacheTtl/cacheEverything cache this subrequest at Cloudflare's edge,
    // so we're not re-fetching Google's IP list on every single request.
    const res = await fetch(GOOGLEBOT_RANGES_URL, {
      cf: { cacheTtl: 86400, cacheEverything: true },
    });
    if (!res.ok) return false;
    const data = await res.json();
    const prefixes = data.prefixes || [];
    const isIPv6 = clientIp.includes(":");

    for (const p of prefixes) {
      if (!isIPv6 && p.ipv4Prefix && isIPv4InCidr(clientIp, p.ipv4Prefix)) return true;
      if (isIPv6 && p.ipv6Prefix && isIPv6InCidr(clientIp, p.ipv6Prefix)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------
// Article storage helpers
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
  const parts = url.pathname.split("/").filter(Boolean);
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
    .map((a) => `<li><a href="/${encodeURIComponent(a.slug)}">${escapeHtml(a.title || a.slug)}</a></li>`)
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
  <h1>Lingua Divina Articles</h1>
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
    if (await isVerifiedGooglebot(request)) {
      return renderArticlePageForGooglebot(request, env, slug);
    }
    return new Response(renderPaywallHtml(slug), {
      status: 402,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  }

  const articleHtml = await getArticleHtml(request, env, slug);
  if (!articleHtml) {
    return new Response("Article not found", { status: 404 });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://linguadivina.uk/script-new-blb.js" defer></script>
<title>${escapeHtml(slug)} — Lingua Divina Plus</title>
${FONT_LINK}
<style>${ARTICLE_STYLE}${HEADER_FOOTER_STYLE}</style>
</head>
<body>
  ${HEADER_HTML}
  <p><a href="/">&larr; All articles</a></p>
  <div class="article-body">${articleHtml}</div>
  ${FOOTER_HTML}
</body>
</html>`;

  const response = new Response(html, {
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store" },
  });
  return withRefreshedSession(response, subscriber, env);
}

async function renderArticlePageForGooglebot(request, env, slug) {
  const articleHtml = await getArticleHtml(request, env, slug);
  if (!articleHtml) {
    return new Response("Article not found", { status: 404 });
  }

  const manifest = await getArticleManifest(request, env);
  const entry = manifest.find((a) => a.slug === slug);
  const title = entry?.title || slug;

  // Tells Google this content is genuinely gated (not cloaking) and which
  // part of the page is the paywalled portion, per Google's structured
  // data guidelines for subscription/paywalled content.
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    isAccessibleForFree: false,
    hasPart: {
      "@type": "WebPageElement",
      isAccessibleForFree: false,
      cssSelector: ".article-body",
    },
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<title>${escapeHtml(title)} — Lingua Divina Plus</title>
${FONT_LINK}
<style>${ARTICLE_STYLE}${HEADER_FOOTER_STYLE}</style>
</head>
<body>
  ${HEADER_HTML}
  <p><a href="/">&larr; All articles</a></p>
  <div class="article-body">${articleHtml}</div>
  ${FOOTER_HTML}
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" },
  });
}

function renderPaywallHtml(slug) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Subscribe — Lingua Divina Plus</title>
${FONT_LINK}
<style>${PAYWALL_STYLE}${HEADER_FOOTER_STYLE}</style>
</head>
<body>
  ${HEADER_HTML}
  <h1>This article is for Lingua Divina Plus subscribers</h1>
  <p>Subscribe to read this and every other Plus article.</p>
  <button id="subscribe-btn">Subscribe</button>
  <p id="error"></p>

  <div class="login-box">
    <h2>Already subscribed?</h2>
    <p>Enter your email to receive a sign-in link.</p>
    <form id="login-form">
      <input type="email" id="login-email" placeholder="you@example.com" required />
      <br>
      <button type="submit">Send Sign-in Link</button>
    </form>
    <p id="msg"></p>
  </div>

  ${FOOTER_HTML}
  <script>
    document.getElementById('subscribe-btn').addEventListener('click', async () => {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectSlug: '/${slug}' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        document.getElementById('error').textContent = data.error || 'Something went wrong.';
      }
    });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const msg = document.getElementById('msg');
      msg.textContent = 'Sending link...';

      try {
        const res = await fetch('/api/send-magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, redirectSlug: '/${slug}' }),
        });
        const data = await res.json();
        msg.textContent = data.message || data.error || 'Something went wrong.';
      } catch (err) {
        msg.textContent = 'Error sending request.';
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

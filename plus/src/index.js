const BRAND_FONT = "'Inter', serif";
const BRAND_COLOR = "#445bad";
const BRAND_COLOR_DARK = "#10214e";
const BRAND_COLOR_WHITE = "#FFFFFF";
const TEXT_COLOR = "#111";

const FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400..800;1,14..32,400..900&display=swap" rel="stylesheet"><script async src="https://www.googletagmanager.com/gtag/js?id=G-1XQ05KGVMN"></script><script src="https://linguadivina.uk/script-ga.js" async></script>`;

const BASE_STYLE = `
  body { letter-spacing: 0.01em;font-family: Inter; font-size: 1rem;line-height: 1.5; -webkit-text-size-adjust: 100%;-moz-text-size-adjust: 100%;-ms-text-size-adjust: 100%;text-size-adjust: 100%;}
  .container {overflow:hidden;}
  
  @keyframes h1FadeIn {
0% {opacity: 0;}

  100% {opacity: 1;}
}
h1 {
    animation: h1FadeIn 0.6s ease both;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    box-sizing: border-box;
    padding: 1.3em 2em 1.3em 0.5em;
    background: ${BRAND_COLOR_DARK};
    color: ${BRAND_COLOR_WHITE};
    text-align: left;
    margin-bottom: 1em;
    font-size: 1.5em;
    line-height: 1.4;
  }

  h2 {margin: 2.3em 0 1.5em 0 ;}
  blockquote { line-height:1.7;margin:2.5em auto; max-width:60%;padding:1.3em; border-radius: 10px; font-weight:500;background: ${BRAND_COLOR_DARK}; color: ${BRAND_COLOR_WHITE}; }
`;


const ARTICLE_STYLE = `
  body { font-family: ${BRAND_FONT}; margin: 60px auto 60px; padding: 0 0; color: ${TEXT_COLOR}; }
  a { color: ${BRAND_COLOR}; font-weight:500;}
  .article-body { width:90%; padding: 0;  margin: 3em auto;}
`;



const CODE_STYLE = `
  .code-container { overflow: hidden;max-height:150px;position: relative; width: 90%; margin: 2.5em auto; }
  .code-container pre { background: ${BRAND_COLOR_DARK}; color: ${BRAND_COLOR_WHITE}; padding: 1.5em; border-radius: 10px; overflow-x: auto; margin: 0; }
  .code-container code { font-family: 'Courier New', Courier, monospace; font-size: 0.85rem; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
  .button2 { display: inline-block; margin-top: 14px; padding: 10px 22px; font-size: 0.9rem; font-weight: 600; background: ${BRAND_COLOR_DARK}; color: ${BRAND_COLOR_WHITE}; border: none; border-radius: 4px; cursor: pointer;position: absolute; top: 10px;right: 10px; }
  .button2:hover { background: ${BRAND_COLOR}; }
  .bold700 { font-weight: 700; }
  .bold600 { font-weight: 600; }
  .noTag { font-style: normal; }
  dfn { font-style: italic; font-weight: 600; }
`;

const INDEX_STYLE = `
  body { font-family: ${BRAND_FONT}; margin: 60px auto 60px; padding: 0; color: ${TEXT_COLOR}; }
  .article-body { width:90%; padding: 0;  margin: 3em auto;}
  .free-link {margin-top:2px;opacity:0.5;font-size:0.6em; text-transform:uppercase;}
  .free-link a:link {padding:2px;border-radius:6px;background: ${BRAND_COLOR_WHITE}; color: ${BRAND_COLOR_DARK};}
    .free-link a:visited {color: ${BRAND_COLOR_DARK};}
    .art-list {background: ${BRAND_COLOR_DARK};margin:0 auto;height:380px;padding:1em; border-radius:15px;overflow-x: hidden;overflow-y: auto;}
  ul {margin:0 0 0 1em;width:80%; list-style: none; padding: 0; }
  li { padding: 0 12px 19px 0; }
  .art-list ul li a { color: ${BRAND_COLOR_WHITE}; }
  a { color: ${BRAND_COLOR}; font-weight:600; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .site-footer a { font-weight:400; }
`;

const PAYWALL_STYLE = `
  body { font-family: ${BRAND_FONT};  margin: 50px auto 100px; padding: 0 20px; color: ${TEXT_COLOR}; text-align: center; }
  h1 { font-size: 1.4rem;}
 .plain {margin:0 auto;text-align: center;background: ${BRAND_COLOR_WHITE};
    color: ${TEXT_COLOR};}
  button { font-weight:700;margin-top: 20px; padding: 12px 28px; font-size: 1rem; background: ${BRAND_COLOR_DARK}; color: ${BRAND_COLOR_WHITE}; border: none; border-radius: 4px; cursor: pointer; }
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
  .site-header {text-transform: uppercase;text-align: center; padding-bottom: 24px; margin-bottom: 0; }
  .site-header .site-title {font-size: 1.5em; font-weight: 700; color: ${BRAND_COLOR_DARK}; text-decoration: none; }
  .site-plus-label { font-size: 1.5em; }
  .site-tagline { text-transform: uppercase; margin: 6px 0 6px; color: #111; font-size: 0.8em; text-align: center;}
  .logo {width: 160px; height: 119px; margin: 1em auto 0; text-align:center;}
  .site-footer { font-weight:600; margin-top: 48px; padding-top: 20px;  text-align: center; color: #888; font-size: 0.85em; }
  .site-footer a { color: ${BRAND_COLOR}; }
`;

const HEADER_HTML = `<div class="container"><header class="site-header">
  <a class="site-title" href="${SITE_HOME_URL}">Lingua Divina </a>
  <div class="site-tagline">The Court &amp; The Creation</div>
  <div class="site-plus-label">Plus &#11089;</div>
  <img class="logo"  alt="Logo" src="https://linguadivina.uk/images/gavel-seed-reduced.webp">
</header>`;

const FOOTER_HTML = `</div><footer class="site-footer">
  <p>&copy; 2025&ndash;2026 <a href="${SITE_HOME_URL}">Lingua Divina</a>. All rights reserved. &middot; <a href="https://linguadivina.uk/terms-of-use.html">Terms of Use</a>. <a href="https://billing.stripe.com/p/login/8x27sDeEX0CpdeEcJr0sU00">Manage Your Subscription.</a></p>

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
               <p>This link will expire in 15 minutes.</p>
<p>To manage your subscription click <a href="https://billing.stripe.com/p/login/8x27sDeEX0CpdeEcJr0sU00">here.</a></p>`,
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
  .map((a) => `
    <li>
      <a href="/${encodeURIComponent(a.slug)}">${escapeHtml(a.title || a.slug)}</a>
      ${a.freeSlug ? `<div class="free-link"><a href="https://linguadivina.uk/${a.freeSlug}">Free Intro</a></div>` : ""}
    </li>
  `)
  .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script type="application/ld+json" id="plus-index-schema">{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "Lingua Divina",
      "@id": "https://linguadivina.uk/#org",
      "url": "https://linguadivina.uk/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://linguadivina.uk/images/wp/lingua-divina-uk.webp"
      },
      "description": "Original linguistic framework — Lingua Divina — developed by HNNH, expanding foundational insights into Biblical text as symbolic consciousness mechanics. All interpretations are psychological and non-theological.",
      "founder": {
        "@id": "https://linguadivina.uk/about-author.html#person"
      }
    },
    {
      "@type": "Person",
      "@id": "https://linguadivina.uk/about-author.html#person",
      "name": "HNNH",
      "url": "https://linguadivina.uk/about-author.html",
      "sameAs": [
        "https://www.reddit.com/user/GoldStudio2653/",
        "https://www.reddit.com/r/BibleNevilleGoddard/",
        "https://amazon.com/author/hnnhbible",
        "https://www.whatsapp.com/channel/0029VbDVjNH7T8bYBJr3yg1a"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://plus.linguadivina.uk/#website",
      "url": "https://plus.linguadivina.uk/",
      "name": "Lingua Divina Plus",
      "description": "Full-length articles, deep dives, and exclusive resources for dedicated readers of The Court & The Creation.",
      "publisher": {
        "@id": "https://linguadivina.uk/#org"
      },
      "isPartOf": {
        "@id": "https://linguadivina.uk/"
      }
    },
    {
      "@type": "CollectionPage",
      "@id": "https://plus.linguadivina.uk/#collectionpage",
      "url": "https://plus.linguadivina.uk/",
      "isAccessibleForFree": false,
      "name": "Lingua Divina Plus — Welcome",
      "description": "Full-length articles, deep dives, and exclusive resources for dedicated readers of The Court & The Creation.",
      "isPartOf": {
        "@id": "https://plus.linguadivina.uk/#website"
      },
      "about": {
        "@id": "https://linguadivina.uk/#org"
      },
      "mainEntity": {
        "@id": "https://plus.linguadivina.uk/#articlelist"
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://plus.linguadivina.uk/#articlelist",
      "name": "Lingua Divina Plus Articles",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "url": "https://plus.linguadivina.uk/plus-framework-yhvh-ehyeh-linguistic-key",
          "name": "Bible Key to Interpret Any Bible Book, Passage and Verse"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "url": "https://plus.linguadivina.uk/plus-jacob-esau-reunion",
          "name": "Genesis 33:1 — Jacob and Esau — The Face Confirms the Verdict"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "url": "https://plus.linguadivina.uk/plus-1-john-4-7-21",
          "name": "1 John 4:7-21 — Love Is Of God"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "url": "https://plus.linguadivina.uk/plus-1-john-5-6-12",
          "name": "1 John 5:6-12 — The Court Runs Its Witness Statute Through Water, Blood, and Spirit"
        },
        {
          "@type": "ListItem",
          "position": 5,
          "url": "https://plus.linguadivina.uk/plus-urim-thummim",
          "name": "Urim and Thummim — Lights and Perfections on the Breastplate of Judgment"
        }
      ]
    }
  ]
}</script>
<title>Lingua Divina Plus</title>
<meta content="2026-07-26T08:56:00Z" name="date-modified">
<meta name="date" content="2026-07-24">
${FONT_LINK}
<style>${INDEX_STYLE}${HEADER_FOOTER_STYLE}${BASE_STYLE}</style>
</head>
<body>
  ${HEADER_HTML}
  <h1>Welcome</h1>
    <div class="article-body">
  <p>Lingua Divina Plus features full-length articles, deep dives, and exclusive resources for dedicated readers of The Court & The Creation series.</p>
  <p>Lots of full introductory articles are available for free at <a href="https://linguadivina.uk">linguadivina.uk</a>.
  <p>🔒 Subscribe for full access. Cancel anytime.</p>
  <h2>Lingua Divina PLUS Articles</h2>
  <div class="art-list">
  <ul>${items || "<li>No articles yet.</li>"}</ul></div>
  </div>
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

  
  const h1Match = articleHtml.match(/<h1[^>]*>[\s\S]*?<\/h1>/i);
  const h1Html = h1Match ? h1Match[0] : "";
  const remainderHtml = h1Match ? articleHtml.replace(h1Match[0], "") : articleHtml;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://linguadivina.uk/script-new-blb.js" defer></script>
<title>${escapeHtml(slug)} — Lingua Divina Plus</title>
${FONT_LINK}
<style>${ARTICLE_STYLE}${CODE_STYLE}${HEADER_FOOTER_STYLE}${BASE_STYLE}</style>
</head>
<body>
  ${HEADER_HTML}
  <p><a href="/">&larr; All articles</a></p>
  ${h1Html}
  <div class="article-body">${remainderHtml}</div>
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
<title>Subscribe — Lingua Divina Plus</title>
${FONT_LINK}
<style>${PAYWALL_STYLE}${HEADER_FOOTER_STYLE}${BASE_STYLE}</style>
</head>
<body>
  ${HEADER_HTML}
  <h1 class="plain" >This article is for Lingua Divina Plus subscribers</h1>
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

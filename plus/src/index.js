import {
  createSessionCookie,
  verifySessionCookie,
  getCookie,
  verifyStripeSignature,
} from "./cookie.js";

// This Worker is deployed at a subpath of your main site (e.g.
// linguadivina.uk/plus/*) via a Worker Route configured in the Cloudflare
// dashboard (Websites > linguadivina.uk > Workers Routes). All the routes
// below are relative to that mount point.

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
    if (path.endsWith("/api/article-content") && request.method === "GET") {
      return articleContent(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

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
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_details?.email;
    const subscriptionId = session.subscription;
    if (email && subscriptionId) {
      const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
        headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
      });
      const subscription = await subRes.json();
      await env.SUBSCRIBERS.put(
        email.toLowerCase(),
        JSON.stringify({
          status: "active",
          customerId: session.customer,
          subscriptionId,
          currentPeriodEnd: subscription.current_period_end,
        })
      );
    }
  }
  return new Response("ok");
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
  const expiresAt = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
  const cookieValue = await createSessionCookie(email, expiresAt, env.COOKIE_SECRET);

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectPath,
      "Set-Cookie": `paywall_session=${cookieValue}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
    },
  });
}

async function articleContent(request, env) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });

  const cookieValue = getCookie(request, "paywall_session");
  const session = await verifySessionCookie(cookieValue, env.COOKIE_SECRET);
  if (!session) return new Response(JSON.stringify({ error: "Not subscribed" }), { status: 401 });

  const subscriberRaw = await env.SUBSCRIBERS.get(session.email);
  const subscriber = subscriberRaw ? JSON.parse(subscriberRaw) : null;
  if (!subscriber || subscriber.status !== "active") {
    return new Response(JSON.stringify({ error: "Subscription inactive" }), { status: 403 });
  }

  const articleHtml = await env.ARTICLES.get(slug);
  if (!articleHtml) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  return new Response(JSON.stringify({ html: articleHtml }), {
    headers: { "Content-Type": "application/json" },
  });
}

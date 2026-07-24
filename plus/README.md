# Article Paywall — Cloudflare Worker at /plus

This is a Worker (deployed via `wrangler deploy`), not a Pages Functions app,
matching your existing project setup. It mounts on `linguadivina.uk/plus/*`.

## Repo location
Put this whole folder as `plus/` inside `adore-god/linguadivina`, matching
the Root directory (`/plus`) you already configured:

```
adore-god/linguadivina/
├── (your main site — unaffected)
└── plus/
    ├── src/
    │   ├── index.js
    │   └── cookie.js
    ├── wrangler.toml
    └── example-article-snippet.html
```

## One-time setup

### 1. Create the KV namespaces
From your terminal, inside the `plus/` folder:
```
npx wrangler kv namespace create SUBSCRIBERS
npx wrangler kv namespace create ARTICLES
```
Each command prints an `id`. Paste both into `wrangler.toml` where it says
`REPLACE_WITH_..._NAMESPACE_ID`.

### 2. Set your Stripe price ID
In `wrangler.toml`, replace `price_REPLACE_ME` with your existing price ID.

### 3. Set secrets (never go in wrangler.toml or the repo)
```
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put COOKIE_SECRET
```
- `STRIPE_SECRET_KEY`: from Stripe Dashboard → Developers → API keys
- `COOKIE_SECRET`: any long random string, e.g. output of `openssl rand -hex 32`
- `STRIPE_WEBHOOK_SECRET`: you'll get this in step 5 below — you can set a
  placeholder now and update it after

### 4. Confirm the Worker Route
`wrangler.toml` already declares:
```
routes = [{ pattern = "linguadivina.uk/plus/api/*", zone_name = "linguadivina.uk" }]
```
This requires `linguadivina.uk`'s DNS to be on Cloudflare — which it already
is. On your next `wrangler deploy` (or push, since it's Git-connected),
this route is created automatically. You can verify it under
Cloudflare Dashboard → Websites → linguadivina.uk → Rules → Overview →
(or Workers Routes, depending on dashboard version).

### 5. Add the Stripe webhook
Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://linguadivina.uk/plus/api/checkout-webhook`
- Event: `checkout.session.completed`

Copy its signing secret and update `STRIPE_WEBHOOK_SECRET` (re-run the
`wrangler secret put` command from step 3).

### 6. Add paywalled article content
For each gated article, push its full HTML into the `ARTICLES` namespace:
```
npx wrangler kv key put --binding=ARTICLES "my-article-slug" "<p>full article html</p>"
```

### 7. Serve the actual /plus pages themselves
This Worker currently only handles the `/plus/api/*` routes (the backend
logic). Your actual `/plus/...` article HTML pages need to be served some
other way — e.g. as static files alongside this Worker, or by extending
`src/index.js` to also serve static content for non-API paths. Let me know
which you'd prefer and I'll wire it up.

## Notes
- Test with Stripe test mode keys first, and card `4242 4242 4242 4242`.
- The signed cookie is a convenience layer; KV `SUBSCRIBERS` status is the
  real source of truth for active/canceled subscriptions.

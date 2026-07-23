// Signed session cookie helpers (HMAC-SHA256, no external deps).

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

export async function createSessionCookie(email, expiresAt, secret) {
  const encodedPayload = toBase64Url(JSON.stringify({ email, exp: expiresAt }));
  const sig = await hmac(secret, encodedPayload);
  return `${encodedPayload}.${sig}`;
}

export async function verifySessionCookie(cookieValue, secret) {
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

export function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
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

export { verifyStripeSignature };

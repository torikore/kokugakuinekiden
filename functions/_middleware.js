const encoder = new TextEncoder();

function timingSafeEqual(a, b) {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.byteLength !== bBytes.byteLength) {
    crypto.subtle.timingSafeEqual(aBytes, aBytes);
    return false;
  }
  return crypto.subtle.timingSafeEqual(aBytes, bBytes);
}

function decodeBasic(header) {
  const space = header.indexOf(" ");
  if (space < 0) return null;
  const scheme = header.slice(0, space);
  const encoded = header.slice(space + 1).trim();
  if (scheme !== "Basic" || !encoded) return null;
  try {
    const decoded = atob(encoded);
    const colon = decoded.indexOf(":");
    if (colon < 0) return null;
    return {
      user: decoded.slice(0, colon),
      pass: decoded.slice(colon + 1)
    };
  } catch (err) {
    return null;
  }
}

function unauthorized() {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Kokugakuin Ekiden", charset="UTF-8"',
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequest(context) {
  const user = context.env.BASIC_USER;
  const pass = context.env.BASIC_PASS;
  if (!user || !pass) {
    return new Response("Authentication is not configured.", {
      status: 500,
      headers: { "Cache-Control": "no-store" }
    });
  }

  const authorization = context.request.headers.get("Authorization");
  if (!authorization) return unauthorized();

  const creds = decodeBasic(authorization);
  if (!creds) return unauthorized();
  if (!timingSafeEqual(user, creds.user) || !timingSafeEqual(pass, creds.pass)) {
    return unauthorized();
  }

  const response = await context.next();
  const next = new Response(response.body, response);
  next.headers.set("Cache-Control", "private, no-store");
  return next;
}

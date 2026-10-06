export const DEMO_COOKIE = "pk_demo_session";

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return new Uint8Array(signature);
}

export async function signUserId(userId: string, secret: string) {
  const signature = await hmac(secret, userId);
  return `${userId}.${bytesToBase64Url(signature)}`;
}

export async function verifySignedUserId(token: string | undefined, secret: string) {
  if (!token) return null;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;
  const userId = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return null;
  const expected = await hmac(secret, userId);
  const actual = base64UrlToBytes(signature);
  if (actual.length !== expected.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) mismatch |= actual[i] ^ expected[i];
  return mismatch === 0 ? userId : null;
}

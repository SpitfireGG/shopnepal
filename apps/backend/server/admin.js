'use strict';
const crypto = require('crypto');

function b64(s) { return Buffer.from(s).toString('base64'); }

function makeToken(user, pass) {
  const payload = `${user}:${Date.now()}:${crypto.randomBytes(6).toString('hex')}`;
  const sig = crypto.createHmac('sha256', pass).update(payload).digest('hex').slice(0, 16);
  return b64(`${user}:${sig}:${b64(payload)}`);
}

function parseBasic(header) {
  if (!header) return null;
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return null;
  try {
    const decoded = Buffer.from(encoded, 'base64').toString();
    const idx = decoded.indexOf(':');
    if (idx === -1) return null;
    return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
  } catch { return null; }
}

function parseBearer(header) {
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function requireAdmin(req, res, next) {
  const expectedPass = process.env.ADMIN_PASSWORD;
  const expectedUser = process.env.ADMIN_USER || 'admin';
  if (!expectedPass) return res.status(503).json({ error: 'Admin disabled: set ADMIN_PASSWORD' });

  const auth = req.headers.authorization || '';
  const basic = parseBasic(auth);
  if (basic && basic.user === expectedUser && basic.pass === expectedPass) return next();

  const bearer = parseBearer(auth);
  if (bearer) {
    try {
      const decoded = Buffer.from(bearer, 'base64').toString();
      const [u, sig, payloadB64] = decoded.split(':');
      if (u === expectedUser) {
        const payload = Buffer.from(payloadB64 || '', 'base64').toString();
        const expectSig = crypto.createHmac('sha256', expectedPass).update(payload).digest('hex').slice(0, 16);
        if (sig === expectSig) return next();
      }
    } catch {}
  }

  const xUser = req.headers['x-admin-user'];
  const xPass = req.headers['x-admin-pass'];
  if (xUser && xPass && xUser === expectedUser && xPass === expectedPass) return next();

  res.set('WWW-Authenticate', 'Basic realm="ShopNepal admin"');
  return res.status(401).json({ error: 'Authentication required' });
}

function loginHandler(req, res) {
  const expectedPass = process.env.ADMIN_PASSWORD;
  const expectedUser = process.env.ADMIN_USER || 'admin';
  if (!expectedPass) return res.status(503).json({ error: 'Admin disabled' });
  const { username, password, user, pass } = req.body || {};
  const u = username || user || '';
  const p = password || pass || '';
  if (u === expectedUser && p === expectedPass) {
    const token = makeToken(u, p);
    const basic = b64(`${u}:${p}`);
    return res.json({ token, basic, user: u });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
}

module.exports = { requireAdmin, loginHandler, parseBasic };

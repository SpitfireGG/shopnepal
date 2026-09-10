import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const expectedPass = process.env.ADMIN_PASSWORD;
    const expectedUser = process.env.ADMIN_USER || 'admin';
    if (!expectedPass) return false;
    const header = req.headers.authorization || '';
    const [scheme, encoded] = header.split(' ');
    if (scheme === 'Basic' && encoded) {
      try { const [u, p] = Buffer.from(encoded, 'base64').toString().split(':'); if (u === expectedUser && p === expectedPass) return true; } catch {}
    }
    if (scheme === 'Bearer' && encoded) {
      try { const decoded = Buffer.from(encoded, 'base64').toString(); const [u, sig, payloadB64] = decoded.split(':'); if (u === expectedUser) { const payload = Buffer.from(payloadB64 || '', 'base64').toString(); const expect = crypto.createHmac('sha256', expectedPass).update(payload).digest('hex').slice(0, 16); if (sig === expect) return true; } } catch {}
    }
    return false;
  }
}
export function loginHandler(req, res) {
  const expectedPass = process.env.ADMIN_PASSWORD; const expectedUser = process.env.ADMIN_USER || 'admin';
  const { username, password, user, pass } = req.body || {}; const u = username || user || ''; const p = password || pass || '';
  if (u === expectedUser && p === expectedPass) {
    const payload = `${u}:${Date.now()}:${crypto.randomBytes(6).toString('hex')}`;
    const sig = crypto.createHmac('sha256', p).update(payload).digest('hex').slice(0, 16);
    const token = Buffer.from(`${u}:${sig}:${Buffer.from(payload).toString('base64')}`).toString('base64');
    const basic = Buffer.from(`${u}:${p}`).toString('base64');
    return res.json({ token, basic, user: u });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
}

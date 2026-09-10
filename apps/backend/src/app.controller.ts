import { Controller, Get, Post, Put, Delete, Patch, Query, Param, Body, Req, Res, UseGuards } from '@nestjs/common';
import { ProductService } from './modules/product/product.service';
import { OrderService } from './modules/order/order.service';
import { ReportService } from './modules/report/report.service';
import { AuditService } from './modules/audit/audit.service';
import { CouponService } from './modules/coupon/coupon.service';
import { AdminGuard, loginHandler } from './core/auth/auth.guard';
import { AppDataSource } from './core/database/data-source';
import { Coupon } from './modules/coupon/coupon.entity';
import * as path from 'path';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private products: ProductService, private orders: OrderService, private reports: ReportService, private audit: AuditService, private coupons: CouponService) {}

  @Get('api') async apiRoot() { return { status: 'ok', service: 'ShopNepal API', version: '1.0.0', port: process.env.PORT || 4000, endpoints: ['GET /api/products','GET /api/products/:slug','GET /api/search','POST /api/checkout','GET /api/orders/:uuid','GET /api/track/:uuid','POST /api/coupons/validate','POST /api/admin/login','GET /api/spotlight/*'] }; }
  @Get('api/products') async listProducts(@Query('q') q?: string, @Query('category') cat?: string) { if (q || cat) return this.products.search(q || '', cat); return this.products.list(); }
  @Get('api/products/:slug') async bySlug(@Param('slug') slug: string) { const p = await this.products.bySlug(slug); if (!p) return { error: 'No such product' }; return p; }
  @Get('api/search') async search(@Query('q') q: string, @Query('category') cat?: string) { return this.products.search(q || '', cat); }

  @Post('api/checkout') async checkout(@Body() body: any, @Req() req: any) {
    const requested = String(body.method||'esewa');
    if(requested==='dummy'){
      const d=require('../../server/dummy-gateway');
      if(!d.isEnabled()) return { error: 'The test gateway is disabled. Set ENABLE_DUMMY_GATEWAY=true.' };
    }
    const method = body.method === 'khalti' ? 'khalti' : body.method === 'dummy' ? 'dummy' : 'esewa';
    const lines: any[] = []; let subtotal = 0;
    for (const item of body.items || []) {
      const p = await this.products.byId(item.id); if (!p) throw new Error(`Unknown product ${item.id}`);
      const qty = Math.floor(Number(item.qty)); if (qty > p.stock) throw new Error(`Only ${p.stock} left of ${p.title}`);
      const lineTotal = p.price * qty; lines.push({ id: p.id, slug: p.slug, title: p.title, size: item.size || null, qty, unitPrice: p.price, lineTotal }); subtotal += lineTotal;
    }
    let discount = 0; if (body.couponCode) { const v = await this.coupons.validate(body.couponCode, subtotal); if (v.valid) discount = v.coupon.type === 'percent' ? Math.floor(subtotal * v.coupon.value / 100) : v.coupon.value; }
    const delivery = 100; const totalAmount = subtotal - discount + delivery;
    const uuid = this.orders.newUuid();
    const order = await this.orders.create({ transactionUuid: uuid, method, lines, subtotal, deliveryCharge: delivery, totalAmount, discountAmount: discount, couponCode: body.couponCode || null, customer: body, customerIp: req.ip });
    if (method === 'dummy') {
      const dummy = require('../../server/dummy-gateway'); const token = dummy.createToken({ transactionUuid: uuid, totalAmount });
      const base = process.env.PUBLIC_BASE_URL || 'http://localhost:4000';
      return { method, redirectUrl: `${base}/payment/dummy?token=${encodeURIComponent(token)}`, transactionUuid: uuid, orderNumber: order.orderNumber, discount };
    }
    if (method === 'khalti') {
      const khalti = require('../../server/khalti'); const { pidx, paymentUrl } = await khalti.initiatePayment({ totalAmount, orderId: uuid, orderName: `ShopNepal order #${order.orderNumber}`, returnUrl: `${process.env.PUBLIC_BASE_URL || 'http://localhost:4000'}/payment/khalti/callback`, websiteUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:4000', customer: body });
      await AppDataSource.getRepository(require('./modules/order/order.entity').Order).update({ transactionUuid: uuid }, { pidx } as any);
      return { method, redirectUrl: paymentUrl, transactionUuid: uuid, orderNumber: order.orderNumber, discount };
    }
    const esewa = require('../../server/esewa'); const { action, fields } = esewa.buildPaymentPayload({ amount: subtotal - discount, deliveryCharge: delivery, transactionUuid: uuid, successUrl: `${process.env.PUBLIC_BASE_URL || 'http://localhost:4000'}/payment/success`, failureUrl: `${process.env.PUBLIC_BASE_URL || 'http://localhost:4000'}/payment/failure` });
    return { method, action, fields, transactionUuid: uuid, orderNumber: order.orderNumber, discount };
  }

  @Get('api/orders/:uuid') async getOrder(@Param('uuid') uuid: string) { const o = await this.orders.get(uuid); if (!o) return { error: 'No such order' }; return o; }
  @Get('api/track/:uuid') async track(@Param('uuid') uuid: string) { return this.orders.tracking(uuid); }
  @Post('api/coupons/validate') async validate(@Body() body: any) { return this.coupons.validate(body.code || '', Number(body.amount || 0)); }

  @Post('api/admin/login') login(@Req() req: any, @Res() res: any) { return loginHandler(req, res); }

  @UseGuards(AdminGuard) @Get('api/admin/stats') async stats() {
    const orders = await this.orders.list(); const products = await this.products.list(); const paid = orders.filter(o => o.paymentStatus === 'PAID'); const revenue = paid.reduce((s, o) => s + Number(o.totalAmount), 0);
    return { totalOrders: orders.length, paidOrders: paid.length, pendingOrders: orders.filter(o => o.status === 'PENDING').length, unpaid: orders.filter(o => o.paymentStatus !== 'PAID').length, totalProducts: products.length, lowStock: (await this.products.lowStock()).length, lowStockProducts: await this.products.lowStock(), categories: new Set(products.map(p => p.category)).size, totalRevenue: revenue, avgOrder: paid.length ? revenue / paid.length : 0, mix: Object.entries(products.reduce((m, p) => { m[p.category] = (m[p.category] || 0) + 1; return m; }, {} as any)).map(([name, count]) => ({ name, count })), trend: Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const k = d.toISOString().slice(0, 10); return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), count: orders.filter(o => String(o.createdAt).slice(0, 10) === k).length }; }) };
  }
  @UseGuards(AdminGuard) @Get('api/admin/products') pList() { return this.products.list(); }
  @UseGuards(AdminGuard) @Post('api/admin/products') pCreate(@Body() b: any) { return this.products.create(b); }
  @UseGuards(AdminGuard) @Put('api/admin/products/:id') pUpdate(@Param('id') id: string, @Body() b: any) { return this.products.update(id, b); }
  @UseGuards(AdminGuard) @Delete('api/admin/products/:id') pDelete(@Param('id') id: string) { return this.products.remove(id); }

  @UseGuards(AdminGuard) @Get('api/admin/orders') oList() { return this.orders.list(); }
  @UseGuards(AdminGuard) @Get('api/admin/orders/:uuid') oGet(@Param('uuid') uuid: string) { return this.orders.get(uuid); }
  @UseGuards(AdminGuard) @Patch('api/admin/orders/:uuid') async oPatch(@Param('uuid') uuid: string, @Body() b: any, @Req() req: any) { const u = await this.orders.updateStatus(uuid, b.status); await this.audit.log(req.headers['x-admin-user'] || 'admin', 'update_status', 'order', uuid, { status: b.status }); return u; }

  @UseGuards(AdminGuard) @Get('api/admin/reports/sales') async sales(@Query('from') from: string, @Query('to') to: string) { return this.reports.sales(from, to); }
  @UseGuards(AdminGuard) @Get('api/admin/reports/sales.csv') async csv(@Query('from') from: string, @Query('to') to: string, @Res() res: any) { const r = await this.reports.sales(from, to); res.setHeader('Content-Type', 'text/csv'); res.setHeader('Content-Disposition', 'attachment; filename="sales.csv"'); res.send(this.reports.csv(r.orders)); }
  @UseGuards(AdminGuard) @Get('api/admin/audit') auditList() { return this.audit.list(); }
  @UseGuards(AdminGuard) @Get('api/admin/coupons') cList() { return this.coupons.list(); }
  @UseGuards(AdminGuard) @Post('api/admin/coupons') cCreate(@Body() b: any) { const repo = AppDataSource.getRepository(Coupon); return repo.save(repo.create({ code: b.code.toUpperCase(), type: b.type, value: b.value, minAmount: b.minAmount || 0, active: b.active !== false } as any)); }

  @Get('payment/dummy') async dummyPage(@Query('token') token: string, @Res() res: any) {
    const dummy = require('../../server/dummy-gateway');
    if (!dummy.isEnabled()) return res.status(404).send('Not found');
    if (!dummy.verifyToken(token)) return res.redirect('/payment-failure.html?reason=signature');
    const roots=[process.env.STATIC_ROOT && path.resolve(process.env.STATIC_ROOT), path.join(__dirname,'..','..','frontend','public'), path.join(__dirname,'..','public'), path.join(process.cwd(),'apps/frontend/public')].filter(Boolean) as string[];
    for(const r of roots){ const f=path.join(r,'dummy-pay.html'); if(fs.existsSync(f)) return res.sendFile(f); }
    return res.sendFile(path.join(process.env.STATIC_ROOT|| path.join(__dirname,'..','..','frontend','public'), 'dummy-pay.html'));
  }
  @Get('api/dummy/session') async dummySession(@Query('token') token: string) {
    const dummy = require('../../server/dummy-gateway');
    if (!dummy.isEnabled()) return { error: 'Test gateway disabled.' };
    const claim = dummy.verifyToken(token);
    if (!claim) return { error: 'This payment link is invalid or has expired.' };
    const order = await this.orders.get(claim.transactionUuid);
    if (!order) return { error: 'No such order.' };
    return { orderNumber: order.orderNumber, totalAmount: order.totalAmount, customerName: order.customer?.name||'', testPin: dummy.TEST_PIN, testOtp: dummy.TEST_OTP };
  }
  @Post('api/dummy/complete') async dummyComplete(@Body() body: any, @Res() res:any) {
    const dummy = require('../../server/dummy-gateway');
    if (!dummy.isEnabled()) return res.status(403).json({ error: 'Test gateway disabled.' });
    const claim = dummy.verifyToken(body.token);
    if (!claim) return res.status(400).json({ error: 'This payment link is invalid or has expired.' });
    const order = await this.orders.get(claim.transactionUuid);
    if (!order) return res.status(404).json({ error: 'No such order.' });
    if (Number(claim.totalAmount) !== Number(order.totalAmount)) return res.status(409).json({ error: 'Amount mismatch - payment refused.' });
    if (body.outcome === 'fail') {
      await AppDataSource.getRepository(require('./modules/order/order.entity').Order).update({ transactionUuid: order.transactionUuid }, { paymentStatus: 'FAILED', status: 'CANCELLED' } as any);
      return res.json({ redirectUrl: '/payment-failure.html?reason=cancelled' });
    }
    if (String(body.pin) !== dummy.TEST_PIN || String(body.otp) !== dummy.TEST_OTP) return res.status(401).json({ error: 'Wrong PIN or OTP.' });
    if (order.paymentStatus !== 'PAID') {
      await this.orders.markPaid(order.transactionUuid, { paymentRef: dummy.referenceFor(order.orderNumber), gatewayStatus: 'COMPLETE' });
      const prodRepo=AppDataSource.getRepository(require('./modules/product/product.entity').Product);
      for(const l of order.lines||[]){ try{ const p=await prodRepo.findOne({where:{id:l.productId}}); if(p) await prodRepo.update({id:l.productId},{stock: Math.max(0, p.stock - l.qty)} as any);}catch{} }
    }
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.json({ redirectUrl: `${frontendBase}/invoice/${encodeURIComponent(order.transactionUuid)}`, fallbackUrl: `/payment-success.html?order=${encodeURIComponent(order.transactionUuid)}` });
  }
  @Get('invoice/:uuid') async invoicePage(@Param('uuid') uuid:string, @Res() res:any){
    const roots=[process.env.STATIC_ROOT && path.resolve(process.env.STATIC_ROOT), path.join(__dirname,'..','..','frontend','public'), path.join(__dirname,'..','public')].filter(Boolean) as string[];
    for(const r of roots){ const f=path.join(r,'invoice.html'); if(fs.existsSync(f)) return res.sendFile(f); }
    return res.redirect(`/payment-success.html?order=${encodeURIComponent(uuid)}`);
  }
  @Get('label/:uuid') async labelPage(@Param('uuid') uuid:string, @Res() res:any){
    const roots=[process.env.STATIC_ROOT && path.resolve(process.env.STATIC_ROOT), path.join(__dirname,'..','..','frontend','public'), path.join(__dirname,'..','public')].filter(Boolean) as string[];
    for(const r of roots){ const f=path.join(r,'label.html'); if(fs.existsSync(f)) return res.sendFile(f); }
    return res.status(404).send('Label not found');
  }
  @Get('payment/success') async esewaSuccess(@Query('data') data: string, @Res() res: any) {
    const esewa = require('../../server/esewa'); const decoded = esewa.decodeCallback(data);
    if (!decoded || !esewa.verifyCallbackSignature(decoded)) return res.redirect('/payment-failure.html?reason=signature');
    const order = await this.orders.get(decoded.transaction_uuid); if (!order) return res.redirect('/payment-failure.html?reason=unknown-order');
    try { const status = await esewa.checkTransactionStatus({ transactionUuid: decoded.transaction_uuid, totalAmount: order.totalAmount }); if (status.status === 'COMPLETE' && Number(status.total_amount) === Number(order.totalAmount)) { await this.orders.markPaid(decoded.transaction_uuid, { paymentRef: status.ref_id || decoded.transaction_code, gatewayStatus: status.status }); return res.redirect(`/payment-success.html?order=${decoded.transaction_uuid}`); } await AppDataSource.getRepository(require('./modules/order/order.entity').Order).update({ transactionUuid: decoded.transaction_uuid }, { paymentStatus: status.status } as any); return res.redirect(`/payment-failure.html?reason=${status.status}`); } catch { await AppDataSource.getRepository(require('./modules/order/order.entity').Order).update({ transactionUuid: decoded.transaction_uuid }, { paymentStatus: 'VERIFICATION_FAILED' } as any); return res.redirect('/payment-failure.html?reason=verification'); }
  }
  @Get('payment/khalti/callback') async khaltiCb(@Query('purchase_order_id') uuid: string, @Query('pidx') pidx: string, @Res() res: any) {
    const order = await this.orders.get(uuid); if (!order || !pidx) return res.redirect('/payment-failure.html?reason=unknown-order');
    try { const khalti = require('../../server/khalti'); const result = await khalti.lookupPayment(pidx); if (result.status === 'Completed' && Number(result.totalAmount) === Number(order.totalAmount)) { await this.orders.markPaid(uuid, { paymentRef: result.transactionId, gatewayStatus: result.status }); return res.redirect(`/payment-success.html?order=${uuid}`); } await AppDataSource.getRepository(require('./modules/order/order.entity').Order).update({ transactionUuid: uuid }, { paymentStatus: result.status } as any); return res.redirect(`/payment-failure.html?reason=${result.status}`); } catch { return res.redirect('/payment-failure.html?reason=verification'); }
  }
  @Get('payment/failure') async fail(@Query('data') data: string, @Res() res: any) { try { const esewa = require('../../server/esewa'); const d = esewa.decodeCallback(data); if (d?.transaction_uuid) await AppDataSource.getRepository(require('./modules/order/order.entity').Order).update({ transactionUuid: d.transaction_uuid }, { paymentStatus: 'FAILED', status: 'CANCELLED' } as any); } catch {} return res.redirect('/payment-failure.html?reason=cancelled'); }
}

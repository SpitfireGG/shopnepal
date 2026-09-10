'use strict';
require('dotenv').config();
const express = require('express');
const path = require('path');
const esewa = require('./esewa');
const khalti = require('./khalti');
const dummyGateway = require('./dummy-gateway');
const orders = require('./orders');
const productStore = require('./products-store');
const audit = require('./audit');
const { requireAdmin, loginHandler } = require('./admin');
const app = express();
const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;
const BASE_URL = (process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const DELIVERY_CHARGE = 100;
app.use(express.json());
app.set('trust proxy', true);

app.get('/product/:slug', async (req,res,next)=>{
  const p = await productStore.getBySlug(req.params.slug);
  if(!p) { try{ const s=require('../assets/js/products.js'); if(!s.bySlug(req.params.slug)) return next(); } catch{ return next(); } }
  res.sendFile(path.join(ROOT,'product.html'));
});

app.get('/api/products', async (req,res)=>{
  const { q, category } = req.query;
  if(q || category) return res.json(await productStore.search(String(q||''), String(category||'')));
  res.json(await productStore.list());
});
app.get('/api/search', async (req,res)=> res.json(await productStore.search(String(req.query.q||''), String(req.query.category||''))));
app.get('/api/products/:slug', async (req,res)=>{
  const p = await productStore.getBySlug(req.params.slug);
  if(!p) return res.status(404).json({error:'No such product.'});
  res.json(p);
});
app.get('/api/track/:uuid', async (req,res)=>{
  const o=await orders.get(req.params.uuid); if(!o) return res.status(404).json({error:'No such order'});
  const steps=['PENDING','PROCESSING','COMPLETED']; const idx=steps.indexOf(o.status);
  res.json({ order:{transactionUuid:o.transactionUuid, orderNumber:o.orderNumber, status:o.status, paymentStatus:o.paymentStatus, createdAt:o.createdAt, paidAt:o.paidAt}, steps: steps.map(s=>({status:s, done: idx>=steps.indexOf(s), current: s===o.status}))});
});
app.post('/api/coupons/validate', async (req,res)=>{
  const code=String(req.body.code||'').toUpperCase(); const coupons={ WELCOME10:{type:'percent',value:10,min:1000}, FLAT500:{type:'flat',value:500,min:5000}};
  const c=coupons[code]; if(!c) return res.json({valid:false, error:'Invalid code'});
  const amount=Number(req.body.amount||0); if(amount<c.min) return res.json({valid:false, error:`Min Rs. ${c.min}`});
  res.json({valid:true, coupon:c});
});

async function priceCart(items){
  if(!Array.isArray(items)||!items.length) return {error:'Your cart is empty.'};
  const lines=[];
  for(const item of items){
    const product = await productStore.getById(item.id);
    if(!product) return {error:`Unknown product: ${item.id}`};
    const qty=Math.floor(Number(item.qty));
    if(!Number.isFinite(qty)||qty<1||qty>99) return {error:`Invalid quantity for ${product.title}.`};
    if(qty>product.stock) return {error:`Only ${product.stock} left of ${product.title}.`};
    lines.push({id:product.id,slug:product.slug,title:product.title,size:item.size||null,qty,unitPrice:product.price,lineTotal:product.price*qty});
  }
  return {lines, subtotal: lines.reduce((s,l)=>s+l.lineTotal,0)};
}
const trim=(v,m)=>String(v||'').slice(0,m);
function readCustomer(b){ return {name:trim(b.name,120),email:trim(b.email,160),phone:trim(b.phone,20),address:trim(b.address,300),city:trim(b.city,80),state:trim(b.state,80),postcode:trim(b.postcode,20)}; }

app.post('/api/checkout', async (req,res)=>{
  try{
    const requested = String(req.body.method || 'esewa');
    if (requested === 'dummy' && !dummyGateway.isEnabled()) {
      return res.status(403).json({ error: 'The test gateway is disabled. Set ENABLE_DUMMY_GATEWAY=true.' });
    }
    const method = ['khalti', 'dummy'].includes(requested) ? requested : 'esewa';
    const priced=await priceCart(req.body.items);
    if(priced.error) return res.status(400).json({error:priced.error});
    const {lines,subtotal}=priced;
    const totalAmount=subtotal+DELIVERY_CHARGE;
    const transactionUuid=orders.newTransactionUuid();
    const customer=readCustomer(req.body);
    const order=await orders.create({transactionUuid,method,lines,subtotal,deliveryCharge:DELIVERY_CHARGE,totalAmount,customer,customerIp:req.ip});
    if(method==='dummy'){
      // Straight to the local mock gateway - no network call, no third party.
      const token = dummyGateway.createToken({ transactionUuid, totalAmount });
      return res.json({
        method,
        redirectUrl: `/payment/dummy?token=${encodeURIComponent(token)}`,
        transactionUuid,
        orderNumber: order.orderNumber,
      });
    }
    if(method==='khalti'){
      const {pidx,paymentUrl}=await khalti.initiatePayment({totalAmount,orderId:transactionUuid,orderName:`ShopNepal order #${order.orderNumber}`,returnUrl:`${BASE_URL}/payment/khalti/callback`,websiteUrl:BASE_URL,customer});
      await orders.update(transactionUuid,{pidx});
      return res.json({method,redirectUrl:paymentUrl,transactionUuid,orderNumber:order.orderNumber});
    }
    const {action,fields}=esewa.buildPaymentPayload({amount:subtotal,deliveryCharge:DELIVERY_CHARGE,transactionUuid,successUrl:`${BASE_URL}/payment/success`,failureUrl:`${BASE_URL}/payment/failure`});
    res.json({method,action,fields,transactionUuid,orderNumber:order.orderNumber});
  }catch(err){ console.error('checkout failed:',err); res.status(500).json({error:err.message||'Could not start the payment.'}); }
});

app.get('/payment/success', async (req,res)=>{
  const decoded=esewa.decodeCallback(req.query.data);
  if(!decoded||!esewa.verifyCallbackSignature(decoded)){ console.warn('rejected eSewa callback'); return res.redirect('/payment-failure.html?reason=signature'); }
  const uuid=decoded.transaction_uuid;
  const order=await orders.get(uuid);
  if(!order) return res.redirect('/payment-failure.html?reason=unknown-order');
  try{
    const status=await esewa.checkTransactionStatus({transactionUuid:uuid,totalAmount:order.totalAmount});
    const paidMatches=Number(status.total_amount)===Number(order.totalAmount);
    if(status.status==='COMPLETE'&&paidMatches){ await orders.markPaid(uuid,{paymentRef:status.ref_id||decoded.transaction_code||null,gatewayStatus:status.status}); await productStore.decrementStock(order.lines||[]); return res.redirect(`/payment-success.html?order=${encodeURIComponent(uuid)}`); }
    await orders.update(uuid,{paymentStatus:status.status||'UNKNOWN'});
    return res.redirect(`/payment-failure.html?reason=${encodeURIComponent(status.status||'unknown')}`);
  }catch(err){ console.error('eSewa status check failed',uuid,err); await orders.update(uuid,{paymentStatus:'VERIFICATION_FAILED'}); return res.redirect('/payment-failure.html?reason=verification'); }
});
app.get('/payment/failure', async (req,res)=>{
  const decoded=esewa.decodeCallback(req.query.data);
  if(decoded&&decoded.transaction_uuid) await orders.update(decoded.transaction_uuid,{paymentStatus:'FAILED',status:'CANCELLED'});
  res.redirect('/payment-failure.html?reason=cancelled');
});
app.get('/payment/khalti/callback', async (req,res)=>{
  const uuid=String(req.query.purchase_order_id||'');
  const pidx=String(req.query.pidx||'');
  const order=await orders.get(uuid);
  if(!order||!pidx) return res.redirect('/payment-failure.html?reason=unknown-order');
  try{
    const result=await khalti.lookupPayment(pidx);
    const amountMatches=Number(result.totalAmount)===Number(order.totalAmount);
    if(result.status==='Completed'&&amountMatches){ await orders.markPaid(uuid,{paymentRef:result.transactionId,gatewayStatus:result.status}); await productStore.decrementStock(order.lines||[]); return res.redirect(`/payment-success.html?order=${encodeURIComponent(uuid)}`); }
    await orders.update(uuid,{paymentStatus:result.status||'UNKNOWN'});
    return res.redirect(`/payment-failure.html?reason=${encodeURIComponent(result.status||'unknown')}`);
  }catch(err){ console.error('Khalti lookup failed',uuid,err); await orders.update(uuid,{paymentStatus:'VERIFICATION_FAILED'}); return res.redirect('/payment-failure.html?reason=verification'); }
});

// --- offline test gateway ---------------------------------------------------

/** The mock payment screen. Guarded so it 404s when the gateway is off. */
app.get('/payment/dummy', (req, res, next) => {
  if (!dummyGateway.isEnabled()) return next();
  if (!dummyGateway.verifyToken(req.query.token)) {
    return res.redirect('/payment-failure.html?reason=signature');
  }
  res.sendFile(path.join(ROOT, 'dummy-pay.html'));
});

/** Token details for the mock screen, so it can show the real amount. */
app.get('/api/dummy/session', async (req, res) => {
  if (!dummyGateway.isEnabled()) return res.status(403).json({ error: 'Test gateway disabled.' });

  const claim = dummyGateway.verifyToken(req.query.token);
  if (!claim) return res.status(400).json({ error: 'This payment link is invalid or has expired.' });

  const order = await orders.get(claim.transactionUuid);
  if (!order) return res.status(404).json({ error: 'No such order.' });

  res.json({
    orderNumber: order.orderNumber,
    totalAmount: order.totalAmount,
    customerName: (order.customer && order.customer.name) || '',
    testPin: dummyGateway.TEST_PIN,
    testOtp: dummyGateway.TEST_OTP,
  });
});

/**
 * Completion. The token is what authorises this - not the query string, and
 * not the browser's say-so. The amount in the token is re-checked against the
 * stored order, the same defence the eSewa and Khalti callbacks use.
 */
app.post('/api/dummy/complete', async (req, res) => {
  if (!dummyGateway.isEnabled()) return res.status(403).json({ error: 'Test gateway disabled.' });

  const claim = dummyGateway.verifyToken(req.body.token);
  if (!claim) return res.status(400).json({ error: 'This payment link is invalid or has expired.' });

  const order = await orders.get(claim.transactionUuid);
  if (!order) return res.status(404).json({ error: 'No such order.' });

  if (Number(claim.totalAmount) !== Number(order.totalAmount)) {
    return res.status(409).json({ error: 'Amount mismatch - payment refused.' });
  }

  if (req.body.outcome === 'fail') {
    await orders.update(order.transactionUuid, { paymentStatus: 'FAILED', status: 'CANCELLED' });
    return res.json({ redirectUrl: '/payment-failure.html?reason=cancelled' });
  }

  if (String(req.body.pin) !== dummyGateway.TEST_PIN || String(req.body.otp) !== dummyGateway.TEST_OTP) {
    return res.status(401).json({ error: 'Wrong PIN or OTP.' });
  }

  if (order.paymentStatus !== 'PAID') {
    await orders.markPaid(order.transactionUuid, {
      paymentRef: dummyGateway.referenceFor(order.orderNumber),
      gatewayStatus: 'COMPLETE',
    });
    await productStore.decrementStock(order.lines||[]);
  }

  res.json({ redirectUrl: `/payment-success.html?order=${encodeURIComponent(order.transactionUuid)}` });
});

app.get('/api/orders/:uuid', async (req,res)=>{
  const order=await orders.get(req.params.uuid);
  if(!order) return res.status(404).json({error:'No such order.'});
  const {transactionUuid,orderNumber,method,paymentStatus,status,paymentRef,paidAt,lines,subtotal,deliveryCharge,totalAmount,customer,createdAt}=order;
  res.json({transactionUuid,orderNumber,method,paymentStatus,status,paymentRef,paidAt,lines,subtotal,deliveryCharge,totalAmount,customer,createdAt});
});
app.get('/invoice/:uuid', (_req,res)=> res.sendFile(path.join(ROOT,'invoice.html')));
app.get('/label/:uuid', (_req,res)=> res.sendFile(path.join(ROOT,'label.html')));

app.post('/api/admin/login', loginHandler);

app.get('/api/admin/stats', requireAdmin, async (_req,res)=>{
  const [allOrders, allProducts] = await Promise.all([orders.list(), productStore.list()]);
  const paid = allOrders.filter(o=>o.paymentStatus==='PAID');
  const totalRevenue = paid.reduce((s,o)=>s+Number(o.totalAmount||0),0);
  const pendingOrders = allOrders.filter(o=>o.status==='PENDING').length;
  const unpaid = allOrders.filter(o=>o.paymentStatus!=='PAID').length;
  const lowStockProducts = allProducts.filter(p=> (p.stock||0) <= (p.reorderLevel||5));
  const lowStock = lowStockProducts.length;
  const categories = new Set(allProducts.map(p=>p.category)).size;
  const avgOrder = paid.length? totalRevenue/paid.length:0;
  const mixMap={}; allProducts.forEach(p=>{mixMap[p.category]=(mixMap[p.category]||0)+1});
  const mix=Object.entries(mixMap).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);
  const trend=[];
  for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const key=d.toISOString().slice(0,10); const count=allOrders.filter(o=> (o.createdAt||'').slice(0,10)===key).length; trend.push({day:d.toLocaleDateString('en-US',{weekday:'short'}), count}); }
  res.json({totalOrders:allOrders.length, paidOrders:paid.length, pendingOrders, unpaid, totalProducts:allProducts.length, lowStock, lowStockProducts, categories, totalRevenue, avgOrder, mix, trend});
});
app.get('/api/admin/reports/sales', requireAdmin, async (req,res)=>{
  const {from,to,category,method}=req.query;
  let list=await orders.list();
  if(from) list=list.filter(o=>o.createdAt>=from);
  if(to) list=list.filter(o=>o.createdAt<=to+'T23:59:59.999Z');
  if(method) list=list.filter(o=>o.method===method);
  const paid=list.filter(o=>o.paymentStatus==='PAID');
  const revenue=paid.reduce((s,o)=>s+Number(o.totalAmount),0);
  const byPayment={}; const byCategory={}; const byDay={};
  paid.forEach(o=>{ byPayment[o.method]=(byPayment[o.method]||0)+Number(o.totalAmount); (o.lines||[]).forEach(l=>{ const cat=(l.title||'').toLowerCase(); byCategory[l.slug]=(byCategory[l.slug]||0)+l.lineTotal; }); const day=String(o.createdAt).slice(0,10); byDay[day]=(byDay[day]||0)+Number(o.totalAmount); });
  res.json({totalOrders: paid.length, revenue, byPayment, byCategory, byDay, orders: paid});
});
app.get('/api/admin/reports/sales.csv', requireAdmin, async (req,res)=>{
  const {from,to}=req.query; let list=(await orders.list()).filter(o=>o.paymentStatus==='PAID');
  if(from) list=list.filter(o=>o.createdAt>=from); if(to) list=list.filter(o=>o.createdAt<=to+'T23:59:59.999Z');
  const header='date,orderNumber,method,amount,paymentStatus,status';
  const rows=list.map(o=> `${String(o.createdAt).slice(0,10)},${o.orderNumber},${o.method},${o.totalAmount},${o.paymentStatus},${o.status}`);
  res.setHeader('Content-Type','text/csv'); res.setHeader('Content-Disposition','attachment; filename="sales.csv"'); res.send([header,...rows].join('\n'));
});
app.get('/api/admin/audit', requireAdmin, async (_req,res)=> res.json(await audit.list()));
app.get('/api/admin/coupons', requireAdmin, async (_req,res)=> res.json([{code:'WELCOME10',type:'percent',value:10,minAmount:1000,active:true},{code:'FLAT500',type:'flat',value:500,minAmount:5000,active:true}]));

app.get('/api/admin/products', requireAdmin, async (_req,res)=> res.json(await productStore.list()));
app.post('/api/admin/products', requireAdmin, async (req,res)=>{
  try{ const p=await productStore.create(req.body); await audit.log('admin','create','product',p.id,{title:p.title}); res.status(201).json(p); }catch(e){ res.status(400).json({error:e.message}); }
});
app.put('/api/admin/products/:id', requireAdmin, async (req,res)=>{
  const p=await productStore.update(req.params.id, req.body); if(!p) return res.status(404).json({error:'No such product'}); await audit.log('admin','update','product',req.params.id,req.body); res.json(p);
});
app.delete('/api/admin/products/:id', requireAdmin, async (req,res)=>{
  const ok=await productStore.remove(req.params.id); if(!ok) return res.status(404).json({error:'No such product'}); await audit.log('admin','delete','product',req.params.id,{}); res.json({ok:true});
});

app.get('/api/admin/orders', requireAdmin, async (_req,res)=> res.json(await orders.list()));
app.get('/api/admin/orders/:uuid', requireAdmin, async (req,res)=>{
  const order=await orders.get(req.params.uuid); if(!order) return res.status(404).json({error:'No such order.'}); res.json(order);
});
app.patch('/api/admin/orders/:uuid', requireAdmin, async (req,res)=>{
  const {status}=req.body; if(!orders.FULFILMENT_STATUSES.includes(status)) return res.status(400).json({error:`Status must be one of: ${orders.FULFILMENT_STATUSES.join(', ')}`});
  const prev=await orders.get(req.params.uuid); const updated=await orders.update(req.params.uuid,{status}); if(!updated) return res.status(404).json({error:'No such order.'}); await audit.log(req.headers['x-admin-user']||'admin','update_status','order',req.params.uuid,{from: prev?.status, to: status}); res.json(updated);
});

app.use('/admin', express.static(path.join(ROOT,'admin')));

app.use(express.static(ROOT,{extensions:['html']}));
app.use((_req,res)=> res.status(404).sendFile(path.join(ROOT,'404.html')));

app.listen(PORT,()=>{
  console.log(`ShopNepal storefront  ->  ${BASE_URL}`);
  try{ console.log(`eSewa  : ${esewa.config().env}`);}catch(e){ console.warn(`eSewa  : NOT CONFIGURED (${e.message})`);}
  try{ console.log(`Khalti : ${khalti.config().env}`);}catch(e){ console.warn(`Khalti : NOT CONFIGURED (${e.message})`);}
  console.log(`Test gw: ${dummyGateway.isEnabled() ? 'ENABLED (offline, no internet needed)' : 'disabled'}`);
  console.log('  Admin  - '+BASE_URL+'/admin/  (JS SPA, petrol theme)');
});

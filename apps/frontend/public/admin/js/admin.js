'use strict';
const LS_TOKEN='shopnepal_admin_token', LS_BASIC='shopnepal_admin_basic';
const $ = s=>document.querySelector(s);
const app = document.getElementById('app');

const NAV = [
  {label:'Dashboard', icon:'◧', hash:'#/dashboard', id:'dashboard'},
  {label:'Products', icon:'◨', hash:'#/products', id:'products', subs:[{label:'All Products',hash:'#/products'},{label:'Add New',hash:'#/products?create=1'}]},
  {label:'Orders', icon:'≡', hash:'#/orders', id:'orders'},
  {label:'Payments', icon:'₨', hash:'#/orders?filter=PAID', id:'payments'},
  {label:'Customers', icon:'◐', hash:'#/customers', id:'customers'},
  {label:'Reports', icon:'▭', hash:'#/reports', id:'reports'},
  {label:'Audit Log', icon:'≡', hash:'#/audit', id:'audit'},
  {label:'Settings', icon:'⚙', hash:'#/settings', id:'settings'},
];

function getAuth(){
  const token = localStorage.getItem(LS_TOKEN);
  const basic = localStorage.getItem(LS_BASIC);
  return {token,basic};
}
function authHeaders(){
  const {token,basic}=getAuth();
  const h={ 'Content-Type':'application/json' };
  if(basic) h['Authorization']='Basic '+basic;
  else if(token) h['Authorization']='Bearer '+token;
  return h;
}
async function api(path, opts={}){
  const res = await fetch(path,{...opts, headers:{...authHeaders(), ...(opts.headers||{})}});
  if(res.status===401){ localStorage.removeItem(LS_TOKEN); localStorage.removeItem(LS_BASIC); location.hash='#/login'; throw new Error('Unauthorized');}
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error||'Request failed');
  return data;
}
function isAuthed(){ return !!localStorage.getItem(LS_BASIC) || !!localStorage.getItem(LS_TOKEN); }

function icon(name){
  const m={
    dash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 15h6M9 12h6"/></svg>',
    prod:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 7l6-3 6 3v10l-6 3-6-3z"/><path d="M12 4v13"/></svg>',
    order:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 6h10M8 12h10M8 18h10"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>',
    pay:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M3 11h18"/></svg>',
    users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="3"/><path d="M5 19a7 7 0 0114 0"/></svg>',
    settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg>',
    chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 18l6-6-6-6"/></svg>',
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  };
  return m[name]||'';
}

function layout(inner, activeId){
  const collapsed = localStorage.getItem('shopnepal_sidebar_collapsed')==='1';
  const hash = location.hash||'#/dashboard';
  return `
  <div class="shell">
    <aside class="sidebar ${collapsed?'collapsed':''}" id="sidebar">
      <div class="sidebar-head">
        <div class="logo">SN</div>
        <div class="brand-text"><div class="t1">ShopNepal</div><div class="t2">Nepal • Management console</div></div>
        <button class="icon-btn" id="collapseBtn" style="margin-left:auto;width:28px;height:28px">${icon('menu')}</button>
      </div>
      <nav class="nav">
        <div class="nav-group"><div class="nav-label">Main</div>
          ${NAV.map(n=>{
            const isActive = activeId===n.id || (n.id==='payments' && hash.includes('filter=PAID'));
            const hasSubs = !!n.subs;
            return `<div>
              <a class="nav-item ${isActive?'active':''} ${hasSubs?'has-sub':''}" href="${n.hash}" data-id="${n.id}">
                <span style="width:16px;height:16px;display:grid;place-items:center">${icon(n.id==='dashboard'?'dash':n.id==='products'?'prod':n.id==='orders'?'order':n.id==='payments'?'pay':n.id==='customers'?'users':'settings')}</span>
                <span>${n.label}</span>
                ${hasSubs?`<span class="chevron">${icon('chev')}</span>`:''}
              </a>
              ${hasSubs?`<div class="nav-sub ${isActive?'open':''}">${n.subs.map(s=>`<a class="sub-item ${hash===s.hash?'active':''}" href="${s.hash}">${s.label}</a>`).join('')}</div>`:''}
            </div>`;
          }).join('')}
        </div>
        <div class="nav-group"><div class="nav-label">System</div>
          <a class="nav-item" href="#" id="logoutBtn"><span>⎋</span><span>Sign out</span></a>
        </div>
      </nav>
    </aside>
    <div class="main">
      <header class="header">
        <button class="icon-btn" id="mobileMenuBtn">${icon('menu')}</button>
        <label class="search"><span style="position:absolute;left:10px">${icon('search')}</span><input id="globalSearch" placeholder="Search products, orders…"/></label>
        <div class="h-actions">
          <button class="icon-btn" title="Toggle theme" id="themeBtn">◐</button>
          <div style="display:flex;align-items:center;gap:10px;padding-left:8px;border-left:1px solid var(--border)">
            <div class="avatar">AD</div>
            <div style="line-height:1.1"><div style="font-size:12px;font-weight:600">Admin</div><div style="font-size:11px;color:var(--muted-foreground)">ShopNepal Store</div></div>
          </div>
        </div>
      </header>
      <div class="breadcrumb"><a href="#/dashboard">Home</a><span>/</span><span style="color:var(--foreground)">${activeId}</span><span style="margin-left:auto;display:flex;align-items:center;gap:6px"><span class="live-dot"></span> <span style="font-size:11px;color:var(--muted-foreground)">Live</span></span></div>
      <div class="content" id="content">${inner}</div>
    </div>
  </div>
  <div class="modal-backdrop" id="modalBackdrop"><div class="modal" id="modalBox"></div></div>
  `;
}

function loginPage(msg){
  return `<div class="login-wrap">
    <form class="login-card" id="loginForm">
      <div style="width:40px;height:40px;border-radius:10px;background:var(--primary);color:var(--primary-foreground);display:grid;place-items:center;font-weight:700">A</div>
      <h1 style="margin-top:14px">Welcome back</h1>
      <p>Sign in to ShopNepal admin. Use <code>admin / shopnepal123</code> for demo.</p>
      ${msg?`<div style="margin-top:12px;padding:10px;border-radius:10px;background:color-mix(in oklab,var(--destructive) 10%,transparent);color:var(--destructive);font-size:12px">${msg}</div>`:''}
      <div class="field"><label>Username</label><input name="username" value="admin" required placeholder="admin"/></div>
      <div class="field"><label>Password</label><input name="password" type="password" value="shopnepal123" required placeholder="••••••••"/></div>
      <button class="btn" style="width:100%;margin-top:18px" type="submit">Sign in</button>
      <div style="margin-top:12px;font-size:11px;color:var(--muted-foreground)">JS-only admin • No build step • Same petrol theme as LMS</div>
    </form>
  </div>`;
}

function dashboardHTML(s){
  const rev = (s.totalRevenue||0).toLocaleString('en-IN');
  const lowList=(s.lowStockProducts||[]).slice(0,5).map(p=>`${p.title} (${p.stock})`).join(' • ');
  return `
  <section style="border-bottom:1px solid var(--border);padding:18px 0 20px">
    <div style="display:flex;align-items:baseline;justify-content:space-between"><h1 style="font-size:20px;font-weight:600;letter-spacing:-.02em">Needs attention</h1><span style="font-size:12px;color:var(--muted-foreground)">Updated ${new Date().toLocaleTimeString()}</span></div>
    <div style="margin-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border)">
      <a href="#/orders?filter=PENDING" style="background:var(--background);padding:12px 16px"><div style="font-size:30px;font-weight:700;letter-spacing:-.02em;color:${s.pendingOrders>0?'var(--primary)':'var(--muted-foreground)'}">${s.pendingOrders}</div><div style="font-size:12px;color:var(--muted-foreground)">Orders awaiting fulfilment</div></a>
      <a href="#/products?filter=low" style="background:var(--background);padding:12px 16px"><div style="font-size:30px;font-weight:700;color:${s.lowStock>0?'var(--status-alert)':'var(--muted-foreground)'}">${s.lowStock}</div><div style="font-size:12px;color:var(--muted-foreground)">Products low on stock (≤ reorder) ${lowList?`<br><span style="font-size:11px">${lowList}</span>`:''}</div></a>
      <a href="#/orders" style="background:var(--background);padding:12px 16px"><div style="font-size:30px;font-weight:700;color:var(--muted-foreground)">${s.unpaid}</div><div style="font-size:12px;color:var(--muted-foreground)">Unpaid orders</div></a>
    </div>
  </section>
  <section class="kpis" style="margin-top:16px">
    <div class="kpi"><div class="label">Orders</div><div class="value">${s.totalOrders}</div><div class="sub">${s.paidOrders} paid • ${s.pendingOrders} pending</div></div>
    <div class="kpi"><div class="label">Revenue (paid)</div><div class="value">Rs. ${rev}</div><div class="sub">Total settled</div></div>
    <div class="kpi"><div class="label">Products</div><div class="value">${s.totalProducts}</div><div class="sub">${s.categories} categories</div></div>
    <div class="kpi"><div class="label">Avg order</div><div class="value">Rs. ${s.avgOrder?Math.round(s.avgOrder).toLocaleString('en-IN'):'—'}</div><div class="sub">Paid orders only</div></div>
  </section>
  <section class="grid2" style="margin-top:16px">
    <div class="card"><div class="card-head"><h2>Last 7 days — orders</h2><span style="font-size:11px;color:var(--muted-foreground)">${s.trend? s.trend.map(t=>t.count).join(' • '):''}</span></div><div class="chart"><canvas id="trendChart" width="600" height="180"></canvas></div></div>
    <div class="card"><div class="card-head"><h2>Mix by category</h2></div><div style="padding:14px">${s.mix.length? s.mix.map((m,i)=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="display:flex;gap:8px;align-items:center"><span style="width:8px;height:8px;border-radius:99px;background:var(--chart-${(i%5)+1})"></span> ${m.name}</span><span style="color:var(--muted-foreground)">${m.count} (${Math.round(m.count/s.totalProducts*100)}%)</span></div>`).join(''):'<div class="empty">No data</div>'}</div></div>
  </section>
  <section style="margin-top:16px" class="card"><div class="card-head"><h2>Everything else</h2></div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0">
    <a href="#/products" style="display:flex;justify-content:space-between;padding:14px;border-bottom:1px solid var(--border);border-right:1px solid var(--border)"><span>Products</span><span style="color:var(--muted-foreground)">${s.totalProducts}</span></a>
    <a href="#/orders" style="display:flex;justify-content:space-between;padding:14px;border-bottom:1px solid var(--border)"><span>Orders</span><span style="color:var(--muted-foreground)">${s.totalOrders}</span></a>
    <a href="#/orders?filter=PAID" style="display:flex;justify-content:space-between;padding:14px;border-right:1px solid var(--border)"><span>Paid</span><span style="color:var(--muted-foreground)">${s.paidOrders}</span></a>
    <a href="#/products" style="display:flex;justify-content:space-between;padding:14px"><span>Categories</span><span style="color:var(--muted-foreground)">${s.categories}</span></a>
  </div></section>
  `;
}

function productsHTML(list){
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap">
    <h1 style="font-size:18px;font-weight:600">Products</h1>
    <div class="toolbar"><input class="input" id="prodSearch" placeholder="Search title or category"/><select class="select" id="prodFilter"><option value="">All categories</option>${[...new Set(list.map(p=>p.category))].map(c=>`<option>${c}</option>`).join('')}<option value="low">Low stock</option></select><button class="btn" id="addProdBtn">+ Add product</button></div>
  </div>
  <div class="card"><div class="table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody id="prodBody">
    ${list.map(p=>`<tr data-id="${p.id}"><td><div style="display:flex;gap:10px;align-items:center"><img src="${(p.images&&p.images[0])||''}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid var(--border)" onerror="this.style.display='none'"/><div><div style="font-weight:500">${p.title}</div><div style="font-size:11px;color:var(--muted-foreground)">${p.id} • ${p.slug}</div></div></div></td><td>${p.category}</td><td>Rs. ${Number(p.price).toLocaleString('en-IN')}</td><td>${p.stock}</td><td><span class="badge ${p.stock<=5?'badge-draft':p.stock===0?'badge-pending':'badge-live'}">${p.stock===0?'Out':p.stock<=5?'Low':'In stock'}</span></td><td style="white-space:nowrap"><button class="btn-ghost btn" style="height:32px;padding:0 10px" data-edit="${p.id}">Edit</button> <button class="btn-ghost btn" style="height:32px;padding:0 10px;color:var(--destructive)" data-del="${p.id}">Delete</button></td></tr>`).join('')}
  </tbody></table></div></div>
  `;
}

function ordersHTML(list){
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap">
    <h1 style="font-size:18px;font-weight:600">Orders</h1>
    <div class="toolbar"><input class="input" id="orderSearch" placeholder="Search order # or customer"/><select class="select" id="orderFilter"><option value="">All</option><option>PENDING</option><option>PROCESSING</option><option>COMPLETED</option><option>PAID</option></select></div>
  </div>
  <div class="card"><div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Fulfilment</th><th></th></tr></thead><tbody>
    ${list.length? list.map(o=>`<tr><td><div style="font-weight:600">#${o.orderNumber}</div><div style="font-size:11px;color:var(--muted-foreground)">${o.transactionUuid.slice(0,16)}… • ${new Date(o.createdAt).toLocaleDateString()}</div></td><td><div>${o.customer?.name||'—'}</div><div style="font-size:11px;color:var(--muted-foreground)">${o.customer?.phone||''}</div></td><td>Rs. ${Number(o.totalAmount).toLocaleString('en-IN')}</td><td><span class="badge ${o.paymentStatus==='PAID'?'badge-paid':'badge-pending'}">${o.paymentStatus}</span><div style="font-size:11px;color:var(--muted-foreground)">${o.method}</div></td><td><select data-status="${o.transactionUuid}" class="select" style="height:32px"><option ${o.status==='PENDING'?'selected':''}>PENDING</option><option ${o.status==='PROCESSING'?'selected':''}>PROCESSING</option><option ${o.status==='COMPLETED'?'selected':''}>COMPLETED</option><option ${o.status==='CANCELLED'?'selected':''}>CANCELLED</option><option ${o.status==='REFUNDED'?'selected':''}>REFUNDED</option></select></td><td><a class="btn btn-ghost" style="height:32px" href="#/orders/${o.transactionUuid}">View</a></td></tr>`).join(''):'<tr><td colspan="6"><div class="empty">No orders yet — place a test checkout to populate.</div></td></tr>'}
  </tbody></table></div></div>
  `;
}

function orderDetailHTML(o){
  return `<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px"><a class="btn btn-ghost" href="#/orders">← Back</a><h1 style="font-size:18px;font-weight:600">Order #${o.orderNumber}</h1><span class="badge ${o.paymentStatus==='PAID'?'badge-paid':'badge-pending'}">${o.paymentStatus}</span><span class="badge">${o.status}</span></div>
  <div class="grid2">
    <div class="card"><div class="card-head"><h2>Items</h2><span style="font-size:12px;color:var(--muted-foreground)">Rs. ${Number(o.totalAmount).toLocaleString('en-IN')} total</span></div><div class="table-wrap"><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${(o.lines||[]).map(l=>`<tr><td>${l.title} ${l.size?`(${l.size})`:''}</td><td>${l.qty}</td><td>Rs. ${Number(l.lineTotal).toLocaleString('en-IN')}</td></tr>`).join('')}<tr><td colspan="2" style="text-align:right;color:var(--muted-foreground)">Subtotal</td><td>Rs. ${Number(o.subtotal).toLocaleString('en-IN')}</td></tr><tr><td colspan="2" style="text-align:right;color:var(--muted-foreground)">Delivery</td><td>Rs. ${Number(o.deliveryCharge).toLocaleString('en-IN')}</td></tr><tr><td colspan="2" style="text-align:right;font-weight:600">Total</td><td style="font-weight:600">Rs. ${Number(o.totalAmount).toLocaleString('en-IN')}</td></tr></tbody></table></div></div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="card"><div class="card-head"><h2>Customer</h2></div><div style="padding:14px;font-size:13px;line-height:1.7"><div><b>${o.customer?.name||'—'}</b></div><div>${o.customer?.email||''}</div><div>${o.customer?.phone||''}</div><div>${o.customer?.address||''} ${o.customer?.city||''}</div></div></div>
      <div class="card"><div class="card-head"><h2>Fulfilment</h2></div><div style="padding:14px;display:flex;gap:8px;flex-wrap:wrap"><select id="detailStatus" class="select"><option ${o.status==='PENDING'?'selected':''}>PENDING</option><option ${o.status==='PROCESSING'?'selected':''}>PROCESSING</option><option ${o.status==='COMPLETED'?'selected':''}>COMPLETED</option><option ${o.status==='CANCELLED'?'selected':''}>CANCELLED</option><option ${o.status==='REFUNDED'?'selected':''}>REFUNDED</option></select><button class="btn" id="saveStatus">Save</button></div><div style="padding:0 14px 14px;font-size:11px;color:var(--muted-foreground)">Created ${new Date(o.createdAt).toLocaleString()} • ${o.paymentRef||'no ref'}</div></div>
    </div>
  </div>`;
}

function productFormHTML(p){
  return `<h3 style="font-weight:600;margin-bottom:12px">${p?'Edit product':'Add product'}</h3>
  <form id="prodForm" style="display:flex;flex-direction:column;gap:12px">
    <div class="form-grid">
      <div class="field"><label>Title</label><input name="title" required value="${p?.title||''}" placeholder="e.g. Mens Winter Jacket"/></div>
      <div class="field"><label>Category</label><input name="category" value="${p?.category||''}" placeholder="jacket"/></div>
      <div class="field"><label>Price (NPR)</label><input name="price" type="number" required value="${p?.price||''}"/></div>
      <div class="field"><label>Compare at</label><input name="compareAt" type="number" value="${p?.compareAt||''}"/></div>
      <div class="field"><label>Stock</label><input name="stock" type="number" value="${p?.stock||0}"/></div>
      <div class="field"><label>Rating</label><select name="rating"><option ${p?.rating===5?'selected':''}>5</option><option ${p?.rating===4?'selected':''}>4</option><option ${p?.rating===3?'selected':''}>3</option></select></div>
    </div>
    <div class="field"><label>Images (comma separated URLs)</label><input name="images" value="${(p?.images||[]).join(', ')}" placeholder="/assets/images/products/1.jpg"/></div>
    <div class="field"><label>Sizes (comma separated, leave empty if none)</label><input name="sizes" value="${(p?.sizes||[]).join(', ')}" placeholder="S, M, L, XL"/></div>
    <div class="field"><label>Description</label><textarea name="description" rows="3">${p?.description||''}</textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn btn-ghost" id="closeModal">Cancel</button><button class="btn" type="submit">${p?'Save changes':'Create product'}</button></div>
  </form>`;
}

function customersHTML(orders){
  const map={};
  orders.forEach(o=>{
    const k=o.customer?.phone||o.customer?.email||o.transactionUuid;
    if(!map[k]) map[k]={name:o.customer?.name||'—', phone:o.customer?.phone||'', email:o.customer?.email||'', orders:0, spent:0};
    map[k].orders+=1; map[k].spent+=Number(o.totalAmount||0);
  });
  const list=Object.values(map).sort((a,b)=>b.spent-a.spent);
  return `<h1 style="font-size:18px;font-weight:600;margin-bottom:12px">Customers <span style="font-weight:400;color:var(--muted-foreground);font-size:13px">(${list.length})</span></h1><div class="card"><div class="table-wrap"><table><thead><tr><th>Customer</th><th>Contact</th><th>Orders</th><th>Spent</th></tr></thead><tbody>${list.map(c=>`<tr><td>${c.name}</td><td><div style="font-size:12px">${c.phone}</div><div style="font-size:11px;color:var(--muted-foreground)">${c.email}</div></td><td>${c.orders}</td><td>Rs. ${c.spent.toLocaleString('en-IN')}</td></tr>`).join('')||'<tr><td colspan="4"><div class="empty">No customers yet</div></td></tr>'}</tbody></table></div></div>`;
}

function reportsHTML(){
  return `<h1 style="font-size:18px;font-weight:600">Sales Reports</h1>
  <div class="card" style="margin-top:12px;padding:16px">
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">
      <div class="field" style="margin-top:0"><label>From</label><input type="date" id="repFrom"></div>
      <div class="field" style="margin-top:0"><label>To</label><input type="date" id="repTo"></div>
      <button class="btn" id="repRun">Run</button>
      <button class="btn btn-ghost" id="repCsv">Export CSV</button>
    </div>
    <div id="repResult" style="margin-top:16px"></div>
  </div>`;
}
function auditHTML(logs){
  return `<h1 style="font-size:18px;font-weight:600">Audit Log <span style="font-weight:400;color:var(--muted-foreground);font-size:13px">(${logs.length})</span></h1>
  <div class="card" style="margin-top:12px"><div class="table-wrap"><table><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead><tbody>${logs.map(l=>`<tr><td style="white-space:nowrap;font-size:12px">${new Date(l.createdAt).toLocaleString()}</td><td>${l.actor}</td><td><span class="badge">${l.action}</span></td><td>${l.entity} ${l.entityId}</td><td style="font-size:12px;color:var(--muted-foreground)">${JSON.stringify(l.meta||{}).slice(0,120)}</td></tr>`).join('')||'<tr><td colspan="5"><div class="empty">No actions yet</div></td></tr>'}</tbody></table></div></div>`;
}
function settingsHTML(){
  return `<h1 style="font-size:18px;font-weight:600">Settings</h1><div class="card" style="margin-top:12px"><div style="padding:16px"><div style="font-weight:500">Store</div><div style="font-size:12px;color:var(--muted-foreground)">ShopNepal — eCommerce. Express now + NestJS+Postgres ready via docker-compose (see /backend). Data: Postgres when running NestJS, otherwise JSON fallback.</div><div style="margin-top:12px;display:flex;gap:8px"><a class="btn btn-ghost" href="/" target="_blank">View storefront</a><a class="btn btn-ghost" href="/track.html" target="_blank">Track order</a><button class="btn btn-ghost" id="clearCache">Clear local auth</button></div></div></div>`;
}
function bindReports(){
  const run=async()=>{
    const from=$('#repFrom').value, to=$('#repTo').value;
    const q=new URLSearchParams(); if(from) q.set('from',from); if(to) q.set('to',to);
    const data=await api('/api/admin/reports/sales?'+q.toString());
    $('#repResult').innerHTML=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px"><div class="kpi"><div class="label">Revenue</div><div class="value">Rs. ${Number(data.revenue).toLocaleString('en-IN')}</div></div><div class="kpi"><div class="label">Orders</div><div class="value">${data.totalOrders}</div></div><div class="kpi"><div class="label">Avg</div><div class="value">Rs. ${data.totalOrders?Math.round(data.revenue/data.totalOrders):0}</div></div></div><div style="margin-top:12px;font-size:12px">By payment: ${JSON.stringify(data.byPayment)}<br>By day: ${JSON.stringify(data.byDay)}</div>`;
  };
  $('#repRun').onclick=run;
  $('#repCsv').onclick=()=>{
    const from=$('#repFrom').value, to=$('#repTo').value;
    const q=new URLSearchParams(); if(from) q.set('from',from); if(to) q.set('to',to);
    const h=authHeaders(); const token=h['Authorization']||'';
    fetch('/api/admin/reports/sales.csv?'+q.toString(), {headers:{'Authorization': token}}).then(r=>r.blob()).then(b=>{
      const url=URL.createObjectURL(b); const a=document.createElement('a'); a.href=url; a.download='sales.csv'; a.click();
    });
  };
}

let productsCache=[], ordersCache=[];

async function render(){
  const hash = location.hash || '#/dashboard';
  if(!isAuthed() && hash!=='#/login'){
    app.innerHTML = loginPage();
    bindLogin();
    return;
  }
  if(hash==='#/login'){
    if(isAuthed()) location.hash='#/dashboard';
    else { app.innerHTML=loginPage(); bindLogin(); }
    return;
  }
  if(hash.startsWith('#/orders/')){
    const uuid = hash.replace('#/orders/','').split('?')[0];
    try{
      const o = await api('/api/admin/orders/'+encodeURIComponent(uuid));
      app.innerHTML = layout(orderDetailHTML(o),'orders');
      bindLayout();
      const btn=$('#saveStatus');
      if(btn) btn.onclick=async()=>{
        const status=$('#detailStatus').value;
        await api('/api/admin/orders/'+encodeURIComponent(uuid),{method:'PATCH', body:JSON.stringify({status})});
        location.hash='#/orders';
      };
    }catch(e){ app.innerHTML=layout(`<div class="empty">${e.message}</div>`,'orders'); bindLayout(); }
    return;
  }
  if(hash.startsWith('#/products')){
    const params=new URLSearchParams(hash.split('?')[1]||'');
    let list=[];
    try{ list = await api('/api/admin/products'); productsCache=list; }catch(e){ app.innerHTML=layout(`<div class="empty">${e.message}</div>`,'products'); bindLayout(); return;}
    app.innerHTML=layout(productsHTML(list),'products');
    bindLayout();
    bindProducts(list);
    if(params.get('create')==='1') openProductModal(null);
    return;
  }
  if(hash.startsWith('#/orders')){
    const params=new URLSearchParams(hash.split('?')[1]||'');
    const filter=params.get('filter')||'';
    let list=[];
    try{ list = await api('/api/admin/orders'); ordersCache=list; }catch(e){ app.innerHTML=layout(`<div class="empty">${e.message}</div>`,'orders'); bindLayout(); return;}
    let filtered=list;
    if(filter) filtered=list.filter(o=> o.status===filter || o.paymentStatus===filter);
    const active = filter==='PAID' ? 'payments' : 'orders';
    app.innerHTML=layout(ordersHTML(filtered), active);
    bindLayout();
    bindOrders();
    const sel=$('#orderFilter');
    if(sel){ sel.value=filter; sel.onchange=e=> location.hash='#/orders'+(e.target.value?'?filter='+e.target.value:'');}
    const search=$('#orderSearch');
    if(search) search.oninput=e=>{
      const q=e.target.value.toLowerCase();
      const rows=document.querySelectorAll('tbody tr');
      // simple reload with filter not needed, do DOM hide would need re-render; just filter via reload would be heavy; skip for now
    };
    return;
  }
  if(hash.startsWith('#/customers')){
    let list=[]; try{ list=await api('/api/admin/orders'); }catch{}
    app.innerHTML=layout(customersHTML(list),'customers');
    bindLayout(); return;
  }
  if(hash.startsWith('#/reports')){
    app.innerHTML=layout(reportsHTML(),'reports');
    bindLayout(); bindReports(); return;
  }
  if(hash.startsWith('#/audit')){
    let logs=[]; try{ logs=await api('/api/admin/audit'); }catch{}
    app.innerHTML=layout(auditHTML(logs),'audit');
    bindLayout(); return;
  }
  if(hash.startsWith('#/settings')){
    app.innerHTML=layout(settingsHTML(),'settings');
    bindLayout();
    const b=$('#clearCache'); if(b) b.onclick=()=>{ localStorage.clear(); location.hash='#/login'; location.reload(); };
    return;
  }
  // dashboard default
  let stats={totalOrders:0,paidOrders:0,pendingOrders:0,unpaid:0,totalProducts:0,lowStock:0,categories:0,totalRevenue:0,avgOrder:0,mix:[],trend:[]};
  try{ stats = await api('/api/admin/stats'); }catch(e){ console.warn(e); }
  app.innerHTML=layout(dashboardHTML(stats),'dashboard');
  bindLayout();
  drawTrend(stats.trend);
}

function bindLogin(){
  const f=$('#loginForm');
  if(!f) return;
  f.onsubmit=async e=>{
    e.preventDefault();
    const fd=new FormData(f);
    const btn=f.querySelector('button[type="submit"]');
    if(btn){ btn.disabled=true; btn.textContent='Signing in...'; }
    try{
      const r=await fetch('/api/admin/login',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:fd.get('username'), password:fd.get('password')})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(d.error||('Login failed ('+r.status+')'));
      localStorage.setItem(LS_TOKEN,d.token);
      localStorage.setItem(LS_BASIC,d.basic);
      location.hash='#/dashboard';
      render();
    }catch(err){
      const msg = err.message==='Failed to fetch' ? 'NetworkError: backend not reachable. Is `npm start` running and are you opening http://localhost:3000/admin/ (not file://)?' : err.message;
      app.innerHTML=loginPage(msg); bindLogin();
    }
  };
}

function bindLayout(){
  const sb=$('#sidebar');
  const cBtn=$('#collapseBtn'); if(cBtn) cBtn.onclick=()=>{ const v=localStorage.getItem('shopnepal_sidebar_collapsed')==='1'?'0':'1'; localStorage.setItem('shopnepal_sidebar_collapsed',v); sb.classList.toggle('collapsed'); };
  const mBtn=$('#mobileMenuBtn'); if(mBtn) mBtn.onclick=()=> sb.classList.toggle('collapsed');
  const lo=$('#logoutBtn'); if(lo) lo.onclick=e=>{ e.preventDefault(); localStorage.removeItem(LS_TOKEN); localStorage.removeItem(LS_BASIC); location.hash='#/login'; render(); };
  const th=$('#themeBtn'); if(th) th.onclick=()=> document.documentElement.classList.toggle('dark');
  const backdrop=$('#modalBackdrop'); if(backdrop) backdrop.onclick=e=>{ if(e.target===backdrop) closeModal(); };
  const gs=$('#globalSearch');
  if(gs) gs.onkeydown=e=>{ if(e.key==='Enter'){ const q=e.target.value.trim().toLowerCase(); if(!q) return; if(location.hash.startsWith('#/products')){ const f=productsCache.filter(p=>p.title.toLowerCase().includes(q)||p.category.toLowerCase().includes(q)); const body=$('#prodBody'); if(body) body.innerHTML=f.map(p=>`<tr data-id="${p.id}"><td>${p.title}</td><td>${p.category}</td><td>Rs. ${p.price}</td><td>${p.stock}</td><td><span class="badge">${p.stock<=5?'Low':'In'}</span></td><td><button class="btn btn-ghost" data-edit="${p.id}">Edit</button></td></tr>`).join(''); } else location.hash='#/products'; } };
}

function bindProducts(list){
  const s=$('#prodSearch'), f=$('#prodFilter');
  function apply(){
    const q=(s?.value||'').toLowerCase();
    const cat=f?.value||'';
    let filtered=list.filter(p=>{
      const mQ=!q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      let mC=true;
      if(cat==='low') mC=p.stock<=5;
      else if(cat) mC=p.category===cat;
      return mQ && mC;
    });
    const body=$('#prodBody');
    if(!body) return;
    body.innerHTML=filtered.map(p=>`<tr data-id="${p.id}"><td><div style="display:flex;gap:10px;align-items:center"><img src="${(p.images&&p.images[0])||''}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid var(--border)"/><div><div style="font-weight:500">${p.title}</div><div style="font-size:11px;color:var(--muted-foreground)">${p.id} • ${p.slug}</div></div></div></td><td>${p.category}</td><td>Rs. ${Number(p.price).toLocaleString('en-IN')}</td><td>${p.stock}</td><td><span class="badge ${p.stock<=5?'badge-draft':'badge-live'}">${p.stock===0?'Out':p.stock<=5?'Low':'In stock'}</span></td><td style="white-space:nowrap"><button class="btn-ghost btn" style="height:32px" data-edit="${p.id}">Edit</button> <button class="btn-ghost btn" style="height:32px;color:var(--destructive)" data-del="${p.id}">Delete</button></td></tr>`).join('') || '<tr><td colspan="6"><div class="empty">No matches</div></td></tr>';
    bindRowActions();
  }
  function bindRowActions(){
    document.querySelectorAll('[data-edit]').forEach(b=> b.onclick=()=>{ const p=list.find(x=>x.id===b.getAttribute('data-edit')); openProductModal(p); });
    document.querySelectorAll('[data-del]').forEach(b=> b.onclick=async()=>{
      if(!confirm('Delete this product?')) return;
      await api('/api/admin/products/'+b.getAttribute('data-del'),{method:'DELETE'});
      render();
    });
  }
  if(s) s.oninput=apply;
  if(f) f.onchange=apply;
  const add=$('#addProdBtn'); if(add) add.onclick=()=> openProductModal(null);
  bindRowActions();
}

function bindOrders(){
  document.querySelectorAll('[data-status]').forEach(sel=>{
    sel.onchange=async()=>{
      const uuid=sel.getAttribute('data-status');
      const status=sel.value;
      try{ await api('/api/admin/orders/'+encodeURIComponent(uuid),{method:'PATCH', body:JSON.stringify({status})}); sel.style.outline='2px solid var(--status-live)'; setTimeout(()=>sel.style.outline='',800);}catch(e){ alert(e.message); }
    };
  });
  const search=$('#orderSearch');
  if(search) search.oninput=e=>{
    const q=e.target.value.toLowerCase();
    document.querySelectorAll('tbody tr').forEach(tr=>{
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };
}

function openProductModal(p){
  const bd=$('#modalBackdrop'), box=$('#modalBox');
  if(!bd||!box) return;
  box.innerHTML=productFormHTML(p);
  bd.classList.add('open');
  const close=()=> bd.classList.remove('open');
  const cm=$('#closeModal'); if(cm) cm.onclick=close;
  const form=$('#prodForm');
  form.onsubmit=async e=>{
    e.preventDefault();
    const fd=new FormData(form);
    const payload={
      title:fd.get('title'),
      category:fd.get('category'),
      price:fd.get('price'),
      compareAt:fd.get('compareAt')||null,
      stock:fd.get('stock'),
      rating:fd.get('rating'),
      images: String(fd.get('images')||'').split(',').map(s=>s.trim()).filter(Boolean),
      sizes: String(fd.get('sizes')||'').split(',').map(s=>s.trim()).filter(Boolean),
      description:fd.get('description')
    };
    if(payload.sizes.length===0) payload.sizes=null;
    try{
      if(p) await api('/api/admin/products/'+p.id,{method:'PUT', body:JSON.stringify(payload)});
      else await api('/api/admin/products',{method:'POST', body:JSON.stringify(payload)});
      close(); render();
    }catch(err){ alert(err.message); }
  };
}
function closeModal(){ const bd=$('#modalBackdrop'); if(bd) bd.classList.remove('open'); }

function drawTrend(trend){
  const c=$('#trendChart'); if(!c||!trend||!trend.length) return;
  const ctx=c.getContext('2d');
  const W=c.width, H=c.height, pad=28;
  ctx.clearRect(0,0,W,H);
  const max=Math.max(1,...trend.map(t=>t.count));
  ctx.strokeStyle='oklch(0.885 0.005 106)'; ctx.lineWidth=1;
  for(let i=0;i<5;i++){ const y=pad+(H-pad*2)*(i/4); ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke(); }
  ctx.strokeStyle='oklch(0.333 0.051 201)'; ctx.lineWidth=2; ctx.beginPath();
  trend.forEach((t,i)=>{
    const x=pad+(W-pad*2)*(i/(trend.length-1||1));
    const y=H-pad-(H-pad*2)*(t.count/max);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }); ctx.stroke();
  ctx.fillStyle='oklch(0.333 0.051 201)';
  trend.forEach((t,i)=>{
    const x=pad+(W-pad*2)*(i/(trend.length-1||1));
    const y=H-pad-(H-pad*2)*(t.count/max);
    ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='oklch(0.53 0.008 200)'; ctx.font='10px system-ui'; ctx.fillText(t.day.slice(0,3), x-10, H-6); ctx.fillStyle='oklch(0.333 0.051 201)';
  });
}

window.addEventListener('hashchange', render);
render();

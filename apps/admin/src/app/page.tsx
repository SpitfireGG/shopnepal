// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function AdminPage(){
  const [authed,setAuthed]=useState(false);
  const [user,setUser]=useState('admin');
  const [pass,setPass]=useState('shopnepal123');
  const [stats,setStats]=useState<any>(null);
  const [orders,setOrders]=useState<any[]>([]);
  const [products,setProducts]=useState<any[]>([]);
  const [err,setErr]=useState('');

  const authHeader=()=> 'Basic ' + btoa(`${user}:${pass}`);

  const login=async()=>{
    const r=await fetch(`${API}/api/admin/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username:user,password:pass})});
    if(r.ok){ setAuthed(true); load(); } else setErr('Invalid credentials');
  };
  const load=async()=>{
    const h={ 'Authorization': authHeader() };
    const [s,o,p]=await Promise.all([
      fetch(`${API}/api/admin/stats`, { headers:h }).then(r=>r.json()).catch(()=>null),
      fetch(`${API}/api/admin/orders`, { headers:h }).then(r=>r.json()).catch(()=>[]),
      fetch(`${API}/api/admin/products`, { headers:h }).then(r=>r.json()).catch(()=>[]),
    ]);
    setStats(s); setOrders(Array.isArray(o)?o:[]); setProducts(Array.isArray(p)?p:[]);
  };
  useEffect(()=>{ if(authed) load(); },[authed]);

  if(!authed) return (
    <div className="min-h-screen grid place-items-center bg-zinc-50 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>ShopNepal Admin</CardTitle><p className="text-sm text-muted-foreground">Sign in • Nepal • NPR</p></CardHeader>
        <CardContent className="space-y-3">
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Input value={user} onChange={e=>setUser(e.target.value)} placeholder="admin"/>
          <Input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="shopnepal123"/>
          <Button onClick={login} className="w-full">Sign in</Button>
          <p className="text-xs text-muted-foreground">Uses same API as Express/Nest backend — try admin / shopnepal123</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 bg-white border-b px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-black text-white grid place-items-center text-xs font-bold">SN</div><div><div className="text-sm font-semibold">ShopNepal</div><div className="text-xs text-muted-foreground">Nepal • Management</div></div></div>
        <Button variant="outline" size="sm" onClick={()=>setAuthed(false)}>Sign out</Button>
      </header>
      <main className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">ORDERS</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalOrders ?? '-'}</div><p className="text-xs text-muted-foreground">{stats?.paidOrders} paid • {stats?.pendingOrders} pending</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">REVENUE (PAID)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">Rs. {(stats?.totalRevenue||0).toLocaleString('en-IN')}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">PRODUCTS</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalProducts ?? '-'}</div><p className="text-xs text-muted-foreground">{stats?.lowStock} low stock</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">AVG ORDER</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">Rs. {stats?.avgOrder ? Math.round(stats.avgOrder).toLocaleString('en-IN') : '-'}</div></CardContent></Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-2">
            <CardHeader><CardTitle className="text-sm">Recent Orders</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-auto">
                {orders.slice(0,6).map((o:any)=><div key={o.transactionUuid} className="flex justify-between items-center p-3 border rounded-lg"><div><div className="text-sm font-medium">#{o.orderNumber} • {o.customer?.name}</div><div className="text-xs text-muted-foreground">{o.transactionUuid.slice(0,16)} • Rs. {Number(o.totalAmount).toLocaleString('en-IN')}</div></div><Badge variant={o.paymentStatus==='PAID'?'default':'secondary'}>{o.paymentStatus}</Badge></div>)}
                {orders.length===0 && <p className="text-sm text-muted-foreground">No orders yet</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Low Stock</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(stats?.lowStockProducts||[]).slice(0,5).map((p:any)=><div key={p.id} className="flex justify-between text-sm"><span>{p.title}</span><Badge variant="destructive">{p.stock}</Badge></div>)}
                {(!stats?.lowStockProducts || stats.lowStockProducts.length===0) && <p className="text-sm text-muted-foreground">All stocked</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Products (shadcn table)</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-72 border rounded-lg">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50"><th className="text-left p-2">Product</th><th className="text-left p-2">Category</th><th className="text-left p-2">Price</th><th className="text-left p-2">Stock</th></tr></thead>
                <tbody>
                  {products.slice(0,8).map((p:any)=><tr key={p.id} className="border-b"><td className="p-2">{p.title}<div className="text-xs text-muted-foreground">{p.id}</div></td><td className="p-2">{p.category}</td><td className="p-2">Rs. {Number(p.price).toLocaleString('en-IN')}</td><td className="p-2"><Badge variant={p.stock<=5?'destructive':'secondary'}>{p.stock}</Badge></td></tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button asChild variant="outline"><a href="http://localhost:3000/admin/" target="_blank">Open Legacy Admin (3000)</a></Button>
          <Button asChild><a href="/">Back to Storefront</a></Button>
        </div>
      </main>
    </div>
  );
}

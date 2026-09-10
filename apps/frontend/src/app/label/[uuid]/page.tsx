// @ts-nocheck
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { API_URL } from '@/lib/shopnepal';
import { PrintButton } from '@/components/shopnepal/print-button';

export default async function LabelPage({ params }:{ params: Promise<{uuid:string}>}){
  const { uuid } = await params;
  let order:any=null;
  try{ const r=await fetch(`${API_URL}/api/orders/${encodeURIComponent(uuid)}`, { cache:'no-store'}); if(r.ok) order=await r.json(); }catch{}
  if(!order || order.error) return (
    <><Header/><main className="container" style={{padding:'60px 15px', textAlign:'center'}}><h1 className="title">Label unavailable</h1><p>Order not found.</p></main><Footer/></>
  );
  const c=order.customer||{};
  const tracking=`SHOPNEPAL${String(order.orderNumber).padStart(7,'0')}`;
  const weight=(order.lines.reduce((n:any,l:any)=>n+l.qty,0)*0.5).toFixed(1);
  const paid=order.paymentStatus==='PAID';
  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:480, margin:'0 auto'}}>
        <div style={{display:'flex', gap:10, marginBottom:16}}>
          <PrintButton style={{padding:'10px 18px', background:'hsl(0,0%,13%)', color:'#fff', borderRadius:6}}>Print label</PrintButton>
          <a href={`/invoice/${order.transactionUuid}`} style={{padding:'10px 18px', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}>Invoice</a>
        </div>
        <article style={{border:'2px solid hsl(0,0%,13%)', borderRadius:10, overflow:'hidden'}}>
          <header style={{display:'flex', justifyContent:'space-between', padding:16, borderBottom:'1px solid hsl(0,0%,93%)'}}>
            <img src="/assets/images/logo/logo.svg" alt="ShopNepal" width={96} height={29}/>
            <div style={{textAlign:'right'}}><strong>STANDARD</strong><br/><span style={{fontSize:12, color:'hsl(0,0%,47%)'}}>Inside valley</span></div>
          </header>
          <div style={{padding:16, textAlign:'center', borderBottom:'1px solid hsl(0,0%,93%)', fontFamily:'monospace', fontSize:20, letterSpacing:2}}>
            {tracking.split('').map((ch:string)=> <span key={ch+Math.random()} style={{borderLeft:'2px solid #000', borderRight:'2px solid #000', padding:'0 1px', marginRight:2}}>|</span>)}<br/><span style={{fontSize:12}}>{tracking}</span>
          </div>
          <section style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:0}}>
            <div style={{padding:16, borderRight:'1px solid hsl(0,0%,93%)'}}>
              <h2 style={{fontWeight:700, marginBottom:6}}>Deliver to</h2>
              <p style={{fontWeight:600}}>{c.name || '-'}</p>
              <address style={{fontStyle:'normal', lineHeight:1.6}}>{c.address}<br/>{[c.city,c.state].filter(Boolean).join(', ')}<br/>{c.postcode}<br/><strong>{c.phone}</strong></address>
            </div>
            <div style={{padding:16}}>
              <h2 style={{fontWeight:700, marginBottom:6}}>From</h2>
              <address style={{fontStyle:'normal', lineHeight:1.6}}>ShopNepal Retail Pvt. Ltd.<br/>Pulchowk, Lalitpur<br/>Bagmati 44700<br/>01-5555123</address>
            </div>
          </section>
          <section style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:1, background:'hsl(0,0%,93%)'}}>
            <div style={{background:'#fff', padding:10, textAlign:'center'}}><span style={{fontSize:11, color:'hsl(0,0%,47%)'}}>Order</span><br/><strong>#{order.orderNumber}</strong></div>
            <div style={{background:'#fff', padding:10, textAlign:'center'}}><span style={{fontSize:11}}>Items</span><br/><strong>{order.lines.reduce((n:any,l:any)=>n+l.qty,0)}</strong></div>
            <div style={{background:'#fff', padding:10, textAlign:'center'}}><span style={{fontSize:11}}>Weight</span><br/><strong>{weight} kg</strong></div>
            <div style={{background:'#fff', padding:10, textAlign:'center'}}><span style={{fontSize:11}}>Payment</span><br/><strong>{order.method}</strong></div>
            <div style={{background: paid ? 'hsla(152,51%,52%,.15)' : 'hsla(0,100%,70%,.15)', padding:10, textAlign:'center'}}><span style={{fontSize:11}}>Amount</span><br/><strong>{paid ? 'PREPAID' : `Rs. ${Number(order.totalAmount).toLocaleString('en-IN')}`}</strong></div>
          </section>
          <section style={{padding:16}}>
            <h2 style={{fontWeight:600, marginBottom:8}}>Contents</h2>
            <ul>
              {order.lines.map((l:any,i:number)=><li key={i} style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid hsl(0,0%,93%)'}}><span>{l.title}{l.size?` (${l.size})`:''}</span><strong>×{l.qty}</strong></li>)}
            </ul>
          </section>
        </article>
      </main>
      <Footer/>
    </>
  );
}

// @ts-nocheck
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { API_URL, formatNPR } from '@/lib/shopnepal';
import { PrintButton } from '@/components/shopnepal/print-button';

export default async function InvoicePage({ params }:{ params: Promise<{uuid:string}>}){
  const { uuid } = await params;
  let order:any=null;
  try{ const r=await fetch(`${API_URL}/api/orders/${encodeURIComponent(uuid)}`, { cache:'no-store'}); if(r.ok) order=await r.json(); }catch{}
  if(!order || order.error) return (
    <><Header/><main className="container" style={{padding:'60px 15px', textAlign:'center'}}><h1 className="title">Invoice unavailable</h1><p>Order not found.</p></main><Footer/></>
  );
  const c=order.customer||{};
  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:820, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:24}}>
          <div><img src="/assets/images/logo/logo.svg" alt="ShopNepal" width={120} height={36}/><p style={{fontSize:12, color:'hsl(0,0%,47%)', marginTop:6}}>ShopNepal Retail Pvt. Ltd.<br/>Pulchowk, Lalitpur, Bagmati<br/>VAT 601234567 • support@shopnepal.com.np</p></div>
          <div style={{textAlign:'right'}}><h1 style={{fontSize:24, fontWeight:700}}>Invoice</h1><p>#{order.orderNumber}</p><p style={{padding:'4px 8px', border:'1px solid', borderRadius:6, display:'inline-block', marginTop:6, background: order.paymentStatus==='PAID' ? 'hsla(152,51%,52%,.15)' : 'hsla(0,100%,70%,.15)'}}>{order.paymentStatus}</p></div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24}}>
          <div><h2 style={{fontWeight:600, marginBottom:6}}>Billed to</h2><p style={{lineHeight:1.7}}>{c.name}<br/>{c.address}<br/>{[c.city,c.state].filter(Boolean).join(', ')} {c.postcode}<br/>{c.phone}<br/>{c.email}</p></div>
          <div><h2 style={{fontWeight:600, marginBottom:6}}>Invoice details</h2><p>Invoice date: {new Date(order.createdAt).toLocaleDateString()}<br/>Method: {order.method}<br/>Ref: {order.paymentRef || '-'}<br/>Order ID: <span style={{fontFamily:'monospace', fontSize:11}}>{order.transactionUuid}</span></p></div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
          <thead><tr style={{borderBottom:'1px solid hsl(0,0%,93%)'}}><th style={{textAlign:'left', padding:'8px 6px'}}>#</th><th style={{textAlign:'left', padding:'8px 6px'}}>Item</th><th style={{textAlign:'right', padding:'8px 6px'}}>Qty</th><th style={{textAlign:'right', padding:'8px 6px'}}>Price</th><th style={{textAlign:'right', padding:'8px 6px'}}>Amount</th></tr></thead>
          <tbody>
            {order.lines.map((l:any,i:number)=><tr key={i} style={{borderBottom:'1px solid hsl(0,0%,93%)'}}><td style={{padding:'8px 6px'}}>{i+1}</td><td style={{padding:'8px 6px'}}>{l.title}<br/><small style={{fontFamily:'monospace', fontSize:11}}>{l.id}</small></td><td style={{padding:'8px 6px', textAlign:'right'}}>{l.qty}</td><td style={{padding:'8px 6px', textAlign:'right'}}>{formatNPR(l.unitPrice)}</td><td style={{padding:'8px 6px', textAlign:'right'}}>{formatNPR(l.lineTotal)}</td></tr>)}
          </tbody>
        </table>
        <div style={{display:'flex', justifyContent:'flex-end', marginTop:16}}>
          <div style={{minWidth:240}}>
            <div style={{display:'flex', justifyContent:'space-between', padding:'6px 0'}}><span>Subtotal</span><span>{formatNPR(order.subtotal)}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'6px 0'}}><span>Delivery</span><span>{formatNPR(order.deliveryCharge)}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', fontWeight:700, borderTop:'1px solid hsl(0,0%,93%)'}}><span>Total</span><span>{formatNPR(order.totalAmount)}</span></div>
          </div>
        </div>
        <div style={{textAlign:'center', marginTop:24}}>
          <PrintButton style={{padding:'10px 18px', background:'hsl(0,0%,13%)', color:'#fff', borderRadius:6}}>Download / Print</PrintButton>
        </div>
      </main>
      <Footer/>
    </>
  );
}

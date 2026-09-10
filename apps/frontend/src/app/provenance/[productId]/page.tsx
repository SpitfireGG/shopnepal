// @ts-nocheck
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { API_URL } from '@/lib/shopnepal';

export default async function ProvenancePage({ params }:{ params: Promise<{productId:string}>}){
  const { productId } = await params;
  let data:any=null;
  try{ const r=await fetch(`${API_URL}/api/spotlight/provenance/${encodeURIComponent(productId)}`, { cache:'no-store'}); if(r.ok) data=await r.json(); }catch{}
  if(!data) return (
    <><Header/><main className="container" style={{padding:'60px 15px', textAlign:'center'}}><h1 className="title">Provenance not found</h1></main><Footer/></>
  );
  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:820, margin:'0 auto'}}>
        <div style={{textAlign:'center', marginBottom:20}}>
          <h1 className="title" style={{marginBottom:6}}>Provenance Pass</h1>
          <p style={{color:'hsl(0,0%,47%)', fontSize:13}}>IPFS + Polygon • Authentic Nepali craft</p>
        </div>
        <div style={{border:'1px solid hsl(0,0%,93%)', borderRadius:12, background:'#fff', overflow:'hidden'}}>
          <div style={{padding:'16px 20px', borderBottom:'1px solid hsl(0,0%,93%)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div><div style={{fontSize:13, fontWeight:600}}>{data.productTitle}</div><div style={{fontSize:11, color:'hsl(0,0%,47%)', fontFamily:'monospace'}}>{data.productId}</div></div>
            <span style={{fontSize:11, padding:'4px 8px', border:'1px solid hsl(152,51%,52%)', borderRadius:20, color:'hsl(152,51%,52%)', background:'hsla(152,51%,52%,.08)'}}>Verified</span>
          </div>
          <div style={{padding:20, fontSize:13, lineHeight:1.7}}>
            <p><strong>Origin:</strong> {data.origin}</p>
            <p><strong>Artisan:</strong> {data.artisan}</p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
              <div style={{padding:12, border:'1px solid hsl(0,0%,93%)', borderRadius:8, background:'hsl(0,0%,98%)'}}><div style={{fontSize:10, color:'hsl(0,0%,47%)', letterSpacing:1}}>IPFS CID</div><div style={{fontFamily:'monospace', fontSize:11, wordBreak:'break-all', marginTop:4}}>{data.ipfsCid}</div></div>
              <div style={{padding:12, border:'1px solid hsl(0,0%,93%)', borderRadius:8, background:'hsl(0,0%,98%)'}}><div style={{fontSize:10, color:'hsl(0,0%,47%)', letterSpacing:1}}>Tx Hash</div><div style={{fontFamily:'monospace', fontSize:11, wordBreak:'break-all', marginTop:4}}>{data.txHash}</div></div>
            </div>
            <p style={{marginTop:12, fontSize:12, color:'hsl(0,0%,47%)'}}>Block #{data.blockNumber} • {new Date(data.timestamp).toLocaleString()} • <a href="#" style={{color:'hsl(353,100%,78%)'}}>View on Polygonscan</a></p>
            <div style={{marginTop:16, padding:20, border:'1px dashed hsl(0,0%,93%)', borderRadius:12, textAlign:'center', background:'hsl(0,0%,98%)'}}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(data.qrData)}`}
                alt="QR Code"
                width={160}
                height={160}
                style={{margin:'0 auto', borderRadius:10, border:'1px solid hsl(0,0%,93%)', background:'#fff', padding:6}}
              />
              <p style={{fontFamily:'monospace', fontSize:9, color:'hsl(0,0%,47%)', marginTop:8, wordBreak:'break-all'}}>{data.qrData}</p>
              <p style={{fontSize:11, color:'hsl(0,0%,47%)', marginTop:6}}>Scan to verify on-chain authenticity</p>
              <p style={{fontSize:10, color:'hsl(152,51%,52%)', marginTop:2}}>✓ ShopNepal Certified • Immutable • Random per product</p>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}

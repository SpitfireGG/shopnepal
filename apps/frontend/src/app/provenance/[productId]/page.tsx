// @ts-nocheck
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
        <h1 className="title">Provenance Pass <Badge>IPFS + Polygon</Badge></h1>
        <Card>
          <CardHeader><CardTitle className="text-sm">{data.productTitle} • {data.productId}</CardTitle></CardHeader>
          <CardContent className="space-y-3" style={{fontSize:13, lineHeight:1.7}}>
            <p><strong>Origin:</strong> {data.origin}</p>
            <p><strong>Artisan:</strong> {data.artisan}</p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div style={{padding:12, border:'1px solid hsl(0,0%,93%)', borderRadius:8}}><div style={{fontSize:11, color:'hsl(0,0%,47%)'}}>IPFS CID</div><div style={{fontFamily:'monospace', fontSize:11, wordBreak:'break-all'}}>{data.ipfsCid}</div></div>
              <div style={{padding:12, border:'1px solid hsl(0,0%,93%)', borderRadius:8}}><div style={{fontSize:11, color:'hsl(0,0%,47%)'}}>Tx Hash</div><div style={{fontFamily:'monospace', fontSize:11, wordBreak:'break-all'}}>{data.txHash}</div></div>
            </div>
            <p>Block #{data.blockNumber} • {new Date(data.timestamp).toLocaleString()} • <a href="#" style={{color:'hsl(353,100%,78%)'}}>View on Polygonscan</a></p>
            <div style={{padding:16, border:'1px dashed hsl(0,0%,93%)', borderRadius:10, textAlign:'center'}}>
              <div style={{width:120, height:120, margin:'0 auto', background:'hsl(0,0%,96%)', display:'grid', placeItems:'center', borderRadius:8, fontSize:11, color:'hsl(0,0%,47%)'}}>QR<br/>{data.qrData.slice(0,30)}...</div>
              <p style={{fontSize:11, color:'hsl(0,0%,47%)', marginTop:8}}>Scan to verify on-chain authenticity</p>
            </div>
            <p style={{fontSize:11, color:'hsl(0,0%,47%)'}}>Authentic Nepali handicraft • ShopNepal Certified • Immutable</p>
          </CardContent>
        </Card>
      </main>
      <Footer/>
    </>
  );
}

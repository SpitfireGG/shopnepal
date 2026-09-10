// @ts-nocheck
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { getProductBySlug, formatNPR, API_URL } from '@/lib/shopnepal';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getRelated(slug:string){
  try{ const r=await fetch(`${API_URL}/api/products`, { next:{revalidate:60}}); const all=await r.json(); return all.filter((p:any)=>p.slug!==slug).slice(0,4); }catch{ return []; }
}

export default async function ProductPage({ params }:{ params: Promise<{slug:string}>}){
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if(!product) return notFound();
  const related = await getRelated(slug);
  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px'}}>
        <div className="product-main" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:30}}>
          <div>
            <img src={product.images?.[0] || '/assets/images/products/1.jpg'} alt={product.title} style={{width:'100%', borderRadius:10, border:'1px solid hsl(0,0%,93%)'}}/>
            <div style={{display:'flex', gap:10, marginTop:10}}>
              {product.images?.slice(1,4).map((img:string,i:number)=><img key={i} src={img} alt="" style={{width:80, height:80, objectFit:'cover', borderRadius:8, border:'1px solid hsl(0,0%,93%)'}}/>)}
            </div>
          </div>
          <div>
            <p className="showcase-category">{product.category}</p>
            <h1 className="title" style={{marginBottom:10}}>{product.title}</h1>
            <div className="showcase-rating" style={{color:'hsl(29,90%,65%)', marginBottom:10}}>{Array.from({length:5}).map((_,i)=><ion-icon key={i} name={i < product.rating ? 'star' : 'star-outline'}></ion-icon>)}</div>
            <div className="price-box" style={{fontSize:'1.5rem', gap:10, marginBottom:16}}><p className="price" style={{color:'hsl(353,100%,78%)', fontWeight:700}}>{formatNPR(product.price)}</p>{product.compareAt && <del style={{color:'hsl(0,0%,47%)'}}>{formatNPR(product.compareAt)}</del>}</div>
            <p style={{color:'hsl(0,0%,47%)', lineHeight:1.6, marginBottom:16}}>{product.description || 'Premium quality product from ShopNepal. Cash on delivery available across Nepal.'}</p>
            <div style={{display:'flex', gap:10, marginBottom:16}}>
              <span style={{fontSize:12, padding:'6px 10px', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}>Stock: {product.stock}</span>
              {product.sizes && <span style={{fontSize:12, padding:'6px 10px', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}>Sizes: {product.sizes.join(', ')}</span>}
            </div>
            <button className="banner-btn" style={{padding:'12px 28px', fontSize:14}} onClick={()=>{}}>Add to Bag</button>
            <div style={{marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              <Link href={`/visual-search`} style={{padding:'10px', border:'1px solid hsl(0,0%,93%)', borderRadius:8, textAlign:'center', fontSize:12}}>📷 Visual Search</Link>
              <Link href={`/stylist?anchor=${product.id}`} style={{padding:'10px', border:'1px solid hsl(0,0%,93%)', borderRadius:8, textAlign:'center', fontSize:12}}>✨ AI Stylist</Link>
              <Link href={`/provenance/${product.id}`} style={{padding:'10px', border:'1px solid hsl(0,0%,93%)', borderRadius:8, textAlign:'center', fontSize:12}}>🔗 Provenance Pass</Link>
              <a href="#" style={{padding:'10px', border:'1px solid hsl(0,0%,93%)', borderRadius:8, textAlign:'center', fontSize:12, background:'hsl(0,0%,13%)', color:'#fff'}}>👓 AR Try-On</a>
            </div>
            <div style={{marginTop:16, padding:12, border:'1px dashed hsl(0,0%,93%)', borderRadius:8, background:'hsl(152,51%,98%)'}}>
              <p style={{fontSize:12, fontWeight:600}}>AR Try-On • model-viewer</p>
              <div style={{height:160, background:'#fff', borderRadius:8, marginTop:8, display:'grid', placeItems:'center', border:'1px solid hsl(0,0%,93%)'}}>
                <p style={{fontSize:12, color:'hsl(0,0%,47%)'}}>Camera preview — {product.title}<br/>Move to fit • Pinch to scale</p>
              </div>
              <p style={{fontSize:11, color:'hsl(0,0%,47%)', marginTop:6}}>WebAR • No app • Works on mobile</p>
            </div>
            <div style={{marginTop:24, display:'flex', gap:10}}>
              <Link href="/cart" className="btn-newsletter" style={{padding:'10px 18px', background:'hsl(0,0%,13%)', color:'#fff', borderRadius:6}}>Go to Bag</Link>
              <Link href="/" className="btn-newsletter" style={{padding:'10px 18px', background:'#fff', color:'hsl(0,0%,13%)', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}>Continue Shopping</Link>
            </div>
          </div>
        </div>

        <div className="product-showcase" style={{marginTop:40}}>
          <h2 className="title">You may also like</h2>
          <div className="product-grid">
            {related.map((p:any)=>(
              <div key={p.id} className="showcase">
                <div className="showcase-banner">
                  <img src={p.images?.[0]} alt={p.title} width={300} className="product-img default"/>
                  <div className="showcase-actions">
                    <Link href={`/product/${p.slug}`} className="btn-action"><ion-icon name="eye-outline"></ion-icon></Link>
                  </div>
                </div>
                <div className="showcase-content">
                  <Link href={`/product/${p.slug}`} className="showcase-category">{p.category}</Link>
                  <Link href={`/product/${p.slug}`}><h3 className="showcase-title">{p.title}</h3></Link>
                  <div className="price-box"><p className="price">{formatNPR(p.price)}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}

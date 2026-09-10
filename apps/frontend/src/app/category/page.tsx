// @ts-nocheck
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import Link from 'next/link';
import { API_URL } from '@/lib/shopnepal';

export default async function CategoryIndex(){
  let products:any[]=[];
  try{ const r=await fetch(`${API_URL}/api/products`, { next:{revalidate:60}}); if(r.ok) products=await r.json(); }catch{}
  const cats=[...new Set(products.map((p:any)=>p.category))].filter(Boolean).sort();
  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:1100, margin:'0 auto'}}>
        <h1 className="title">Categories</h1>
        <p style={{color:'hsl(0,0%,47%)', fontSize:13, marginTop:-10, marginBottom:16}}>{cats.length} categories • ShopNepal</p>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:16}}>
          {cats.map((c:any)=>{
            const count=products.filter((p:any)=>p.category===c).length;
            const img=products.find((p:any)=>p.category===c)?.images?.[0] || '/assets/images/products/1.jpg';
            return (
              <Link key={c} href={`/category/${encodeURIComponent(c)}`} style={{border:'1px solid hsl(0,0%,93%)', borderRadius:12, overflow:'hidden', background:'#fff', display:'block'}}>
                <img src={img} alt={c} style={{width:'100%', height:140, objectFit:'cover'}}/>
                <div style={{padding:12}}>
                  <h3 style={{fontWeight:600, textTransform:'capitalize'}}>{c}</h3>
                  <p style={{fontSize:12, color:'hsl(0,0%,47%)'}}>{count} products</p>
                  <span style={{display:'inline-block', marginTop:8, fontSize:12, padding:'6px 12px', background:'hsl(0,0%,13%)', color:'#fff', borderRadius:6}}>Shop now</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div style={{marginTop:24, padding:16, border:'1px solid hsl(0,0%,93%)', borderRadius:12, background:'hsl(0,0%,98%)'}}>
          <p style={{fontSize:12, fontWeight:600, letterSpacing:1, color:'hsl(0,0%,47%)', marginBottom:8}}>SPOTLIGHT</p>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:10}}>
            <Link href="/visual-search" style={{padding:'12px', border:'1px solid hsl(0,0%,93%)', borderRadius:10, background:'#fff', display:'flex', alignItems:'center', gap:10}}>
              <span style={{width:32, height:32, borderRadius:'50%', background:'hsl(0,0%,98%)', border:'1px solid hsl(0,0%,93%)', display:'grid', placeItems:'center'}}>📷</span>
              <span><span style={{display:'block', fontSize:12, fontWeight:600}}>Visual Search</span><span style={{fontSize:11, color:'hsl(0,0%,47%)'}}>Photo → similar</span></span>
            </Link>
            <Link href="/stylist" style={{padding:'12px', border:'1px solid hsl(0,0%,93%)', borderRadius:10, background:'#fff', display:'flex', alignItems:'center', gap:10}}>
              <span style={{width:32, height:32, borderRadius:'50%', background:'hsl(0,0%,98%)', border:'1px solid hsl(0,0%,93%)', display:'grid', placeItems:'center'}}>✨</span>
              <span><span style={{display:'block', fontSize:12, fontWeight:600}}>AI Stylist</span><span style={{fontSize:11, color:'hsl(0,0%,47%)'}}>Complete look</span></span>
            </Link>
            <Link href="/voice" style={{padding:'12px', border:'1px solid hsl(0,0%,93%)', borderRadius:10, background:'#fff', display:'flex', alignItems:'center', gap:10}}>
              <span style={{width:32, height:32, borderRadius:'50%', background:'hsl(0,0%,98%)', border:'1px solid hsl(0,0%,93%)', display:'grid', placeItems:'center'}}>🎤</span>
              <span><span style={{display:'block', fontSize:12, fontWeight:600}}>Voice</span><span style={{fontSize:11, color:'hsl(0,0%,47%)'}}>Nepali • ne-NP</span></span>
            </Link>
            <Link href="/ar" style={{padding:'12px', borderRadius:10, background:'hsl(0,0%,13%)', color:'#fff', display:'flex', alignItems:'center', gap:10}}>
              <span style={{width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.15)', display:'grid', placeItems:'center'}}>👓</span>
              <span><span style={{display:'block', fontSize:12, fontWeight:600}}>AR Try-On</span><span style={{fontSize:11, color:'rgba(255,255,255,.7)'}}>No app</span></span>
            </Link>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}

// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SearchPage(){
  const [q,setQ]=useState('');
  const [cat,setCat]=useState('');
  const [products,setProducts]=useState<any[]>([]);
  const [filtered,setFiltered]=useState<any[]>([]);
  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    setQ(p.get('q')||''); setCat(p.get('category')||'');
    fetch((process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000')+'/api/products').then(r=>r.json()).then((all:any[])=>{ setProducts(all); setFiltered(all); }).catch(()=>{});
  },[]);
  useEffect(()=>{
    const qq=q.toLowerCase();
    const list=products.filter((p:any)=>{
      const mQ=!qq || p.title.toLowerCase().includes(qq) || p.category.toLowerCase().includes(qq);
      const mC=!cat || p.category===cat;
      return mQ && mC;
    });
    setFiltered(list);
    const u=new URL(window.location.href); if(q) u.searchParams.set('q',q); else u.searchParams.delete('q'); if(cat) u.searchParams.set('category',cat); else u.searchParams.delete('category'); window.history.replaceState(null,'',u.toString());
  },[q,cat,products]);
  const cats=[...new Set(products.map((p:any)=>p.category))];
  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:1200, margin:'0 auto'}}>
        <h1 className="title">Search results</h1>
        <p style={{color:'hsl(0,0%,47%)', fontSize:13, marginTop:6}}>{filtered.length} product{filtered.length!==1?'s':''} found{q?` for "${q}"`:''}</p>
        <div style={{display:'flex', gap:10, flexWrap:'wrap', margin:'16px 0'}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search title or category" style={{flex:'1', minWidth:200, height:40, padding:'0 12px', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}/>
          <select value={cat} onChange={e=>setCat(e.target.value)} style={{height:40, padding:'0 12px', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}>
            <option value="">All categories</option>
            {cats.map((c:any)=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="product-grid">
          {filtered.map((p:any)=>(
            <div key={p.id} className="showcase">
              <div className="showcase-banner">
                <img src={p.images?.[0]} alt={p.title} width={300} className="product-img default"/>
                <div className="showcase-actions">
                  <Link href={`/product/${p.slug}`} className="btn-action"><ion-icon name="eye-outline"></ion-icon></Link>
                  <button className="btn-action"><ion-icon name="bag-add-outline"></ion-icon></button>
                </div>
              </div>
              <div className="showcase-content">
                <Link href={`/product/${p.slug}`} className="showcase-category">{p.category}</Link>
                <Link href={`/product/${p.slug}`}><h3 className="showcase-title">{p.title}</h3></Link>
                <div className="price-box"><p className="price">Rs. {Number(p.price).toLocaleString('en-IN')}</p>{p.compareAt && <del>Rs. {Number(p.compareAt).toLocaleString('en-IN')}</del>}</div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length===0 && <p style={{textAlign:'center', padding:40, color:'hsl(0,0%,47%)'}}>No products found. Try another keyword.</p>}
      </main>
      <Footer/>
    </>
  );
}

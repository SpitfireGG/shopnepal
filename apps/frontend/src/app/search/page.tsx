// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { IonIcon } from '@/components/shopnepal/ion-icon';
import { ProductActions } from '@/components/shopnepal/product-actions';
import { useSearchParams, useRouter } from 'next/navigation';

function SearchInner(){
  const searchParams = useSearchParams();
  const router = useRouter();
  const [q,setQ]=useState(searchParams.get('q')||'');
  const [cat,setCat]=useState(searchParams.get('category')||'');
  const [products,setProducts]=useState<any[]>([]);
  const [filtered,setFiltered]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    setQ(searchParams.get('q')||'');
    setCat(searchParams.get('category')||'');
  },[searchParams]);

  useEffect(()=>{
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const url = (q || cat) ? `${base}/api/products?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}` : `${base}/api/products`;
    setLoading(true);
    fetch(url).then(r=>r.json()).then((all:any[])=>{
      const qq=q.toLowerCase();
      const list = all.filter((p:any)=>{
        const mQ=!qq || p.title.toLowerCase().includes(qq) || p.category.toLowerCase().includes(qq);
        const mC=!cat || p.category===cat;
        return mQ && mC;
      });
      setProducts(all);
      setFiltered(list);
      setLoading(false);
    }).catch(()=>{ setLoading(false); });
  },[q,cat]);

  const updateURL=(newQ:string, newCat:string)=>{
    const params=new URLSearchParams();
    if(newQ) params.set('q', newQ);
    if(newCat) params.set('category', newCat);
    router.push(`/search?${params.toString()}`);
  };

  const cats=[...new Set(products.map((p:any)=>p.category))].filter(Boolean);
  return (
    <main className="container" style={{padding:'30px 15px 60px', maxWidth:1200, margin:'0 auto'}}>
        <h1 className="title">Search results</h1>
        <p style={{color:'hsl(0,0%,47%)', fontSize:13, marginTop:6}}>
          {loading ? 'Searching...' : `${filtered.length} product${filtered.length!==1?'s':''} found${q?` for "${q}"`:''}`}
        </p>
        <div style={{display:'flex', gap:10, flexWrap:'wrap', margin:'16px 0'}}>
          <input value={q} onChange={e=>{
            const v=e.target.value;
            setQ(v);
            updateURL(v, cat);
          }} placeholder="Search title or category" style={{flex:'1', minWidth:200, height:40, padding:'0 12px', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}/>
          <select value={cat} onChange={e=>{
            const v=e.target.value;
            setCat(v);
            updateURL(q, v);
          }} style={{height:40, padding:'0 12px', border:'1px solid hsl(0,0%,93%)', borderRadius:6}}>
            <option value="">All categories</option>
            {cats.map((c:any)=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {loading ? <p style={{textAlign:'center', padding:40, color:'hsl(0,0%,47%)'}}>Loading products...</p> : (
          <div className="product-grid">
            {filtered.map((p:any)=>(
              <div key={p.id} className="showcase">
                <div className="showcase-banner">
                  <img src={p.images?.[0]} alt={p.title} width={300} className="product-img default"/>
                  {p.images?.[1] && <img src={p.images[1]} alt={p.title} width={300} className="product-img hover"/>}
                  <ProductActions product={p} />
                </div>
                <div className="showcase-content">
                  <Link href={`/product/${p.slug}`} className="showcase-category">{p.category}</Link>
                  <Link href={`/product/${p.slug}`}><h3 className="showcase-title">{p.title}</h3></Link>
                  <div className="price-box"><p className="price">Rs. {Number(p.price).toLocaleString('en-IN')}</p>{p.compareAt && <del>Rs. {Number(p.compareAt).toLocaleString('en-IN')}</del>}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filtered.length===0 && <p style={{textAlign:'center', padding:40, color:'hsl(0,0%,47%)'}}>No products found. Try another keyword or category.</p>}
    </main>
  );
}

export default function SearchPage(){
  return (
    <>
      <Header/>
      <Suspense fallback={<div style={{padding:40, textAlign:'center'}}>Loading search...</div>}>
        <SearchInner/>
      </Suspense>
      <Footer/>
    </>
  );
}

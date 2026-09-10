// @ts-nocheck
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import Link from 'next/link';
import { API_URL, formatNPR } from '@/lib/shopnepal';

export default async function CategoryPage({ params }:{ params: Promise<{slug:string}>}){
  const { slug } = await params;
  const category = slug.replace(/-/g, ' ');
  const r=await fetch(`${API_URL}/api/products?category=${encodeURIComponent(category)}`, { next:{revalidate:60}}).catch(()=>null);
  let products:any[]=[];
  if(r && r.ok) products=await r.json();
  else {
    const all=await fetch(`${API_URL}/api/products`, { next:{revalidate:60}}).then(x=>x.json()).catch(()=>[]);
    products=all.filter((p:any)=> p.category.toLowerCase()===category.toLowerCase());
  }
  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:1200, margin:'0 auto'}}>
        <h1 className="title" style={{textTransform:'capitalize'}}>{category} <span style={{fontWeight:400, color:'hsl(0,0%,47%)', fontSize:14}}>({products.length})</span></h1>
        <div className="product-grid">
          {products.map((p:any)=>(
            <div key={p.id} className="showcase">
              <div className="showcase-banner">
                <img src={p.images?.[0]} alt={p.title} width={300} className="product-img default"/>
                <div className="showcase-actions">
                  <Link href={`/product/${p.slug}`} className="btn-action"><ion-icon name="eye-outline"></ion-icon></Link>
                  <button className="btn-action"><ion-icon name="bag-add-outline"></ion-icon></button>
                </div>
              </div>
              <div className="showcase-content">
                <span className="showcase-category">{p.category}</span>
                <Link href={`/product/${p.slug}`}><h3 className="showcase-title">{p.title}</h3></Link>
                <div className="price-box"><p className="price">{formatNPR(p.price)}</p>{p.compareAt && <del>{formatNPR(p.compareAt)}</del>}</div>
              </div>
            </div>
          ))}
        </div>
        {products.length===0 && <p style={{textAlign:'center', padding:40, color:'hsl(0,0%,47%)'}}>No products in this category.</p>}
      </main>
      <Footer/>
    </>
  );
}

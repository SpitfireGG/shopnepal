// @ts-nocheck
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { getProducts, formatNPR } from '@/lib/shopnepal';
import Link from 'next/link';

export default async function Home(){
  const products = await getProducts().catch(()=>[]);
  return (
    <>
      <Header/>
      <main>
        <div className="banner"><div className="container"><div className="slider-container has-scrollbar">
          <div className="slider-item"><img src="/assets/images/banner-1.jpg" alt="women's latest fashion sale" className="banner-img"/><div className="banner-content"><p className="banner-subtitle">Trending item</p><h2 className="banner-title">Women&apos;s latest fashion sale</h2><p className="banner-text">starting at Rs. 2,999</p><Link href="/search" className="banner-btn">Shop now</Link></div></div>
        </div></div></div>

        <div className="product-main"><div className="container">
          <h2 className="title">New Products</h2>
          <div className="product-grid">
            {products.slice(0,12).map((p:any)=>(
              <div key={p.id} className="showcase">
                <div className="showcase-banner">
                  <img src={p.images?.[0] || '/assets/images/products/1.jpg'} alt={p.title} width={300} className="product-img default"/>
                  {p.images?.[1] && <img src={p.images[1]} alt={p.title} width={300} className="product-img hover"/>}
                  {p.badge && <p className="showcase-badge">{p.badge}</p>}
                  <div className="showcase-actions">
                    <button className="btn-action"><ion-icon name="heart-outline"></ion-icon></button>
                    <Link href={`/product/${p.slug}`} className="btn-action"><ion-icon name="eye-outline"></ion-icon></Link>
                    <button className="btn-action"><ion-icon name="bag-add-outline"></ion-icon></button>
                  </div>
                </div>
                <div className="showcase-content">
                  <Link href={`/category/${p.category}`} className="showcase-category">{p.category}</Link>
                  <Link href={`/product/${p.slug}`}><h3 className="showcase-title">{p.title}</h3></Link>
                  <div className="showcase-rating">{Array.from({length:5}).map((_,i)=><ion-icon key={i} name={i < (p.rating||4) ? 'star' : 'star-outline'}></ion-icon>)}</div>
                  <div className="price-box"><p className="price">{formatNPR(p.price)}</p>{p.compareAt && <del>{formatNPR(p.compareAt)}</del>}</div>
                </div>
              </div>
            ))}
          </div>
        </div></div>

        <div className="service"><div className="container"><div className="service-container">
          <div className="service-item"><div className="service-icon"><ion-icon name="boat-outline"></ion-icon></div><div><p className="service-title">Worldwide Delivery</p><p className="service-desc">For Order Over Rs. 13,000</p></div></div>
          <div className="service-item"><div className="service-icon"><ion-icon name="rocket-outline"></ion-icon></div><div><p className="service-title">Next Day delivery</p><p className="service-desc">Nepal Orders Only</p></div></div>
          <div className="service-item"><div className="service-icon"><ion-icon name="call-outline"></ion-icon></div><div><p className="service-title">Best Online Support</p><p className="service-desc">Hours: 8AM - 11PM</p></div></div>
        </div></div></div>
      </main>
      <Footer/>
    </>
  );
}

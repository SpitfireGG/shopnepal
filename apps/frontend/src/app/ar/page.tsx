// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useState, useEffect, useRef } from 'react';

export default function ARPage(){
  const [product,setProduct]=useState<any>(null);
  const [scale,setScale]=useState(1);
  const [pos,setPos]=useState({x:0,y:0});
  const [camOn,setCamOn]=useState(false);
  const [error,setError]=useState('');
  const videoRef=useRef<HTMLVideoElement>(null);
  const streamRef=useRef<MediaStream | null>(null);

  useEffect(()=>{
    fetch((process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000')+'/api/products').then(r=>r.json()).then((all:any[])=> setProduct(all[Math.floor(Math.random()*Math.min(4,all.length))])).catch(()=>{});
  },[]);

  const startCam=async()=>{
    try{
      const s=await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user' }});
      streamRef.current=s;
      if(videoRef.current){ videoRef.current.srcObject=s; await videoRef.current.play(); }
      setCamOn(true); setError('');
    }catch(e:any){ setError('Camera blocked — allow camera or use Chrome on mobile. '+(e.message||'')); }
  };
  const stopCam=()=>{
    streamRef.current?.getTracks().forEach(t=>t.stop());
    streamRef.current=null;
    setCamOn(false);
  };
  useEffect(()=>()=>{ streamRef.current?.getTracks().forEach(t=>t.stop()); },[]);

  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:900, margin:'0 auto'}}>
        <div style={{textAlign:'center', marginBottom:16}}>
          <h1 className="title" style={{marginBottom:6}}>AR Try-On — Real Camera</h1>
          <p style={{color:'hsl(0,0%,47%)', fontSize:13}}>WebAR • No app • Works on mobile • ShopNepal • Try {product?.title || 'jacket/shoes'} live</p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:24}}>
          <div style={{border:'1px solid hsl(0,0%,93%)', borderRadius:12, background:'#fff', overflow:'hidden'}}>
            <div style={{height:460, background:'#000', position:'relative', overflow:'hidden'}}>
              <video ref={videoRef} autoPlay playsInline muted style={{width:'100%', height:'100%', objectFit:'cover', display: camOn ? 'block' : 'none'}}/>
              {!camOn && (
                <div style={{height:'100%', display:'grid', placeItems:'center', background:'hsl(0,0%,98%)', textAlign:'center', padding:20}}>
                  <div>
                    <div style={{fontSize:48, marginBottom:8}}>👓</div>
                    <p style={{fontWeight:600}}>{product?.title || 'AR Preview'}</p>
                    <p style={{fontSize:12, color:'hsl(0,0%,47%)', marginTop:4}}>Tap Start Camera to try on</p>
                    <button onClick={startCam} style={{marginTop:14, padding:'10px 18px', background:'hsl(0,0%,13%)', color:'#fff', borderRadius:8, fontSize:13}}>Start Camera</button>
                    {error && <p style={{fontSize:11, color:'hsl(0,100%,60%)', marginTop:8, maxWidth:260}}>{error}<br/>Tip: use http://localhost:3002/ar (frontend) — http://localhost:3000/ar is backend API, not frontend. Allow camera in browser.</p>}
                  </div>
                </div>
              )}
              {camOn && product && (
                <img
                  src={product.images?.[0] || '/assets/images/products/1.jpg'}
                  alt={product.title}
                  draggable
                  onDrag={(e)=>{ setPos({x: e.clientX - 200, y: e.clientY - 200}); }}
                  style={{
                    position:'absolute',
                    left:'50%', top:'50%',
                    transform:`translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                    width:220, height:220, objectFit:'contain',
                    filter:'drop-shadow(0 8px 16px rgba(0,0,0,.4))',
                    cursor:'grab', touchAction:'none'
                  }}
                  onTouchMove={(e:any)=>{
                    const t=e.touches[0];
                    if(t) setPos({x: t.clientX - window.innerWidth/2, y: t.clientY - 360});
                  }}
                />
              )}
              <div style={{position:'absolute', bottom:12, left:12, right:12, display:'flex', gap:8, justifyContent:'center'}}>
                <span style={{fontSize:11, padding:'6px 10px', background: camOn ? 'hsl(152,51%,52%)' : 'hsl(0,0%,13%)', color:'#fff', borderRadius:20}}>{camOn ? '● Live • Drag to move' : '● Ready'}</span>
                {camOn && <button onClick={stopCam} style={{fontSize:11, padding:'6px 10px', background:'#fff', border:'1px solid hsl(0,0%,93%)', borderRadius:20}}>Stop</button>}
              </div>
            </div>
            <div style={{padding:12, display:'flex', gap:8, alignItems:'center', borderTop:'1px solid hsl(0,0%,93%)', flexWrap:'wrap'}}>
              <span style={{fontSize:11, color:'hsl(0,0%,47%)'}}>Scale</span>
              <input type="range" min={0.6} max={1.8} step={0.1} value={scale} onChange={e=>setScale(parseFloat(e.target.value))} style={{flex:1}}/>
              <span style={{fontSize:11, minWidth:32}}>{scale.toFixed(1)}x</span>
              <button onClick={()=>{
                const canvas=document.createElement('canvas');
                const v=videoRef.current;
                if(!v) return;
                canvas.width=v.videoWidth || 640; canvas.height=v.videoHeight || 480;
                const ctx=canvas.getContext('2d'); if(!ctx) return;
                ctx.drawImage(v,0,0,canvas.width,canvas.height);
                const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download='shopnepal-ar.png'; a.click();
              }} style={{padding:'8px 14px', border:'1px solid hsl(0,0%,93%)', borderRadius:8, fontSize:12, marginLeft:8}}>Capture</button>
              <button onClick={()=>{ const p=product; if(p){ const c=JSON.parse(localStorage.getItem('shopnepal.cart.v1')||'[]'); const i=c.find((x:any)=>x.id===p.id); if(i) i.qty+=1; else c.push({id:p.id, qty:1}); localStorage.setItem('shopnepal.cart.v1', JSON.stringify(c)); window.dispatchEvent(new Event('shopnepal:cart-changed')); alert('Added to bag'); }}} style={{padding:'8px 14px', background:'hsl(0,0%,13%)', color:'#fff', borderRadius:8, fontSize:12}}>Add to Bag</button>
            </div>
            <p style={{fontSize:11, color:'hsl(0,0%,47%)', textAlign:'center', padding:'0 12px 12px'}}>Tip: <b>Frontend AR is at http://localhost:3002/ar</b> — not :3000 (backend API). Use Chrome, allow camera, HTTPS on mobile.</p>
          </div>

          <div style={{border:'1px solid hsl(0,0%,93%)', borderRadius:12, background:'#fff', padding:16, height:'fit-content'}}>
            <h3 style={{fontWeight:600, marginBottom:8}}>How it works</h3>
            <ol style={{fontSize:13, lineHeight:1.8, paddingLeft:18}}>
              <li>Tap Start Camera → allow</li>
              <li>Product overlays on you</li>
              <li>Drag to move, slider to scale</li>
              <li>Capture → photo saves</li>
            </ol>
            <div style={{marginTop:12, padding:10, background:'hsl(152,51%,98%)', borderRadius:8, border:'1px solid hsl(152,51%,92%)'}}>
              <p style={{fontSize:11, fontWeight:600}}>✓ Real WebAR • model-viewer ready • No app</p>
              <p style={{fontSize:11, color:'hsl(0,0%,47%)', marginTop:4}}>For full 3D, replace overlay with &lt;model-viewer&gt; and .glb</p>
            </div>
            <div style={{marginTop:12}}>
              <p style={{fontSize:12, fontWeight:600, marginBottom:6}}>Try other</p>
              <button onClick={()=>{ fetch((process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000')+'/api/products').then(r=>r.json()).then((all:any[])=> setProduct(all[Math.floor(Math.random()*all.length)])); }} style={{width:'100%', padding:'8px', border:'1px solid hsl(0,0%,93%)', borderRadius:8, fontSize:12}}>Random product</button>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}

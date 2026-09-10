// @ts-nocheck
'use client';
import { Header } from '@/components/shopnepal/header';
import { Footer } from '@/components/shopnepal/footer';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function VoicePage(){
  const [transcript,setTranscript]=useState('मलाई रातो ज्याकेट देखाऊ');
  const [results,setResults]=useState<any[]>([]);
  const [reply,setReply]=useState('');
  const [listening,setListening]=useState(false);

  const search=async(t:string)=>{
    const r=await fetch(`${API}/api/spotlight/voice`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ transcript: t })});
    const data=await r.json();
    setResults(data.results||[]);
    setReply(data.reply||'');
  };

  const startListening=()=>{
    const rec:any = (window as any).webkitSpeechRecognition ? new (window as any).webkitSpeechRecognition() : null;
    if(!rec){ alert('Web Speech not supported — type Nepali/English above'); return; }
    rec.lang='ne-NP';
    rec.interimResults=false;
    rec.onstart=()=>setListening(true);
    rec.onend=()=>setListening(false);
    rec.onresult=(e:any)=>{ const t=e.results[0][0].transcript; setTranscript(t); search(t); };
    rec.start();
  };

  useEffect(()=>{ search(transcript); },[]);

  return (
    <>
      <Header/>
      <main className="container" style={{padding:'30px 15px 60px', maxWidth:900, margin:'0 auto'}}>
        <h1 className="title">Nepali Voice Commerce <Badge style={{marginLeft:8}}>नेपाली + English</Badge></h1>
        <Card>
          <CardHeader><CardTitle className="text-sm">Whisper ne-NP • LLM Shop Agent</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div style={{display:'flex', gap:10}}>
              <input value={transcript} onChange={e=>setTranscript(e.target.value)} placeholder="मलाई ... देखाऊ / Show me jackets" style={{flex:1, height:44, padding:'0 12px', border:'1px solid hsl(0,0%,93%)', borderRadius:8}}/>
              <Button onClick={()=>search(transcript)}>Search</Button>
              <Button variant="outline" onClick={startListening}>{listening ? 'Listening...' : '🎤 Speak Nepali'}</Button>
            </div>
            {reply && <p style={{padding:'10px', background:'hsl(152,51%,52%,.1)', borderRadius:8, fontSize:14}}>{reply} • <span style={{color:'hsl(0,0%,47%)'}}>Try: "जुत्ता", "घडी", "track my order"</span></p>}
          </CardContent>
        </Card>

        <div className="product-grid" style={{marginTop:24}}>
          {results.map((p:any)=>(
            <div key={p.id} className="showcase">
              <div className="showcase-banner"><img src={p.images?.[0]} alt={p.title} width={300} className="product-img default"/></div>
              <div className="showcase-content">
                <span className="showcase-category">{p.category}</span>
                <Link href={`/product/${p.slug}`}><h3 className="showcase-title">{p.title}</h3></Link>
                <div className="price-box"><p className="price">Rs. {Number(p.price).toLocaleString('en-IN')}</p></div>
              </div>
            </div>
          ))}
        </div>
        {results.length===0 && <p style={{textAlign:'center', padding:40, color:'hsl(0,0%,47%)'}}>No matches — try "jacket" or "ज्याकेट"</p>}
      </main>
      <Footer/>
    </>
  );
}

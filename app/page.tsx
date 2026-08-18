'use client';

import { useState } from 'react';

const items = [
  { id: 'BFS-2X4-8', name: '2x4x8 SPF #2', ordered: 120, received: 120, location: 'Yard A-12', condition: 'Good' },
  { id: 'BFS-2X6-10', name: '2x6x10 SPF #2', ordered: 80, received: 78, location: 'Yard A-14', condition: 'Short' },
  { id: 'BFS-OSB-23', name: '23/32 T&G OSB', ordered: 50, received: 50, location: 'Yard B-02', condition: 'Good' },
  { id: 'BFS-DOOR-3068', name: '3068 RH Exterior Door', ordered: 2, received: 1, location: 'Special Order Rack 3', condition: 'Damaged' },
];

export default function Page() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(items[0]);
  const [qty, setQty] = useState(120);
  const [condition, setCondition] = useState('Good');
  const [location, setLocation] = useState('Yard A-12');
  const [barcode, setBarcode] = useState('04460012345678');
  const [completed, setCompleted] = useState(false);
  const [exceptions, setExceptions] = useState(2);

  function scan() {
    const found = items.find((x) => x.id === barcode || barcode === '04460012345678');
    if (found) {
      setSelected(found); setQty(found.received); setLocation(found.location);
      setCondition(found.condition === 'Short' ? 'Good' : found.condition); setStep(4);
    }
  }

  function complete() { setCompleted(true); setStep(8); }

  return <main className="app">
    <aside className="sidebar">
      <div className="brand"><div className="logo">B</div><div><b>Builders<br/>FirstSource</b><small>RECEIVING DOCK</small></div></div>
      {['⌂  Dashboard','▣  Start Receiving','▣  Deliveries','▤  Received Items','⚠  Exceptions','▦  Material Cross-Reference','▤  PO Numbers','▤  Vendors','▥  Reports','⚙  Settings'].map((x,i)=><div className={i===1?'nav active':'nav'} key={x}>{x}</div>)}
      <div className="user"><div>◯ Demo Receiver</div><small>Receiving Associate</small><hr/><small>● Online</small></div>
    </aside>
    <section className="content">
      <header><div><h1>🚚 Start Receiving</h1><p>Scan, verify, and record incoming materials</p></div><div className="top">● Online &nbsp;&nbsp; ◷ 8:42 AM<br/><small>August 18, 2026</small></div></header>
      <div className="steps">{['Arrived','PO Verified','Scanning','Counting','Put-Away','Exception Review','Complete'].map((s,i)=><div className={step>=i+1?'step done':'step'} key={s}><span>{i+1}</span>{s}</div>)}</div>
      <div className="cards"><Card t="DELIVERY" v="DEL-003" s="Regional Lumber Co. • BOL-1003"/><Card t="PO NUMBER" v="DEMO-PO-003" s="Expected Aug 17, 2026"/><Card t="DRIVER" v="Demo Driver 3" s="555-0103"/><Card t="ARRIVAL" v="Aug 17 • 1:10 PM" s="RECEIVING"/><Card t="RECEIVER" v="Demo Receiver" s="Receiving Associate"/></div>
      <div className="workspace">
        <div className="panel"><h2>▥ 1. SCAN MATERIAL BARCODE</h2><div className="scanner">|||| |||| ||||| |||| |||<br/><small>Scan barcode or enter manually</small></div><div className="row"><input value={barcode} onChange={e=>setBarcode(e.target.value)}/><button onClick={scan}>SCAN</button></div><div className="identified"><h3>📦 MATERIAL IDENTIFIED</h3><b>{selected.id}</b><p>{selected.name}</p><small>Material Match <strong>✓ MATCHED</strong></small></div></div>
        <div className="panel"><h2>2. ENTER INFORMATION</h2><label>Quantity Received *</label><div className="qty"><button onClick={()=>setQty(Math.max(0,qty-1))}>−</button><b>{qty}</b><button onClick={()=>setQty(qty+1)}>+</button><span>EA</span></div><label>Condition *</label><div className="conditions">{['Good','Damaged','Wrong Item'].map(c=><button className={condition===c?'selected '+c:''} onClick={()=>setCondition(c)} key={c}>{c}</button>)}</div><label>Location *</label><input value={location} onChange={e=>setLocation(e.target.value)}/><label>Notes</label><textarea placeholder="Enter receiving notes..."/><button className="next" onClick={()=>setStep(Math.min(8,step+1))}>NEXT →</button></div>
        <div className="panel side"><h2>PO SUMMARY</h2>{items.map(x=><div className="item" key={x.id} onClick={()=>{setSelected(x);setQty(x.received);setLocation(x.location);setCondition(x.condition==='Short'?'Good':x.condition)}}><b>{x.name}</b><span>{x.received}/{x.ordered} EA &nbsp; {x.condition==='Good'?'✓':'⚠'}</span></div>)}<h2>EXCEPTIONS ({exceptions})</h2><div className="exception">⚠ Shortage<br/><small>2x6x10 SPF #2 — 2 EA short</small></div><div className="exception danger">! Damage<br/><small>3068 RH Exterior Door — 1 EA damaged</small></div></div>
      </div>
      <footer><button className="cancel">✕ Cancel Receiving</button><button className="save">▣ Save as In Progress</button><button className="complete" onClick={complete}>✓ Complete Delivery</button></footer>
      {completed && <div className="toast">✓ Delivery completed successfully — receiving record saved.</div>}
    </section>
    <style jsx global>{`*{box-sizing:border-box}body{margin:0;background:#071016;color:#eef7f8;font-family:Inter,Arial,sans-serif}.app{display:flex;min-height:100vh}.sidebar{width:230px;background:#050b0f;border-right:1px solid #19303a;padding:22px 12px;position:fixed;top:0;bottom:0}.brand{display:flex;gap:12px;align-items:center;margin:4px 8px 28px}.logo{width:38px;height:38px;background:#e9f5f6;color:#0b161b;font-size:27px;font-weight:900;display:grid;place-items:center;clip-path:polygon(0 0,100% 0,100% 70%,30% 100%,0 100%)}.brand b{font-size:13px;line-height:12px}.brand small{display:block;color:#20d7df;margin-top:12px;font-size:9px;letter-spacing:1px}.nav{padding:12px 12px;margin:3px 0;border-radius:8px;color:#91a5ab;font-size:13px}.nav.active{background:#0d5963;color:white}.user{position:absolute;bottom:18px;left:18px;right:18px;border-top:1px solid #20343b;padding-top:15px;color:#dcebed;font-size:12px}.user small{color:#81949a}.content{margin-left:230px;padding:26px 30px;width:calc(100% - 230px)}header{display:flex;justify-content:space-between;align-items:start}h1{font-size:30px;margin:0 0 4px}header p{margin:0;color:#81969d}.top{background:#0b171d;border:1px solid #20333a;border-radius:10px;padding:9px 16px;text-align:right;font-size:12px;color:#32e0d5}.top small{color:#91a1a6}.steps{display:flex;justify-content:space-between;margin:26px 0;background:#0a151b;border:1px solid #1c3037;border-radius:12px;padding:15px 25px}.step{display:flex;flex-direction:column;align-items:center;gap:7px;color:#667a81;font-size:11px}.step span{border:2px solid #405057;width:28px;height:28px;border-radius:50%;display:grid;place-items:center}.step.done{color:#28d9df}.step.done span{border-color:#28d9df;background:#123a40;color:white}.cards{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.cards>div{background:#0b161c;border:1px solid #1d323a;border-radius:9px;padding:14px}.cards small{color:#23d5db}.ct{font-size:9px;color:#71868d;letter-spacing:1px}.cv{font-weight:800;margin:7px 0 3px}.cs{font-size:10px;color:#83959a}.workspace{display:grid;grid-template-columns:1fr 1.25fr .9fr;gap:12px;margin-top:14px}.panel{background:#0b161c;border:1px solid #1d323a;border-radius:10px;padding:18px}.panel h2{font-size:13px;color:#28dce1;margin:0 0 18px;letter-spacing:.5px}.scanner{height:120px;border:1px solid #30474f;border-radius:8px;display:grid;place-items:center;text-align:center;font-size:20px;letter-spacing:3px;color:#23d9df;background:#081115}.scanner small{display:block;color:#7f9298;font-size:11px;letter-spacing:0}.row{display:flex;gap:7px;margin-top:10px}.row input,.panel input,.panel textarea{width:100%;background:#050b0f;color:white;border:1px solid #30434a;border-radius:7px;padding:12px}.row button,.next{background:#16bfc7;color:#031014;border:0;border-radius:7px;font-weight:800;padding:0 15px}.identified{border:1px solid #21464c;margin-top:15px;padding:14px;border-radius:8px}.identified h3{font-size:11px;color:#27dce2}.identified p{margin:8px 0}.identified strong{color:#26df9b;margin-left:5px}.panel label{display:block;font-size:10px;color:#95a7ac;margin:14px 0 6px}.qty{display:flex}.qty>*{height:42px;border:1px solid #30434a;background:#050b0f;color:white;display:grid;place-items:center;padding:0 18px}.qty b{min-width:90px}.conditions{display:flex;gap:6px}.conditions button{flex:1;padding:10px;border:1px solid #344950;border-radius:6px;background:#081015;color:#91a3a8}.conditions .selected{border-color:#25db9f;color:#25db9f}.conditions .selected.Damaged{color:#f4bf39;border-color:#f4bf39}.conditions .selected.Wrong{color:#ff6969;border-color:#ff6969}.panel textarea{min-height:70px;resize:vertical}.next{width:100%;height:40px;margin-top:12px}.item{padding:10px;border-bottom:1px solid #1b2c33;font-size:11px;cursor:pointer}.item span{display:block;color:#91a2a8;margin-top:4px}.exception{background:#251e0c;border:1px solid #6b5823;border-radius:7px;padding:10px;margin-top:7px;color:#f2c84b;font-size:11px}.exception.danger{background:#291416;border-color:#673136;color:#ff7373}.exception small{color:#c1a9a9}.side{overflow:auto}.side h2{margin-top:0}.side h2:nth-of-type(2){margin-top:20px}footer{display:flex;justify-content:space-between;margin-top:14px;padding:14px;border:1px solid #1d323a;background:#080f13;border-radius:10px}.cancel,.save,.complete{padding:12px 20px;border-radius:7px;background:transparent;color:#d5e1e3;border:1px solid #43545a}.save{border-color:#16cbd2;color:#16cbd2}.complete{background:#13c4ca;color:#031014;border-color:#13c4ca;font-weight:800}.toast{position:fixed;right:30px;bottom:30px;background:#123c2d;border:1px solid #26df9b;color:#6affc3;padding:15px 20px;border-radius:8px}@media(max-width:1000px){.sidebar{display:none}.content{margin:0;width:100%;padding:15px}.cards,.workspace{grid-template-columns:1fr}.steps{overflow:auto;gap:20px}.step{min-width:90px}}`}</style>
  </main>
}

function Card({t,v,s}:{t:string,v:string,s:string}){return <div><div className="ct">{t}</div><div className="cv">{v}</div><div className="cs">{s}</div></div>}

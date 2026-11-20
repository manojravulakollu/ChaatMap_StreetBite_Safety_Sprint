import React,{useEffect,useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import {MapContainer,TileLayer,Marker,Popup,useMap} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";

const API="/api";
const icon=L.divIcon({className:"food-pin",html:"🍲",iconSize:[34,34],iconAnchor:[17,30]});
const scoreLabel=s=>s>=4.5?"Excellent":s>=3.8?"Good":s>=3?"Moderate":"Needs attention";
function App(){
 const [vendors,setVendors]=useState([]),[selected,setSelected]=useState(null),[detail,setDetail]=useState(null);
 const [area,setArea]=useState(""),[dish,setDish]=useState(""),[query,setQuery]=useState("");
 const [showReview,setShowReview]=useState(false),[toast,setToast]=useState("");
 const [form,setForm]=useState({water:4,coveredFood:4,gloves:4,surroundings:4,comment:""});
 const [report,setReport]=useState(false);
 async function load(){const p=new URLSearchParams();if(area)p.set("area",area);if(dish)p.set("dish",dish);if(query)p.set("q",query);
  const r=await fetch(`${API}/vendors?${p}`);setVendors(await r.json());}
 useEffect(()=>{load().catch(()=>setToast("Could not connect to API. Start the backend server."));},[area,dish,query]);
 async function openVendor(v){setSelected(v);const r=await fetch(`${API}/vendors/${v.id}`);setDetail(await r.json());}
 async function submitReview(e){e.preventDefault();const r=await fetch(`${API}/vendors/${selected.id}/reviews`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
  const d=await r.json();if(!r.ok){setToast(d.error||"Review failed");return;}
  setToast("Thanks! Your structured review was added.");setShowReview(false);setForm({water:4,coveredFood:4,gloves:4,surroundings:4,comment:""});await load();await openVendor(selected);}
 async function submitReport(e){e.preventDefault();const reason=e.target.reason.value;const r=await fetch(`${API}/vendors/${selected.id}/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reason})});const d=await r.json();setToast(d.message||d.error);setReport(false);}
 const areas=[...new Set(vendors.map(v=>v.area))].sort();
 const best=[...vendors].sort((a,b)=>b.hygieneScore-a.hygieneScore).slice(0,3);
 const avg=selected?.hygieneScore?.toFixed(1);
 return <div className="app">
  <header className="topbar"><div className="brandmark">🥘</div><div><div className="brand">ChaatMap</div><div className="tagline">STREETBITE SAFETY SPRINT</div></div>
   <div className="top-right"><span className="live-dot"></span> Community-powered food discovery</div></header>
  <section className="hero"><div><div className="eyebrow">HYDERABAD STREET FOOD GUIDE · DEMO DATA</div><h1>Find your next<br/><em>street-food favourite.</em></h1>
   <p>Explore local carts, discover signature bites and compare structured community hygiene observations.</p>
   <div className="searchbar"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search pani puri, dosa, vendor or area..."/></div>
  </div><div className="hero-stamp"><span>LOCAL</span><b>FOOD</b><span>GOOD VIBES ONLY</span></div></section>
  <main className="layout">
   <section className="left-col">
    <div className="section-head"><div><div className="eyebrow">DISCOVER YOUR NEIGHBOURHOOD</div><h2>Street carts near you</h2></div><span className="count">{vendors.length} demo stalls</span></div>
    <div className="filters"><select value={area} onChange={e=>setArea(e.target.value)}><option value="">All areas</option>{["Sindhi Colony","Madhapur","Ameerpet","Himayatnagar","Charminar","Kukatpally","Dilsukhnagar","Secunderabad","Gachibowli","Begumpet"].map(x=><option key={x}>{x}</option>)}</select>
     <select value={dish} onChange={e=>setDish(e.target.value)}><option value="">All delicacies</option>{["Pani Puri","Dosa","Chaat","Pav Bhaji","Mirchi Bajji","Momos","Bhel Puri","Idli"].map(x=><option key={x}>{x}</option>)}</select>
     <button className="clear" onClick={()=>{setArea("");setDish("");setQuery("")}}>Reset</button></div>
    <div className="map-wrap"><MapContainer center={[17.421,78.45]} zoom={11} scrollWheelZoom={true} className="map">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      {vendors.map(v=><Marker key={v.id} position={[v.lat,v.lng]} icon={icon} eventHandlers={{click:()=>openVendor(v)}}><Popup><b>{v.name}</b><br/>{v.area}<br/>Hygiene index: {v.hygieneScore}/5</Popup></Marker>)}
     </MapContainer><div className="map-legend"><span>🍲 Demo vendor location</span><span>★ Hygiene index</span></div></div>
    <div className="section-head list-head"><div><div className="eyebrow">CURATED LOCAL PICKS</div><h2>Popular street bites</h2></div><span className="count">Sorted by hygiene score</span></div>
    <div className="vendor-grid">{vendors.sort((a,b)=>b.hygieneScore-a.hygieneScore).map(v=><article className={`vendor-card ${selected?.id===v.id?"active":""}`} key={v.id} onClick={()=>openVendor(v)}>
      <div className="food-thumb">{v.specialties[0]==="Dosa"?"🥞":v.specialties[0]==="Momos"?"🥟":v.specialties[0]==="Pani Puri"?"🥣":"🌮"}<span className="area-chip">{v.area}</span></div>
      <div className="vendor-content"><div className="vendor-title">{v.name}</div><div className="muted">{v.specialties.join(" · ")}</div>
       <div className="card-bottom"><b>₹{v.priceMin}–{v.priceMax}</b><span className="score">★ {v.hygieneScore.toFixed(1)} <small>/ 5</small></span></div>
       <div className="muted tiny">{v.timings} · {v.reviewsCount} reviews</div></div></article>)}</div>
    {vendors.length===0&&<div className="empty">No demo stalls match those filters. Try another area or delicacy.</div>}
   </section>
   <aside className="right-col">
    <div className="panel detail-panel"><div className="panel-kicker">VENDOR SNAPSHOT</div>
     {detail?<><div className="detail-emoji">🍽️</div><h2>{detail.name}</h2><p className="muted">📍 {detail.landmark}</p><div className="score-big"><strong>{detail.hygieneScore.toFixed(1)}</strong><span>/ 5<br/>HYGIENE INDEX</span></div><div className="status-line">{scoreLabel(detail.hygieneScore)} · {detail.reviewsCount} community reviews</div>
      <div className="badges"><span>✓ Community scored</span><span className="unverified">FSSAI: not verified</span></div>
      <div className="factor-list">{[["Water / RO",detail.water],["Covered food",detail.coveredFood],["Gloves / headgear",detail.gloves],["Surroundings",detail.surroundings]].map(([n,s])=><div className="factor" key={n}><div><span>{n}</span><b>{Number(s).toFixed(1)}/5</b></div><div className="bar"><i style={{width:`${s/5*100}%`}}/></div></div>)}</div>
      <div className="dish-line"><b>Signature bites</b><p>{detail.specialties.join(" · ")}</p><b>Typical price</b><p>₹{detail.priceMin} – ₹{detail.priceMax}</p><b>Usual hours</b><p>{detail.timings}</p></div>
      <button className="primary full" onClick={()=>setShowReview(true)}>＋ Add hygiene review</button><button className="secondary full" onClick={()=>setReport(true)}>⚑ Report a hygiene concern</button>
      <div className="reviews"><b>Recent structured reviews</b>{(detail.reviews||[]).slice(-3).reverse().map(r=><div className="review" key={r.id}><span>{r.createdAt}</span><b>{((r.water*.4)+(r.coveredFood*.25)+(r.gloves*.2)+(r.surroundings*.15)).toFixed(1)} ★</b><p>{r.comment||"Ratings submitted without a written comment."}</p></div>)}</div>
     </>:<div className="choose"><div>👆</div><h3>Pick a cart on the map</h3><p>Choose a vendor card or map pin to see its hygiene breakdown, signature dishes and community observations.</p></div>}
    </div>
    <div className="panel trail-panel"><div className="panel-kicker">WEEKEND FOOD WALK</div><h3>Top hygiene food trails</h3><div className="trail"><span>🥣</span><div><b>Sindhi Colony Chaat Walk</b><p>1.4 km · 3 demo stops</p></div><span className="arrow">→</span></div><div className="trail"><span>🥟</span><div><b>Madhapur Evening Bites</b><p>1.8 km · 3 demo stops</p></div><span className="arrow">→</span></div><p className="fine">Illustrative routes only. Confirm vendor locations and operating status before walking.</p></div>
    <div className="panel top-panel"><div className="panel-kicker">COMMUNITY SPOTLIGHT</div><h3>Highest demo scores</h3>{best.map((v,i)=><div className="top-row" key={v.id}><span className="rank">0{i+1}</span><div><b>{v.name}</b><small>{v.area}</small></div><strong>★ {v.hygieneScore.toFixed(1)}</strong></div>)}</div>
   </aside>
  </main>
  <footer><b>ChaatMap</b><span>Eat curious. Observe carefully. Share responsibly.</span><small>Demo prototype · Vendor details and ratings are synthetic, not verified food-safety claims.</small></footer>
  {showReview&&<div className="overlay"><form className="modal" onSubmit={submitReview}><button type="button" className="x" onClick={()=>setShowReview(false)}>×</button><div className="eyebrow">COMMUNITY CONTRIBUTION</div><h2>Rate what you observed</h2><p className="muted">Use your own recent observation. Score each factor from 1 (poor) to 5 (excellent).</p>
    {[["water","Clean / RO water"],["coveredFood","Covered food display"],["gloves","Gloves / headgear"],["surroundings","Surroundings cleanliness"]].map(([k,label])=><label className="rating-field" key={k}><span>{label}</span><select value={form[k]} onChange={e=>setForm({...form,[k]:Number(e.target.value)})}>{[1,2,3,4,5].map(n=><option value={n} key={n}>{n} / 5</option>)}</select></label>)}
    <label className="comment-field">Optional note <textarea maxLength="240" value={form.comment} onChange={e=>setForm({...form,comment:e.target.value})} placeholder="Describe only what you observed. Avoid personal details."/></label>
    <p className="formula">Your score contribution uses: 40% water · 25% covered food · 20% gloves · 15% surroundings.</p><button className="primary full">Submit structured review</button></form></div>}
  {report&&<div className="overlay"><form className="modal" onSubmit={submitReport}><button type="button" className="x" onClick={()=>setReport(false)}>×</button><div className="eyebrow">COMMUNITY SAFETY REPORT</div><h2>What did you observe?</h2><select name="reason" className="report-select"><option>Water safety concern</option><option>Food left uncovered</option><option>No hand hygiene observed</option><option>Surroundings need cleaning</option><option>Other</option></select><p className="fine">Reports are unverified observations and do not prove a violation.</p><button className="primary full">Send report</button></form></div>}
  {toast&&<div className="toast" onClick={()=>setToast("")}>{toast} <b>×</b></div>}
 </div>
}
createRoot(document.getElementById("root")).render(<App/>);

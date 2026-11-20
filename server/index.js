const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const app = express();
const PORT = process.env.PORT || 4000;
const DATA = path.join(__dirname, "..", "data");
app.use(cors()); app.use(express.json({limit:"3mb"}));

function read(name){ return JSON.parse(fs.readFileSync(path.join(DATA,name),"utf8")); }
function write(name,data){ fs.writeFileSync(path.join(DATA,name),JSON.stringify(data,null,2)); }
function score(v){
  return +(0.40*v.water + 0.25*v.coveredFood + 0.20*v.gloves + 0.15*v.surroundings).toFixed(2);
}
function refreshVendor(v,reviews){
  const rs=reviews.filter(r=>r.vendorId===v.id);
  if(!rs.length) return {...v, hygieneScore:score(v), reviewsCount:0, breakdown:{water:v.water,coveredFood:v.coveredFood,gloves:v.gloves,surroundings:v.surroundings}};
  const avg=k=>rs.reduce((s,r)=>s+Number(r[k]),0)/rs.length;
  const b={water:+avg("water").toFixed(2),coveredFood:+avg("coveredFood").toFixed(2),gloves:+avg("gloves").toFixed(2),surroundings:+avg("surroundings").toFixed(2)};
  return {...v,...b,breakdown:b,hygieneScore:score(b),reviewsCount:rs.length};
}
app.get("/api/health",(req,res)=>res.json({ok:true,service:"ChaatMap API"}));
app.get("/api/vendors",(req,res)=>{
  const vendors=read("vendors.json"), reviews=read("reviews.json");
  let out=vendors.map(v=>refreshVendor(v,reviews));
  const area=(req.query.area||"").toLowerCase(), dish=(req.query.dish||"").toLowerCase(), q=(req.query.q||"").toLowerCase();
  if(area) out=out.filter(v=>v.area.toLowerCase()===area);
  if(dish) out=out.filter(v=>v.specialties.some(x=>x.toLowerCase().includes(dish)));
  if(q) out=out.filter(v=>[v.name,v.area,v.landmark,...v.specialties].join(" ").toLowerCase().includes(q));
  if(req.query.sort==="score") out.sort((a,b)=>b.hygieneScore-a.hygieneScore);
  res.json(out);
});
app.get("/api/vendors/:id",(req,res)=>{
  const v=read("vendors.json").find(x=>x.id===req.params.id);
  if(!v) return res.status(404).json({error:"Vendor not found"});
  const reviews=read("reviews.json").filter(r=>r.vendorId===v.id);
  res.json({...refreshVendor(v,read("reviews.json")),reviews});
});
app.post("/api/vendors/:id/reviews",(req,res)=>{
  const vendors=read("vendors.json"), v=vendors.find(x=>x.id===req.params.id);
  if(!v) return res.status(404).json({error:"Vendor not found"});
  const keys=["water","coveredFood","gloves","surroundings"];
  for(const k of keys){const n=Number(req.body[k]); if(!Number.isInteger(n)||n<1||n>5) return res.status(400).json({error:`${k} must be a whole number from 1 to 5`});}
  const comment=String(req.body.comment||"").replace(/[<>]/g,"").trim().slice(0,240);
  const review={id:randomUUID(),vendorId:v.id,createdAt:new Date().toISOString().slice(0,10),
    water:Number(req.body.water),coveredFood:Number(req.body.coveredFood),gloves:Number(req.body.gloves),
    surroundings:Number(req.body.surroundings),comment,photoUrl:""};
  const reviews=read("reviews.json"); reviews.push(review); write("reviews.json",reviews);
  res.status(201).json({review,vendor:refreshVendor(v,reviews)});
});
app.post("/api/vendors/:id/report",(req,res)=>{
  const vendors=read("vendors.json");
  if(!vendors.some(v=>v.id===req.params.id)) return res.status(404).json({error:"Vendor not found"});
  const reports=fs.existsSync(path.join(DATA,"reports.json"))?read("reports.json"):[];
  const reasons=["Water safety concern","Food left uncovered","No hand hygiene observed","Surroundings need cleaning","Other"];
  if(!reasons.includes(req.body.reason)) return res.status(400).json({error:"Choose a valid report reason"});
  reports.push({id:randomUUID(),vendorId:req.params.id,reason:req.body.reason,createdAt:new Date().toISOString()});
  write("reports.json",reports); res.status(201).json({message:"Report recorded for review. Please do not treat an unverified report as a proven violation."});
});
app.get("/api/trails",(req,res)=>res.json([
 {id:"t1",name:"Sindhi Colony Chaat Walk",area:"Sindhi Colony",vendorIds:["v01","v11","v03"],distanceKm:1.4,description:"Illustrative short walk linking listed demo vendors. Check current locations before setting out."},
 {id:"t2",name:"Madhapur Evening Bites",area:"Madhapur",vendorIds:["v02","v12","v16"],distanceKm:1.8,description:"Illustrative evening food walk. Verify each cart is operating before visiting."}
]));
app.listen(PORT,()=>console.log(`ChaatMap API running at http://localhost:${PORT}`));

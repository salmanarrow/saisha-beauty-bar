import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

const CONFIG = {
  ownerPassword:   "owner-password-here",
  managerPassword: "manager-password-here",
  ownerName:       "Saisha",
  managerNameKey:  "sbb_manager_name",
};

const T = {
  white:"#FFFFFF", cream:"#FAF8F4", parchment:"#F5F3EF",
  sand:"#E8E8E8", charcoal:"#111111", gray:"#666666",
  grayLight:"#999999", grayXLight:"#E0E0E0",
  gold:"#C9A84C", goldLight:"#F5EDD5",
  green:"#1A5C38", greenLight:"#E0F0E8",
  red:"#8B2020", redLight:"#F5E0E0",
};

const fmt  = (n) => `Rs. ${Number(n).toLocaleString("en-PK",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtN = (n) => Number(n).toLocaleString("en-PK",{minimumFractionDigits:2,maximumFractionDigits:2});
const todayStr    = () => new Date().toISOString().split("T")[0];
const isPast      = (d) => d < todayStr();
const isFuture    = (d) => d > todayStr();
const isToday2    = (d) => d === todayStr();
const fmtDate     = (d) => { if(!d)return""; const[y,m,day]=d.split("-"); return new Date(y,m-1,day).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}); };
const monthStr    = (d) => { if(!d)return""; const[y,m]=d.split("-"); return new Date(y,m-1,1).toLocaleDateString("en-US",{month:"short",year:"numeric"}); };
const weekStart   = (d) => { const dt=new Date(d+"T12:00:00"); dt.setDate(dt.getDate()-dt.getDay()); return dt.toISOString().split("T")[0]; };

function parseServices(raw) {
  if(!raw) return [];
  try { const p=typeof raw==="string"?JSON.parse(raw):raw; return Array.isArray(p)?p:[]; }
  catch { return []; }
}

const BASE_SERVICES = [
  {id:1,  name:"Party Makeup by Saisha",            price:15000,duration:90,  category:"Makeup"},
  {id:2,  name:"Senior Artist Party Makeup",        price:10000,duration:75,  category:"Makeup"},
  {id:3,  name:"Engagement Look by Saisha",         price:30000,duration:120, category:"Makeup"},
  {id:4,  name:"Senior Artist Engagement Makeup",   price:20000,duration:100, category:"Makeup"},
  {id:5,  name:"Nikkah Glam by Saisha",             price:40000,duration:150, category:"Makeup"},
  {id:6,  name:"Senior Artist Nikkah Makeup",       price:25000,duration:120, category:"Makeup"},
  {id:7,  name:"Mehendi Look by Saisha",            price:40000,duration:150, category:"Makeup"},
  {id:8,  name:"Senior Artist Mehendi Makeup",      price:25000,duration:120, category:"Makeup"},
  {id:9,  name:"Baraat Look by Saisha",             price:55000,duration:180, category:"Makeup"},
  {id:10, name:"Senior Artist Baraat Makeup",       price:40000,duration:150, category:"Makeup"},
  {id:11, name:"Walima Look by Saisha",             price:50000,duration:150, category:"Makeup"},
  {id:12, name:"Senior Artist Walima Makeup",       price:30000,duration:120, category:"Makeup"},
  {id:13, name:"Saisha Beauty Signature Haircut",   price:6500, duration:60,  category:"Hair"},
  {id:14, name:"Senior Artist Haircut",             price:4500, duration:45,  category:"Hair"},
  {id:15, name:"Blunt/A-Line/Inverted/Long Bob",    price:7000, duration:60,  category:"Hair"},
  {id:16, name:"Straight Trimming/Fringes/Bangs",   price:2000, duration:30,  category:"Hair"},
  {id:17, name:"Hairwash & Blowout",                price:3500, duration:45,  category:"Hair"},
  {id:18, name:"Straight Blowout",                  price:2000, duration:30,  category:"Hair"},
  {id:19, name:"Bouncy Blowout (medium length)",    price:2500, duration:40,  category:"Hair"},
  {id:20, name:"Dyson Blowout",                     price:3500, duration:45,  category:"Hair"},
  {id:21, name:"Hairwash",                          price:1000, duration:20,  category:"Hair"},
  {id:22, name:"Hair Straightening (starts from)",  price:2500, duration:45,  category:"Hair"},
  {id:23, name:"Curls with Flat Iron (starts from)",price:3500, duration:45,  category:"Hair"},
  {id:24, name:"Beach Waves (starts from)",         price:4000, duration:45,  category:"Hair"},
  {id:25, name:"Updo (starts from)",                price:3500, duration:60,  category:"Hair"},
  {id:26, name:"Girls Under 10 — Haircut & Blowout",price:2500, duration:40,  category:"Hair"},
  {id:27, name:"Girls Under 10 — Hairstyling",      price:2500, duration:30,  category:"Hair"},
  {id:28, name:"Girls Under 10 — Trimming/Bangs",   price:1500, duration:20,  category:"Hair"},
  {id:29, name:"Roots (up to 1.5 inches)",          price:5000, duration:60,  category:"Hair Dye"},
  {id:30, name:"One Color Dye (above shoulder)",    price:9000, duration:90,  category:"Hair Dye"},
  {id:31, name:"Highlights/Lowlights without base", price:18000,duration:120, category:"Hair Dye"},
  {id:32, name:"Highlights/Lowlights with base",    price:20000,duration:150, category:"Hair Dye"},
  {id:33, name:"Balayage/Ombré (starts from)",      price:20000,duration:150, category:"Hair Dye"},
  {id:34, name:"Balayage/Ombré with base color",    price:25000,duration:180, category:"Hair Dye"},
  {id:35, name:"Gloss/Toner (starts from)",         price:8000, duration:60,  category:"Hair Dye"},
  {id:36, name:"Fashion Color (per foil)",          price:3500, duration:30,  category:"Hair Dye"},
  {id:37, name:"Brazilian Protein Treatment",       price:4500, duration:60,  category:"Hair Treatment"},
  {id:38, name:"L'Oréal Absolut Repair Treatment",  price:6500, duration:75,  category:"Hair Treatment"},
  {id:39, name:"Vitamino Color Protection",         price:6500, duration:75,  category:"Hair Treatment"},
  {id:40, name:"Shea Moisture Treatment + Styling", price:6500, duration:75,  category:"Hair Treatment"},
  {id:41, name:"RP Treatment (starts from)",        price:7500, duration:90,  category:"Hair Treatment"},
  {id:42, name:"Nanoplasty Treatment (starts from)",price:20000,duration:180, category:"Hair Treatment"},
  {id:43, name:"Keratin Treatment (starts from)",   price:18000,duration:180, category:"Hair Treatment"},
  {id:44, name:"Xtenso Treatment (starts from)",    price:20000,duration:180, category:"Hair Treatment"},
  {id:45, name:"Botox Treatment (starts from)",     price:15000,duration:150, category:"Hair Treatment"},
  {id:46, name:"Facial Cleansing",                  price:2000, duration:30,  category:"Facial"},
  {id:47, name:"Deep Cleansing & Brightening",      price:4500, duration:60,  category:"Facial"},
  {id:48, name:"Hi-Lift Radiant Facial",            price:5500, duration:60,  category:"Facial"},
  {id:49, name:"Janssen Whitening Facial",          price:7500, duration:75,  category:"Facial"},
  {id:50, name:"Hydrafacial",                       price:8500, duration:75,  category:"Facial"},
  {id:51, name:"Korean Glass Skin",                 price:9000, duration:90,  category:"Facial"},
  {id:52, name:"Mary Cohr Paris Radiance Facial",   price:13000,duration:90,  category:"Facial"},
  {id:53, name:"Polisher for Face & Neck",          price:2000, duration:30,  category:"Facial"},
  {id:54, name:"One Color Gel Nails",               price:4000, duration:60,  category:"Gel Nails"},
  {id:55, name:"French Tips (Gel)",                 price:5500, duration:60,  category:"Gel Nails"},
  {id:56, name:"Ombré (Gel)",                       price:5500, duration:60,  category:"Gel Nails"},
  {id:57, name:"Chrome (Gel)",                      price:5000, duration:60,  category:"Gel Nails"},
  {id:58, name:"Magnet Cat Eye (Gel)",              price:6000, duration:60,  category:"Gel Nails"},
  {id:59, name:"Gel Color Application",             price:2000, duration:30,  category:"Gel Nails"},
  {id:60, name:"Nail Removal (Gel)",                price:2000, duration:30,  category:"Gel Nails"},
  {id:61, name:"One Color Acrylics",                price:7000, duration:75,  category:"Acrylics"},
  {id:62, name:"French Tips (Acrylic)",             price:8000, duration:75,  category:"Acrylics"},
  {id:63, name:"Magnet Cat Eye (Acrylic)",          price:8500, duration:75,  category:"Acrylics"},
  {id:64, name:"French Tips with Glitter",          price:9500, duration:90,  category:"Acrylics"},
  {id:65, name:"French with Glitter Liner",         price:9500, duration:90,  category:"Acrylics"},
  {id:66, name:"Ombré (Acrylic)",                   price:8000, duration:75,  category:"Acrylics"},
  {id:67, name:"Sugar Nails",                       price:8000, duration:75,  category:"Acrylics"},
  {id:68, name:"Chrome (Acrylic)",                  price:8000, duration:75,  category:"Acrylics"},
  {id:69, name:"Nail Removal (Acrylic)",            price:2500, duration:30,  category:"Acrylics"},
  {id:70, name:"Express Manicure",                  price:1500, duration:30,  category:"Mani & Pedi"},
  {id:71, name:"Express Pedicure",                  price:2000, duration:30,  category:"Mani & Pedi"},
  {id:72, name:"Deluxe Spa Manicure",               price:2000, duration:45,  category:"Mani & Pedi"},
  {id:73, name:"Deluxe Spa Pedicure",               price:3000, duration:45,  category:"Mani & Pedi"},
  {id:74, name:"Luxury Moisture Surge Manicure",    price:3000, duration:60,  category:"Mani & Pedi"},
  {id:75, name:"Luxury Moisture Surge Pedicure",    price:4000, duration:60,  category:"Mani & Pedi"},
  {id:76, name:"Paraffin Wax for Hands",            price:800,  duration:20,  category:"Mani & Pedi"},
  {id:77, name:"Paraffin Wax for Feet",             price:1200, duration:20,  category:"Mani & Pedi"},
  {id:78, name:"French Nails",                      price:1500, duration:30,  category:"Mani & Pedi"},
  {id:79, name:"Full Arms Wax",                     price:2500, duration:30,  category:"Waxing & Threading"},
  {id:80, name:"Half Arms Wax",                     price:1500, duration:20,  category:"Waxing & Threading"},
  {id:81, name:"Full Legs Wax",                     price:3500, duration:45,  category:"Waxing & Threading"},
  {id:82, name:"Half Legs Wax",                     price:2000, duration:30,  category:"Waxing & Threading"},
  {id:83, name:"Under Arms Wax",                    price:900,  duration:15,  category:"Waxing & Threading"},
  {id:84, name:"Full Body Wax",                     price:8000, duration:90,  category:"Waxing & Threading"},
  {id:85, name:"Full Face Wax",                     price:2000, duration:30,  category:"Waxing & Threading"},
  {id:86, name:"Full Face Wax with Soothing Mask",  price:2500, duration:45,  category:"Waxing & Threading"},
  {id:87, name:"Eyebrow Wax",                       price:500,  duration:15,  category:"Waxing & Threading"},
  {id:88, name:"Threading Eyebrow",                 price:300,  duration:10,  category:"Waxing & Threading"},
  {id:89, name:"Upper Lip Threading",               price:200,  duration:10,  category:"Waxing & Threading"},
  {id:90, name:"Threading Full Face with Mask",     price:1800, duration:30,  category:"Waxing & Threading"},
  {id:91, name:"Head Massage & Wash (20 min)",      price:3500, duration:20,  category:"Massage"},
  {id:92, name:"Hand Massage (20 min)",             price:1500, duration:20,  category:"Massage"},
  {id:93, name:"Foot Massage (20 min)",             price:2000, duration:20,  category:"Massage"},
  {id:94, name:"Shoulder & Neck Massage (20 min)",  price:2500, duration:20,  category:"Massage"},
  {id:95, name:"Head, Shoulder & Back (20 min)",    price:3000, duration:20,  category:"Massage"},
  {id:96, name:"Full Body Massage with Hot Oil",    price:9000, duration:60,  category:"Massage"},
  {id:97, name:"Body Scrub",                        price:10000,duration:60,  category:"Body"},
  {id:98, name:"Body Glow",                         price:18000,duration:90,  category:"Body"},
  {id:99, name:"Body Polisher",                     price:8000, duration:60,  category:"Body"},
];

const TIME_SLOTS = [
  "9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM",
  "3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM",
];

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#FFFFFF}
  input,select,textarea{font-family:'Jost',sans-serif!important}
  ::placeholder{color:#BBBBBB}
  input[type=date]::-webkit-calendar-picker-indicator{opacity:.4;cursor:pointer}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#E0E0E0;border-radius:2px}
  .gold-btn:hover{background:#2a2a2a!important}
  .outline-btn:hover{border-color:#999!important}
  .svc-card:hover{border-color:#C9A84C!important;transform:translateY(-1px)}
  .time-btn:hover:not(:disabled){background:#F5F3EF!important;border-color:#C9A84C!important}
  .role-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.12)!important}
  .suggestion-item:hover{background:#F5F3EF!important}
  .inv-card:hover{border-color:#C9A84C!important}
  @media print{@page{size:80mm auto;margin:0}body{margin:0;padding:0}.no-print{display:none!important}}
`;

/* ════════════════ ROOT ════════════════ */
export default function App() {
  const [role,        setRole]        = useState(null);
  const [managerName, setManagerName] = useState(() => localStorage.getItem(CONFIG.managerNameKey) || "Neelum");
  const [clients,      setClients]      = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices,     setInvoices]     = useState([]);
  const [deals,        setDeals]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState(null);

  const SERVICES = useMemo(() => [
    ...BASE_SERVICES,
    ...deals
      .filter(d => d.active && (!d.expiry || d.expiry >= todayStr()))
      .map(d => ({
        id:          "deal_" + d.id,
        name:        d.name,
        price:       d.price,
        duration:    0,
        category:    "Deals ✦",
        isDeal:      true,
        description: d.description,
      })),
  ], [deals]);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };
  const updateManagerName = (n) => { setManagerName(n); localStorage.setItem(CONFIG.managerNameKey, n); };

  useEffect(() => { if(role && role !== "booking") loadAll(); }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAll = async () => {
    setLoading(true);
    try {
      const [{data:c},{data:a},{data:i},{data:d}] = await Promise.all([
        supabase.from("clients").select("*").order("created_at",{ascending:false}),
        supabase.from("appointments").select("*").order("date").order("time"),
        supabase.from("invoices").select("*").order("created_at",{ascending:false}),
        supabase.from("deals").select("*").order("created_at",{ascending:false}),
      ]);
      setClients(c||[]); setAppointments(a||[]); setInvoices(i||[]); setDeals(d||[]);
    } catch { showToast("Could not load data","error"); }
    setLoading(false);
  };

  const saveClient = async (client) => {
    if(client.id){
      const {error}=await supabase.from("clients").update({name:client.name,phone:client.phone,email:client.email,notes:client.notes}).eq("id",client.id);
      if(error){showToast("Failed to update client","error");return false;}
      setClients(prev=>prev.map(c=>c.id===client.id?{...c,...client}:c));
      showToast("Client updated ✦"); return true;
    } else {
      const {data,error}=await supabase.from("clients").insert({name:client.name,phone:client.phone||"",email:client.email||"",notes:client.notes||""}).select().single();
      if(error){showToast("Failed to add client","error");return false;}
      setClients(prev=>[data,...prev]); showToast("Client added ✦"); return true;
    }
  };

  const deleteClient = async (id) => {
    const {error} = await supabase.from("clients").delete().eq("id", id);
    if(error){showToast("Failed to delete client","error");return;}
    setClients(prev=>prev.filter(c=>c.id!==id));
    showToast("Client removed");
  };

  const saveAppt = async (appt) => {
    const servicesJson = JSON.stringify(appt.services || []);
    const totalDuration = (appt.services||[]).reduce((s,sv)=>s+(sv.duration||0),0);
    const payload = {
      client_id:       appt.clientId,
      services:        servicesJson,
      date:            appt.date,
      time:            appt.time,
      status:          "confirmed",
      invoiced:        appt.invoiced||false,
      source:          appt.source||"manual",
      special_request: appt.specialRequest||null,
      total_duration:  totalDuration,
    };
    if(appt.id){
      const {error}=await supabase.from("appointments").update(payload).eq("id",appt.id);
      if(error){showToast("Failed to update","error");return false;}
      setAppointments(prev=>prev.map(a=>a.id===appt.id?{...a,...payload}:a));
      showToast("Appointment updated ✦"); return true;
    } else {
      const {data,error}=await supabase.from("appointments").insert(payload).select().single();
      if(error){showToast("Failed to save","error");return false;}
      setAppointments(prev=>[...prev,data]); showToast("Appointment booked ✦"); return true;
    }
  };

  const deleteAppt = async (id) => {
    const {error}=await supabase.from("appointments").delete().eq("id",id);
    if(error){showToast("Failed to remove","error");return;}
    setAppointments(prev=>prev.filter(a=>a.id!==id)); showToast("Appointment removed");
  };

  const handleBookingSubmit = async (booking) => {
    let client=clients.find(c=>c.email?.toLowerCase()===booking.email?.toLowerCase());
    let clientId;
    if(!client){
      const {data,error}=await supabase.from("clients").insert({name:booking.name,phone:booking.phone,email:booking.email,notes:""}).select().single();
      if(error){showToast("Booking failed","error");return false;}
      setClients(prev=>[data,...prev]); clientId=data.id;
    } else { clientId=client.id; }
    const servicesJson=JSON.stringify(booking.services||[]);
    const totalDuration=(booking.services||[]).reduce((s,sv)=>s+(sv.duration||0),0);
    const {data,error}=await supabase.from("appointments").insert({client_id:clientId,services:servicesJson,date:booking.date,time:booking.time,status:"confirmed",invoiced:false,source:"online",special_request:booking.notes||null,total_duration:totalDuration}).select().single();
    if(error){showToast("Booking failed","error");return false;}
    setAppointments(prev=>[...prev,data]); return true;
  };

  const getNextNum = async () => {
    const {count}=await supabase.from("invoices").select("*",{count:"exact",head:true});
    return "SBB-" + String((count||0)+1).padStart(3,"0");
  };

  const createInvoiceFromAppt = async (appt) => {
    const services=parseServices(appt.services);
    const client=clients.find(c=>c.id===appt.client_id);
    const total=services.reduce((s,sv)=>s+Number(sv.price||0),0);
    const invoiceNum=await getNextNum();
    const {data,error}=await supabase.from("invoices").insert({invoice_num:invoiceNum,appointment_id:appt.id,client_id:appt.client_id,client_name:client?.name||"Guest",services_json:JSON.stringify(services),amount:total,date:appt.date,status:"unpaid",discount:0}).select().single();
    if(error){showToast("Failed to create invoice","error");return null;}
    await supabase.from("appointments").update({invoiced:true}).eq("id",appt.id);
    setAppointments(prev=>prev.map(a=>a.id===appt.id?{...a,invoiced:true}:a));
    setInvoices(prev=>[data,...prev]); showToast("Invoice created ✦");
    return data;
  };

  const createQuickInvoice = async ({clientId,clientName,services,date,discount,note}) => {
    const subtotal=services.reduce((s,sv)=>s+Number(sv.price||0),0);
    const discAmt=discount?Math.min(Number(discount),subtotal):0;
    const total=subtotal-discAmt;
    const invoiceNum=await getNextNum();
    const svcsToStore=note?[{...services[0],name:note},...services.slice(1)]:services;
    const {data,error}=await supabase.from("invoices").insert({invoice_num:invoiceNum,client_id:clientId||null,client_name:clientName||"Guest",services_json:JSON.stringify(svcsToStore),amount:total,date:date||todayStr(),status:"unpaid",discount:discAmt}).select().single();
    if(error){showToast("Failed to create invoice","error");return false;}
    setInvoices(prev=>[data,...prev]); showToast("Invoice created ✦"); return data;
  };

  const markPaid = async (id) => {
    const {error}=await supabase.from("invoices").update({status:"paid"}).eq("id",id);
    if(error){showToast("Failed","error");return;}
    setInvoices(prev=>prev.map(i=>i.id===id?{...i,status:"paid"}:i)); showToast("Payment recorded ✦");
  };

  const deleteInvoice = async (id) => {
    const {error}=await supabase.from("invoices").delete().eq("id",id);
    if(error){showToast("Failed","error");return;}
    setInvoices(prev=>prev.filter(i=>i.id!==id)); showToast("Invoice deleted");
  };

  const saveDeal = async (deal) => {
    if(deal.id){
      const {error}=await supabase.from("deals").update({name:deal.name,price:deal.price,description:deal.description,expiry:deal.expiry||null,active:deal.active}).eq("id",deal.id);
      if(error){showToast("Failed","error");return false;}
      setDeals(prev=>prev.map(d=>d.id===deal.id?{...d,...deal}:d)); showToast("Deal updated ✦"); return true;
    } else {
      const {data,error}=await supabase.from("deals").insert({name:deal.name,price:deal.price,description:deal.description||"",expiry:deal.expiry||null,active:true}).select().single();
      if(error){showToast("Failed","error");return false;}
      setDeals(prev=>[data,...prev]); showToast("Deal added ✦"); return true;
    }
  };
  const deleteDeal = async (id) => { await supabase.from("deals").delete().eq("id",id); setDeals(prev=>prev.filter(d=>d.id!==id)); showToast("Deal removed"); };
  const toggleDeal = async (id,active) => { await supabase.from("deals").update({active}).eq("id",id); setDeals(prev=>prev.map(d=>d.id===id?{...d,active}:d)); };

  const printInvoice = (inv) => {
    const services=parseServices(inv.services_json);
    const w=window.open("","_blank");
    const rows=services.map(s=>"<tr><td>"+s.name+"</td><td class='r'>"+fmtN(s.price)+"</td></tr>").join("");
    const discRow=Number(inv.discount)>0?"<tr><td>Discount</td><td class='r'>- "+fmtN(inv.discount)+"</td></tr>":"";
    w.document.write("<!DOCTYPE html><html><head><title>"+inv.invoice_num+"</title>"
      +"<link href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Jost:wght@300;400&display=swap' rel='stylesheet'>"
      +"<style>"
      +"*{margin:0;padding:0;box-sizing:border-box}"
      +"@page{size:80mm auto;margin:0}"
      +"body{font-family:'Jost',sans-serif;background:#fff;color:#111;width:80mm;padding:6mm 4mm}"
      +".center{text-align:center}"
      +".logo{width:16mm;height:auto;display:block;margin:0 auto 3mm}"
      +".brand{font-family:'Cormorant Garamond',serif;font-size:13pt;letter-spacing:3px;text-transform:uppercase}"
      +".tagline{font-size:7pt;color:#888;font-style:italic;font-family:'Cormorant Garamond',serif;margin-bottom:3mm}"
      +".divider{border:none;border-top:1px dashed #CCC;margin:3mm 0}"
      +".row{display:flex;justify-content:space-between;font-size:8pt;margin-bottom:1.5mm}"
      +".lbl{color:#888;font-size:7pt;letter-spacing:1px;text-transform:uppercase}"
      +"table{width:100%;border-collapse:collapse;font-size:8.5pt}"
      +"td{padding:1.5mm 0;vertical-align:top}"
      +"td.r{text-align:right;white-space:nowrap}"
      +".sep{border-top:1px dashed #CCC;padding-top:1.5mm}"
      +".total td{font-size:10pt;font-weight:500;font-family:'Cormorant Garamond',serif}"
      +".badge{display:inline-block;padding:1mm 3mm;border-radius:8px;font-size:7pt;letter-spacing:1px;text-transform:uppercase;"
      +"background:"+(inv.status==="paid"?"#E0F0E8":"#F5F3EF")+";color:"+(inv.status==="paid"?"#1A5C38":"#555")+"}"
      +".footer{text-align:center;font-size:7pt;color:#BBB;margin-top:4mm;font-family:'Cormorant Garamond',serif;font-style:italic}"
      +"</style></head><body>"
      +"<div class='center'>"
      +"<img src='/saisha-monogram-transparent.png' class='logo' alt='SB'/>"
      +"<div class='brand'>Saisha Beauty</div>"
      +"<div class='tagline'>Time to Glow</div>"
      +"</div>"
      +"<hr class='divider'/>"
      +"<div class='row'><span class='lbl'>Invoice</span><span>"+inv.invoice_num+"</span></div>"
      +"<div class='row'><span class='lbl'>Date</span><span>"+fmtDate(inv.date)+"</span></div>"
      +"<div class='row'><span class='lbl'>Status</span><span class='badge'>"+inv.status+"</span></div>"
      +"<hr class='divider'/>"
      +"<div class='row'><span class='lbl'>Client</span><span>"+inv.client_name+"</span></div>"
      +"<hr class='divider'/>"
      +"<div class='lbl' style='margin-bottom:2mm'>Services</div>"
      +"<table><tbody>"
      +rows
      +discRow
      +"<tr class='total sep'><td>Total</td><td class='r'>Rs. "+fmtN(inv.amount)+"</td></tr>"
      +"</tbody></table>"
      +"<hr class='divider'/>"
      +"<div class='footer'>Thank you for choosing Saisha Beauty ✦</div>"
      +"</body></html>");
    w.document.close(); w.print();
  };

  if(loading) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.white,gap:16}}>
      <div style={{width:36,height:36,borderRadius:"50%",border:"2px solid #E8E8E8",borderTopColor:T.gold,animation:"spin .8s linear infinite"}}/>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,letterSpacing:3,color:T.charcoal}}>Saisha Beauty</div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:T.grayLight,fontStyle:"italic"}}>Time to Glow</div>
    </div>
  );

  const shared={clients,setClients,appointments,invoices,deals,SERVICES,saveClient,deleteClient,saveAppt,deleteAppt,createInvoiceFromAppt,createQuickInvoice,markPaid,deleteInvoice,printInvoice,saveDeal,deleteDeal,toggleDeal,showToast};

  return (
    <BrowserRouter>
      <div style={{fontFamily:"'Jost',sans-serif",minHeight:"100vh",background:T.white}}>
        <style>{css}</style>
        {toast&&(
          <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:toast.type==="error"?T.red:T.charcoal,color:T.white,padding:"13px 20px",borderRadius:8,fontSize:13,letterSpacing:".5px",boxShadow:"0 8px 32px rgba(0,0,0,.15)",animation:"fadeUp .3s ease",display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:toast.type==="error"?"#ffaaaa":T.gold}}>✦</span>{toast.msg}
          </div>
        )}
        <Routes>
          {/* / — Landing page */}
          <Route path="/" element={<LandingPage/>}/>

          {/* /book — Public client booking page */}
          <Route path="/book" element={
            <BookingPage
              onSubmit={handleBookingSubmit}
              appointments={appointments}
              SERVICES={SERVICES}
              showToast={showToast}
            />
          }/>

          {/* /manager — Manager login + dashboard */}
          <Route path="/manager" element={
            role==="manager"
              ? <AppShell role="manager" userName={managerName} onLogout={()=>setRole(null)}>
                  <Dashboard {...shared} role="manager" managerName={managerName} onUpdateManagerName={updateManagerName}/>
                </AppShell>
              : <StaffLogin mode="manager" onLogin={setRole}/>
          }/>

          {/* /owner — Owner login + dashboard */}
          <Route path="/owner" element={
            role==="owner"
              ? <AppShell role="owner" userName={CONFIG.ownerName} onLogout={()=>setRole(null)}>
                  <Dashboard {...shared} role="owner" managerName={managerName} onUpdateManagerName={updateManagerName}/>
                </AppShell>
              : <StaffLogin mode="owner" onLogin={setRole}/>
          }/>

          {/* catch-all */}
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
}


/* ════════════════ STAFF LOGIN ════════════════ */
function StaffLogin({onLogin, mode}) {
  const navigate  = useNavigate();
  const [pw,setPw]   = useState("");
  const [err,setErr] = useState(false);

  const tryLogin=()=>{
    const correct=mode==="owner"?CONFIG.ownerPassword:CONFIG.managerPassword;
    if(pw===correct){onLogin(mode);}else{setErr(true);setPw("");}
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.white,padding:24}}>
      <div style={{width:"100%",maxWidth:380,animation:"fadeUp .4s ease"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:52,height:52,margin:"0 auto 12px"}}><img src="/saisha-monogram-transparent.png" alt="SB" style={{width:"100%"}}/></div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,letterSpacing:3,color:T.charcoal,textTransform:"capitalize"}}>{mode} Login</div>
        </div>
        <div style={{background:T.white,border:"1px solid #E8E8E8",borderRadius:14,padding:26}}>
          <FieldLabel>Password</FieldLabel>
          <input type="password" value={pw}
            onChange={e=>{setPw(e.target.value);setErr(false);}}
            onKeyDown={e=>e.key==="Enter"&&tryLogin()}
            placeholder="••••••••"
            style={{...S.input,marginBottom:err?8:14,borderColor:err?T.red:"#E8E8E8"}}
            autoFocus/>
          {err&&<div style={{fontSize:12,color:T.red,marginBottom:12}}>Incorrect password. Try again.</div>}
          <button className="gold-btn" onClick={tryLogin} style={{...S.goldBtn,width:"100%"}}>Enter</button>
        </div>
        <button onClick={()=>navigate("/")} style={{width:"100%",background:"transparent",border:"1px solid #E8E8E8",color:T.charcoal,padding:"11px",cursor:"pointer",fontSize:13,marginTop:8,fontFamily:"'Jost',sans-serif",borderRadius:8}}>← Back to Home</button>
      </div>
    </div>
  );
}
/* ════════════════ LANDING PAGE ════════════════ */
function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.white,padding:24}}>
      <div style={{width:"100%",maxWidth:400,animation:"fadeUp .5s ease"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{width:80,height:80,margin:"0 auto 18px"}}><img src="/saisha-monogram-transparent.png" alt="SB" style={{width:"100%"}}/></div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,letterSpacing:4,color:T.charcoal,marginBottom:4}}>Saisha Beauty</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:T.gold,fontStyle:"italic",letterSpacing:2}}>Time to Glow</div>
        </div>
        <div style={{display:"grid",gap:12}}>
          {[
            {key:"booking",icon:"✦",label:"Book an Appointment",sub:"For clients — book your next visit",dark:false},
            {key:"manager",icon:"◈",label:"Manager",sub:"Staff access — bookings & clients",dark:false},
            {key:"owner",  icon:"👑",label:"Owner",sub:"Full access — finances, deals & settings",dark:true},
          ].map(({key,icon,label,sub,dark})=>(
            <button key={key} className="role-btn"
              onClick={()=>key==="booking"?navigate("/book"):navigate("/"+key)}
              style={{background:dark?T.charcoal:T.white,border:dark?"none":"1px solid #E8E8E8",borderRadius:14,padding:"18px 22px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,transition:"all .25s",boxShadow:"0 2px 12px rgba(0,0,0,.05)"}}>
              <div style={{width:42,height:42,borderRadius:"50%",background:dark?"rgba(201,168,76,.15)":T.parchment,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
              <div>
                <div style={{fontSize:15,color:dark?T.white:T.charcoal,marginBottom:2}}>{label}</div>
                <div style={{fontSize:12,color:dark?"#888":T.grayLight}}>{sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


function SignOutButton({onLogout,role}) {
  const navigate = useNavigate();
  return (
    <button onClick={()=>{onLogout();navigate("/"+role);}} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"#888",padding:"5px 13px",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'Jost',sans-serif"}}>Sign Out</button>
  );
}
/* ════════════════ APP SHELL ════════════════ */
function AppShell({role,userName,children,onLogout}) {
  const [screen,setScreen]=useState("dashboard");
  const child=React.cloneElement(children,{screen,setScreen});
  return (
    <div style={{minHeight:"100vh"}}>
      <div style={{background:T.charcoal,padding:"10px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src="/saisha-monogram-transparent.png" alt="SB" style={{width:22,height:"auto",filter:"invert(1) sepia(1) saturate(.4) brightness(1.8)"}}/>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:T.white,letterSpacing:2}}>Welcome, <span style={{color:T.gold}}>{userName}</span></span>
        </div>
        <SignOutButton onLogout={onLogout} role={role}/>
      </div>
      <div style={{position:"fixed",bottom:22,left:"50%",transform:"translateX(-50%)",zIndex:100,background:T.charcoal,borderRadius:40,padding:"5px",display:"flex",gap:4,boxShadow:"0 8px 32px rgba(0,0,0,.25)"}}>
        {[["dashboard","Dashboard"],["invoices","New Invoice"]].map(([s,label])=>(
          <button key={s} onClick={()=>setScreen(s)} style={{background:screen===s?T.gold:"transparent",border:"none",color:screen===s?T.charcoal:"#888",padding:"10px 20px",borderRadius:32,cursor:"pointer",fontSize:13,letterSpacing:".5px",fontFamily:"'Jost',sans-serif",fontWeight:screen===s?"500":"300",transition:"all .25s"}}>{label}</button>
        ))}
      </div>
      {child}
    </div>
  );
}


function BackButton() {
  const navigate = useNavigate();
  return (
    <button onClick={()=>navigate("/")} style={{position:"absolute",top:14,left:14,background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.25)",color:"#fff",cursor:"pointer",fontSize:12,fontFamily:"'Jost',sans-serif",padding:"7px 14px",borderRadius:20,letterSpacing:".5px"}}>← Back</button>
  );
}
/* ════════════════ BOOKING PAGE ════════════════ */
function BookingPage({onSubmit,appointments,SERVICES,showToast}) {
  const [step,setStep]=useState(1);
  const [selected,setSelected]=useState([]);
  const [form,setForm]=useState({date:"",time:"",name:"",phone:"",email:"",notes:""});
  const [done,setDone]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [search,setSearch]=useState("");
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const takenSlots=appointments.filter(a=>a.date===form.date).map(a=>a.time);
  const categories=useMemo(()=>[...new Set(SERVICES.map(s=>s.category))],[SERVICES]);
  const filteredSvcs=useMemo(()=>{
    const q=search.toLowerCase();
    return categories.reduce((acc,cat)=>{
      const svcs=SERVICES.filter(s=>s.category===cat&&s.name.toLowerCase().includes(q));
      if(svcs.length) acc[cat]=svcs;
      return acc;
    },{});
  },[SERVICES,categories,search]);
  const totalPrice=selected.reduce((s,sv)=>s+sv.price,0);
  const totalDuration=selected.reduce((s,sv)=>s+(sv.duration||0),0);
  const toggleService=(svc)=>setSelected(prev=>prev.find(s=>s.id===svc.id)?prev.filter(s=>s.id!==svc.id):[...prev,svc]);

  const submit=async()=>{
    if(!form.name||!form.email||!form.phone){showToast("Please fill in all required fields","error");return;}
    setSubmitting(true); const ok=await onSubmit({...form,services:selected}); setSubmitting(false);
    if(ok) setDone(true);
  };

  if(done) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:400,animation:"fadeUp .5s ease"}}>
        <div style={{width:68,height:68,margin:"0 auto 18px"}}><img src="/saisha-monogram-transparent.png" alt="SB" style={{width:"100%"}}/></div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,letterSpacing:2,color:T.charcoal,marginBottom:6}}>You're All Set!</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:T.gold,fontStyle:"italic",marginBottom:18}}>Time to Glow ✦</div>
        <div style={{background:T.parchment,border:"1px solid #E8E8E8",borderRadius:12,padding:18,marginBottom:18,textAlign:"left"}}>
          <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:T.grayLight,marginBottom:8}}>Your Booking</div>
          {selected.map(s=><div key={s.id} style={{fontSize:13,color:T.charcoal,marginBottom:3}}>· {s.name} — {fmt(s.price)}</div>)}
          <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid #E8E8E8",display:"flex",justifyContent:"space-between",fontSize:14}}>
            <span style={{color:T.grayLight}}>Total</span>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:T.charcoal}}>{fmt(totalPrice)}</span>
          </div>
          <div style={{fontSize:12,color:T.grayLight,marginTop:5}}>{fmtDate(form.date)} at {form.time}</div>
        </div>
        <p style={{color:T.grayLight,fontSize:13,marginBottom:22}}>See you soon, {form.name.split(" ")[0]}! 💛</p>
        <button className="gold-btn" onClick={()=>{setSelected([]);setForm({date:"",time:"",name:"",phone:"",email:"",notes:""});setStep(1);setDone(false);}} style={S.goldBtn}>Book Again</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",paddingBottom:80}}>
      <div style={{background:T.charcoal,padding:"46px 24px 34px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 60px,rgba(201,168,76,.03) 60px,rgba(201,168,76,.03) 120px)"}}/>
        <BackButton/>
        <div style={{position:"relative"}}>
          <div style={{width:48,height:48,margin:"0 auto 12px"}}><img src="/saisha-monogram-transparent.png" alt="SB" style={{width:"100%",filter:"invert(1) sepia(1) saturate(.5) brightness(1.8)"}}/></div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:10,letterSpacing:6,color:T.grayLight,textTransform:"uppercase",marginBottom:6}}>Welcome to</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:38,letterSpacing:4,color:T.white,lineHeight:1,marginBottom:6}}>Saisha Beauty</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,letterSpacing:2,color:T.gold,fontStyle:"italic"}}>Time to Glow</div>
        </div>
      </div>

      <div style={{background:T.parchment,borderBottom:"1px solid #E8E8E8",padding:"13px 22px"}}>
        <div style={{display:"flex",justifyContent:"center",maxWidth:480,margin:"0 auto"}}>
          {["Services","Date & Time","Your Info","Confirm"].map((label,i)=>{
            const n=i+1,active=step===n,done2=step>n;
            return (
              <div key={i} style={{flex:1,textAlign:"center",position:"relative"}}>
                {i>0&&<div style={{position:"absolute",top:13,left:0,right:"50%",height:1,background:done2||active?T.gold:T.sand,transition:"background .3s"}}/>}
                {i<3&&<div style={{position:"absolute",top:13,left:"50%",right:0,height:1,background:done2?T.gold:T.sand,transition:"background .3s"}}/>}
                <div style={{width:26,height:26,borderRadius:"50%",background:done2?T.gold:active?T.charcoal:T.sand,color:done2||active?T.white:T.grayLight,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px",position:"relative",zIndex:1,transition:"all .3s",fontWeight:"500"}}>{done2?"✓":n}</div>
                <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:active?T.charcoal:T.grayLight,fontWeight:active?"500":"300"}}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{maxWidth:560,margin:"0 auto",padding:"22px 18px 40px"}}>
        {step===1&&(
          <div style={{animation:"fadeUp .35s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <PageTitle style={{marginBottom:0}}>Choose Services</PageTitle>
              {selected.length>0&&<div style={{textAlign:"right"}}><div style={{fontSize:11,color:T.grayLight}}>{selected.length} selected</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:T.charcoal}}>{fmt(totalPrice)}</div></div>}
            </div>
            {selected.length>0&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14,padding:10,background:T.parchment,borderRadius:10,border:"1px solid #E8E8E8"}}>
                {selected.map(s=>(
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:4,background:T.charcoal,color:T.white,borderRadius:20,padding:"3px 10px",fontSize:12}}>
                    <span>{s.name}</span>
                    <button onClick={()=>toggleService(s)} style={{background:"transparent",border:"none",color:"#aaa",cursor:"pointer",fontSize:14,lineHeight:1,padding:"0 0 0 2px"}}>×</button>
                  </div>
                ))}
              </div>
            )}
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search services…" style={{...S.input,marginBottom:18}}/>
            {Object.entries(filteredSvcs).map(([cat,svcs])=>{
              return (
                <div key={cat} style={{marginBottom:18}}>
                  <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.gold,marginBottom:8,borderBottom:"1px solid #E8E8E8",paddingBottom:5}}>{cat}</div>
                  <div style={{display:"grid",gap:6}}>
                    {svcs.map(s=>{
                      const sel=!!selected.find(x=>x.id===s.id);
                      return (
                        <button key={s.id} onClick={()=>toggleService(s)} style={{background:sel?T.charcoal:T.white,border:"1px solid "+(sel?T.charcoal:"#E8E8E8"),borderRadius:10,padding:"11px 14px",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .2s",width:"100%"}}>
                          <div style={{display:"flex",alignItems:"center",gap:9}}>
                            <div style={{width:17,height:17,borderRadius:"50%",border:"2px solid "+(sel?"#fff":"#ccc"),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              {sel&&<div style={{width:7,height:7,borderRadius:"50%",background:"#fff"}}/>}
                            </div>
                            <div>
                              <div style={{fontSize:13,color:sel?T.white:T.charcoal,marginBottom:1}}>{s.name}</div>
                              {s.isDeal&&s.description&&<div style={{fontSize:11,color:sel?"#aaa":T.grayLight}}>{s.description}</div>}
                              {!s.isDeal&&<div style={{fontSize:11,color:sel?"#aaa":T.grayLight}}>{s.duration} min</div>}
                            </div>
                          </div>
                          <div style={{fontSize:13,fontFamily:"'Cormorant Garamond',serif",color:sel?T.gold:T.charcoal,whiteSpace:"nowrap",marginLeft:10}}>{fmt(s.price)}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}>
              <button className="gold-btn" onClick={()=>selected.length>0&&setStep(2)} style={{...S.goldBtn,opacity:selected.length>0?1:0.4,cursor:selected.length>0?"pointer":"not-allowed"}}>
                Continue → {selected.length>0&&"("+fmt(totalPrice)+")"}
              </button>
            </div>
          </div>
        )}

        {step===2&&(
          <div style={{animation:"fadeUp .35s ease"}}>
            <PageTitle>Pick a Date & Time</PageTitle>
            {totalDuration>0&&<div style={{fontSize:12,color:T.grayLight,marginBottom:14}}>Estimated total: {totalDuration} min</div>}
            <div style={{marginBottom:18}}><FieldLabel>Date</FieldLabel><input type="date" value={form.date} min={todayStr()} onChange={e=>{set("date",e.target.value);set("time","");}} style={S.input}/></div>
            {form.date&&<>
              <FieldLabel>Available Times</FieldLabel>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8}}>
                {TIME_SLOTS.map(t=>{const taken=takenSlots.includes(t),sel=form.time===t;return<button key={t} className={!taken?"time-btn":""} disabled={taken} onClick={()=>set("time",t)} style={{padding:"10px 4px",borderRadius:8,border:"1px solid "+(sel?T.charcoal:taken?"#F0F0F0":"#E8E8E8"),background:sel?T.charcoal:taken?T.parchment:T.white,color:sel?T.white:taken?T.grayLight:T.charcoal,fontSize:13,cursor:taken?"not-allowed":"pointer",transition:"all .2s",textDecoration:taken?"line-through":"none",fontFamily:"'Jost',sans-serif"}}>{t}</button>;})}
              </div>
            </>}
            <NavButtons step={step} setStep={setStep} canNext={!!form.date&&!!form.time}/>
          </div>
        )}

        {step===3&&(
          <div style={{animation:"fadeUp .35s ease"}}>
            <PageTitle>Your Details</PageTitle>
            <div style={{display:"grid",gap:13}}>
              {[
                ["name","Full Name","Your name","text","name"],
                ["phone","Phone","03001234567","tel","tel"],
                ["email","Email","hello@example.com","email","email"]
              ].map(([k,l,ph,tp,ac])=>(
                <div key={k}><FieldLabel>{l} *</FieldLabel><input type={tp} inputMode={tp==="tel"?"tel":tp==="email"?"email":"text"} autoComplete={ac} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} style={S.input}/></div>
              ))}
              <div><FieldLabel>Special Requests <span style={{color:T.grayLight,fontWeight:"300",textTransform:"none",letterSpacing:0}}>(optional)</span></FieldLabel><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} style={{...S.input,resize:"vertical"}} placeholder="Allergies, preferences…"/></div>
            </div>
            <NavButtons step={step} setStep={setStep} canNext={!!form.name&&!!form.phone&&!!form.email}/>
          </div>
        )}

        {step===4&&(
          <div style={{animation:"fadeUp .35s ease"}}>
            <PageTitle>Confirm Booking</PageTitle>
            <div style={{background:T.parchment,border:"1px solid #E8E8E8",borderRadius:12,padding:18,marginBottom:18}}>
              <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:T.grayLight,marginBottom:10}}>Services</div>
              {selected.map(s=>(
                <div key={s.id} style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:7}}>
                  <span style={{color:T.charcoal}}>{s.name}</span>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:T.charcoal}}>{fmt(s.price)}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:15,marginTop:10,paddingTop:10,borderTop:"1px solid #E8E8E8"}}>
                <span style={{color:T.charcoal,fontWeight:"500"}}>Total</span>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:T.charcoal}}>{fmt(totalPrice)}</span>
              </div>
              <div style={{height:1,background:"#E8E8E8",margin:"10px 0"}}/>
              {[["Date",fmtDate(form.date)],["Time",form.time],["Name",form.name],["Phone",form.phone]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}><span style={{color:T.grayLight}}>{k}</span><span style={{color:T.charcoal}}>{v}</span></div>
              ))}
            </div>
            <button className="gold-btn" onClick={submit} disabled={submitting} style={{...S.goldBtn,width:"100%",fontSize:15,padding:"15px",opacity:submitting?0.6:1}}>{submitting?"Confirming…":"Confirm Booking ✦"}</button>
            <button onClick={()=>setStep(3)} style={{width:"100%",background:"transparent",border:"none",color:T.grayLight,padding:"12px",cursor:"pointer",fontSize:13,marginTop:8,fontFamily:"'Jost',sans-serif"}}>← Go back</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════ DASHBOARD ════════════════ */
function Dashboard({clients,appointments,invoices,deals,SERVICES,saveClient,deleteClient,saveAppt,deleteAppt,createInvoiceFromAppt,createQuickInvoice,markPaid,deleteInvoice,printInvoice,saveDeal,deleteDeal,toggleDeal,showToast,setClients,role,managerName,onUpdateManagerName,screen,setScreen}) {
  const [tab,setTab]=useState("today");
  const [apptModal,setApptModal]=useState(null);
  const [clientModal,setClientModal]=useState(null);
  const isOwner=role==="owner";
  const [invoicePreview,setInvoicePreview]=useState(null);
  const cMap=useMemo(()=>Object.fromEntries(clients.map(c=>[c.id,c])),[clients]);
  const todayAppts    = useMemo(()=>appointments.filter(a=>isToday2(a.date)).sort((a,b)=>a.time.localeCompare(b.time)),[appointments]);
  const upcomingAppts = useMemo(()=>appointments.filter(a=>isFuture(a.date)).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)),[appointments]);
  const completedAppts= useMemo(()=>appointments.filter(a=>isPast(a.date)).sort((a,b)=>b.date.localeCompare(a.date)),[appointments]);
  const allAppts      = useMemo(()=>[...appointments].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)),[appointments]);
  const collected     = useMemo(()=>invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.amount),0),[invoices]);
  const outstanding   = useMemo(()=>invoices.filter(i=>i.status==="unpaid").reduce((s,i)=>s+Number(i.amount),0),[invoices]);
  const todayRevenue  = useMemo(()=>invoices.filter(i=>i.status==="paid"&&i.date===todayStr()).reduce((s,i)=>s+Number(i.amount),0),[invoices]);
  const handleSaveAppt=async(a)=>{const ok=await saveAppt(a);if(ok)setApptModal(null);};
  const handleSaveClient=async(c)=>{const ok=await saveClient(c);if(ok)setClientModal(null);};
  const TABS=[["today","Today"],["upcoming","Upcoming"],["completed","Completed"],["all","All Bookings"],["clients","Clients"],["invoices","Invoices"],...(isOwner?[["deals","Deals ✦"],["finances","Finances"],["settings","Settings"]]:[])];
  const handleCreateInvoice=async(appt)=>{
    const inv=await createInvoiceFromAppt(appt);
    if(inv) setInvoicePreview(inv);
  };
  const apptListProps={cMap,SERVICES,onEdit:setApptModal,onDelete:deleteAppt,onInvoice:handleCreateInvoice};

  if(screen==="invoices") return (
    <InvoicePage clients={clients} invoices={invoices} SERVICES={SERVICES} createQuickInvoice={createQuickInvoice} markPaid={markPaid} deleteInvoice={isOwner?deleteInvoice:null} printInvoice={printInvoice} showToast={showToast} setClients={setClients} saveClient={saveClient}/>
  );

  return (
    <div style={{minHeight:"100vh",paddingBottom:100}}>
      <div style={{background:T.white,borderBottom:"1px solid #E8E8E8",padding:"14px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:36,zIndex:9}}>
        <div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,letterSpacing:2,color:T.charcoal}}>{isOwner?"Owner Dashboard":"Manager Dashboard"}</div>
          <div style={{fontSize:9,letterSpacing:2,color:T.gold,textTransform:"uppercase",marginTop:1,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>Saisha Beauty Bar</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{textAlign:"right"}}><div style={{fontSize:9,color:T.grayLight,letterSpacing:1,textTransform:"uppercase"}}>Today</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:T.charcoal}}>{fmt(todayRevenue)}</div></div>
          <button className="gold-btn" onClick={()=>setApptModal({date:todayStr()})} style={S.goldBtn}>+ New</button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:"1px solid #E8E8E8",background:T.parchment}}>
        {[["Today",todayAppts.length],["Upcoming",upcomingAppts.length],["Collected",fmt(collected)],["Outstanding",fmt(outstanding)]].map(([l,v],i)=>(
          <div key={l} style={{padding:"12px",textAlign:"center",borderRight:i<3?"1px solid #E8E8E8":"none"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:i<2?22:13,color:T.charcoal,marginBottom:2}}>{v}</div>
            <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:T.grayLight}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{background:T.white,borderBottom:"1px solid #E8E8E8",display:"flex",padding:"0 14px",overflowX:"auto"}}>
        {TABS.map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)} style={{background:"transparent",border:"none",borderBottom:"2px solid "+(tab===key?T.charcoal:"transparent"),color:tab===key?T.charcoal:T.grayLight,padding:"12px 12px",cursor:"pointer",fontSize:12,letterSpacing:".3px",fontFamily:"'Jost',sans-serif",transition:"color .2s",marginBottom:-1,whiteSpace:"nowrap"}}>{label}</button>
        ))}
      </div>

      <div style={{padding:"18px",maxWidth:900,margin:"0 auto"}}>
        {tab==="today"&&<ApptList title={new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} appts={todayAppts} {...apptListProps} canDelete empty="No appointments today" emptyIcon="◷"/>}
        {tab==="upcoming"&&<ApptList title="Upcoming Bookings" appts={upcomingAppts} {...apptListProps} canDelete showDate empty="No upcoming bookings" emptyIcon="📅"/>}
        {tab==="completed"&&<ApptList title="Completed" appts={completedAppts} {...apptListProps} canDelete={false} showDate completed empty="No completed appointments yet" emptyIcon="✓"/>}
        {tab==="all"&&(
          <div style={{animation:"fadeUp .3s ease"}}>
            <SectionHeader title="All Bookings" action={<button className="outline-btn" onClick={()=>setApptModal({date:todayStr()})} style={S.outlineBtn}>+ Add</button>}/>
            {allAppts.length===0?<Empty icon="📋" text="No bookings yet"/>:(
              <div style={{display:"grid",gap:10}}>
                {allAppts.map(a=><ApptCard key={a.id} appt={a} client={cMap[a.client_id]} SERVICES={SERVICES} showDate canDelete={!isPast(a.date)} completed={isPast(a.date)} onEdit={()=>setApptModal(a)} onDelete={!isPast(a.date)?()=>deleteAppt(a.id):null} onInvoice={async()=>{const inv=await createInvoiceFromAppt(a);if(inv)setInvoicePreview(inv);}}/>)}
              </div>
            )}
          </div>
        )}
        {tab==="clients"&&(
          <div style={{animation:"fadeUp .3s ease"}}>
            <SectionHeader title="Clients" action={<button className="outline-btn" onClick={()=>setClientModal({})} style={S.outlineBtn}>+ Add Client</button>}/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:12}}>
              {clients.map(c=>{
                const visits=appointments.filter(a=>a.client_id===c.id).length;
                const spent=invoices.filter(i=>i.client_id===c.id&&i.status==="paid").reduce((s,i)=>s+Number(i.amount),0);
                return (
                  <div key={c.id} style={{background:T.white,border:"1px solid #E8E8E8",borderRadius:12,padding:18}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div>
                        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:T.charcoal,marginBottom:2}}>{c.name}</div>
                        <div style={{fontSize:13,color:T.grayLight}}>{c.phone}</div>
                        <div style={{fontSize:13,color:T.grayLight}}>{c.email}</div>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button className="outline-btn" onClick={()=>setClientModal(c)} style={{...S.outlineBtn,padding:"4px 10px",fontSize:12}}>Edit</button>
                        {isOwner&&<button className="outline-btn" onClick={()=>{if(window.confirm("Delete "+c.name+"? This cannot be undone."))deleteClient(c.id);}} style={{...S.outlineBtn,padding:"4px 10px",fontSize:12,color:T.red,borderColor:"#D4A0A0"}}>Delete</button>}
                      </div>
                    </div>
                    {c.notes&&<div style={{fontSize:12,color:T.grayLight,fontStyle:"italic",borderTop:"1px solid #E8E8E8",paddingTop:8,marginBottom:8}}>{c.notes}</div>}
                    <div style={{display:"flex",gap:18,borderTop:"1px solid #E8E8E8",paddingTop:10}}>
                      <div><div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:T.grayLight,marginBottom:2}}>Visits</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:T.charcoal}}>{visits}</div></div>
                      <div><div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:T.grayLight,marginBottom:2}}>Spent</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:T.charcoal}}>{fmt(spent)}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab==="invoices"&&<InvoiceListTab invoices={invoices} markPaid={markPaid} deleteInvoice={isOwner?deleteInvoice:null} printInvoice={printInvoice}/>}
        {isOwner&&tab==="deals"&&<DealsTab deals={deals} saveDeal={saveDeal} deleteDeal={deleteDeal} toggleDeal={toggleDeal}/>}
        {isOwner&&tab==="finances"&&<FinancesTab invoices={invoices}/>}
        {isOwner&&tab==="settings"&&<SettingsTab managerName={managerName} onUpdate={onUpdateManagerName} showToast={showToast}/>}
      </div>

      {apptModal!==null&&<ApptModal data={apptModal} clients={clients} SERVICES={SERVICES} onSave={handleSaveAppt} setClients={setClients} onClose={()=>setApptModal(null)}/>}
      {clientModal!==null&&<ClientModal data={clientModal} onSave={handleSaveClient} onClose={()=>setClientModal(null)}/>}
      {invoicePreview&&<InvoicePreviewModal inv={invoicePreview} markPaid={markPaid} printInvoice={printInvoice} onClose={()=>setInvoicePreview(null)} setInvPreview={setInvoicePreview}/>}
    </div>
  );
}

/* ════════════════ INVOICE PAGE ════════════════ */
function InvoicePage({clients,invoices,SERVICES,createQuickInvoice,markPaid,deleteInvoice,printInvoice,showToast,setClients,saveClient}) {
  const [clientName,setClientName]=useState(""); const [clientId,setClientId]=useState("");
  const [phone,setPhone]=useState(""); const [email,setEmail]=useState(""); const [isNew,setIsNew]=useState(true);
  const [suggestions,setSuggestions]=useState([]); const [showSugg,setShowSugg]=useState(false);
  const [selectedSvcs,setSelectedSvcs]=useState([]);
  const [svcSearch,setSvcSearch]=useState("");
  const [date,setDate]=useState(todayStr()); const [discount,setDiscount]=useState(""); const [note,setNote]=useState("");
  const [saving,setSaving]=useState(false);
  const [invPreviewLocal,setInvPreviewLocal]=useState(null);

  const handleNameChange=(val)=>{
    setClientName(val); setClientId(""); setIsNew(true);
    if(val.length>=1){const m=clients.filter(c=>c.name.toLowerCase().includes(val.toLowerCase())); setSuggestions(m); setShowSugg(m.length>0);}
    else{setSuggestions([]);setShowSugg(false);}
  };
  const selectClient=(c)=>{setClientName(c.name);setClientId(c.id);setPhone(c.phone||"");setEmail(c.email||"");setIsNew(false);setShowSugg(false);};
  const toggleSvc=(svc)=>setSelectedSvcs(prev=>prev.find(s=>s.id===svc.id)?prev.filter(s=>s.id!==svc.id):[...prev,svc]);

  const subtotal=selectedSvcs.reduce((s,sv)=>s+Number(sv.price||0),0);
  const discAmt=discount?Math.min(Number(discount),subtotal):0;
  const total=subtotal-discAmt;
  const valid=clientName&&selectedSvcs.length>0&&date;
  const filteredSvcs=useMemo(()=>SERVICES.filter(s=>s.name.toLowerCase().includes(svcSearch.toLowerCase())),[SERVICES,svcSearch]);

  const handleCreate=async()=>{
    if(!valid)return; setSaving(true);
    let cid=clientId;
    if(isNew&&clientName){
      const {data,error}=await supabase.from("clients").insert({name:clientName,phone:phone||"",email:email||"",notes:""}).select().single();
      if(!error){setClients(prev=>[data,...prev]);cid=data.id;}
    }
    const result=await createQuickInvoice({clientId:cid,clientName,services:selectedSvcs,date,discount:discAmt>0?discAmt:null,note:note||null});
    setSaving(false);
    if(result){
      setClientName("");setClientId("");setPhone("");setEmail("");setIsNew(true);setSelectedSvcs([]);setDiscount("");setNote("");setSvcSearch("");
      setInvPreviewLocal(result);
    }
  };

  return (
    <div style={{minHeight:"100vh",paddingBottom:100}}>
      <div style={{background:T.white,borderBottom:"1px solid #E8E8E8",padding:"14px 22px",position:"sticky",top:36,zIndex:9}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,letterSpacing:2,color:T.charcoal}}>New Invoice</div>
        <div style={{fontSize:9,letterSpacing:2,color:T.gold,textTransform:"uppercase",marginTop:1,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>Saisha Beauty Bar</div>
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"18px 18px 40px"}}>
        <div style={{background:T.white,border:"1px solid #E8E8E8",borderRadius:16,padding:22,marginBottom:26}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:T.charcoal,marginBottom:18}}>Invoice Details</div>
          <div style={{display:"grid",gap:13}}>
            <div style={{position:"relative"}}>
              <FieldLabel>Client Name *</FieldLabel>
              <input value={clientName} onChange={e=>handleNameChange(e.target.value)} onBlur={()=>setTimeout(()=>setShowSugg(false),150)} onFocus={()=>clientName&&suggestions.length>0&&setShowSugg(true)} autoComplete="off" inputMode="text" placeholder="Start typing a name…" style={{...S.input,borderColor:clientId?T.gold:"#E8E8E8"}}/>
              {clientId&&<span style={{position:"absolute",right:12,top:32,fontSize:11,color:T.green}}>✓ Existing</span>}
              {showSugg&&(
                <div style={{position:"absolute",top:"100%",left:0,right:0,background:T.white,border:"1px solid #E8E8E8",borderRadius:8,zIndex:50,boxShadow:"0 8px 24px rgba(0,0,0,.1)",marginTop:2,maxHeight:160,overflowY:"auto"}}>
                  {suggestions.map(c=>(
                    <div key={c.id} className="suggestion-item" onClick={()=>selectClient(c)} style={{padding:"9px 13px",cursor:"pointer",transition:"background .15s"}}>
                      <div style={{fontSize:13,color:T.charcoal}}>{c.name}</div>
                      <div style={{fontSize:11,color:T.grayLight}}>{c.phone} · {c.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><FieldLabel>Phone</FieldLabel><input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="03001234567" style={{...S.input,background:clientId?T.parchment:T.white}} readOnly={!!clientId}/></div>
              <div><FieldLabel>Email</FieldLabel><input type="email" inputMode="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="hello@example.com" style={{...S.input,background:clientId?T.parchment:T.white}} readOnly={!!clientId}/></div>
            </div>
            {clientId&&<div style={{fontSize:12,color:T.grayLight,marginTop:-8}}>Auto-filled from client record</div>}

            <div>
              <FieldLabel>Services * {selectedSvcs.length>0&&<span style={{color:T.gold}}>({selectedSvcs.length} — {fmt(subtotal)})</span>}</FieldLabel>
              <input value={svcSearch} onChange={e=>setSvcSearch(e.target.value)} placeholder="Search services…" style={{...S.input,marginBottom:6}}/>
              <div style={{maxHeight:200,overflowY:"auto",border:"1px solid #E8E8E8",borderRadius:8}}>
                {filteredSvcs.map(s=>{
                  const sel=!!selectedSvcs.find(x=>x.id===s.id);
                  return (
                    <div key={s.id} onClick={()=>toggleSvc(s)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 13px",cursor:"pointer",background:sel?"#FFFDF7":T.white,borderBottom:"1px solid #E8E8E8",transition:"background .15s"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:15,height:15,borderRadius:4,border:"2px solid "+(sel?T.gold:"#E0E0E0"),background:sel?T.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{sel&&<span style={{color:T.white,fontSize:9,fontWeight:"bold"}}>✓</span>}</div>
                        <div><div style={{fontSize:13,color:T.charcoal}}>{s.name}</div><div style={{fontSize:10,color:T.grayLight}}>{s.category}</div></div>
                      </div>
                      <div style={{fontSize:13,fontFamily:"'Cormorant Garamond',serif",color:T.charcoal,whiteSpace:"nowrap"}}>{fmt(s.price)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedSvcs.length>0&&(
              <div style={{background:T.parchment,borderRadius:8,padding:"9px 13px",display:"flex",flexWrap:"wrap",gap:5}}>
                {selectedSvcs.map(s=>(
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:4,background:T.charcoal,color:T.white,borderRadius:20,padding:"3px 9px",fontSize:12}}>
                    {s.name}<span style={{cursor:"pointer",color:"#aaa",marginLeft:2}} onClick={()=>toggleSvc(s)}>×</span>
                  </div>
                ))}
              </div>
            )}

            <div><FieldLabel>Date *</FieldLabel><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={S.input}/></div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><FieldLabel>Discount (Rs.) <span style={{color:T.grayLight,textTransform:"none",letterSpacing:0,fontWeight:300}}>(optional)</span></FieldLabel><input type="number" inputMode="numeric" value={discount} onChange={e=>setDiscount(e.target.value)} placeholder="e.g. 500" min="0" style={S.input}/></div>
              <div><FieldLabel>Note <span style={{color:T.grayLight,textTransform:"none",letterSpacing:0,fontWeight:300}}>(optional)</span></FieldLabel><input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Bridal package" style={S.input}/></div>
            </div>

            {discAmt>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:T.green,background:T.greenLight,border:"1px solid #A8D4B0",borderRadius:8,padding:"9px 13px"}}><span>Discount</span><span>− {fmt(discAmt)}</span></div>}
          </div>

          {valid&&(
            <div style={{marginTop:16,background:T.parchment,border:"1px solid #E8E8E8",borderRadius:10,padding:13}}>
              <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:T.grayLight,marginBottom:8}}>Preview</div>
              {[["Client",clientName],["Date",fmtDate(date)]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:T.grayLight}}>{k}</span><span style={{color:T.charcoal}}>{v}</span></div>
              ))}
              {selectedSvcs.map(s=>(
                <div key={s.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:3}}><span style={{color:T.charcoal}}>· {s.name}</span><span style={{color:T.charcoal}}>{fmt(s.price)}</span></div>
              ))}
              {discAmt>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:T.green}}><span>Discount</span><span>− {fmt(discAmt)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:"500",marginTop:7,paddingTop:7,borderTop:"1px solid #E8E8E8"}}><span>Total</span><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17}}>{fmt(total)}</span></div>
            </div>
          )}

          <button className="gold-btn" onClick={handleCreate} disabled={!valid||saving} style={{...S.goldBtn,width:"100%",marginTop:14,padding:"13px",fontSize:14,opacity:valid&&!saving?1:0.4,cursor:valid&&!saving?"pointer":"not-allowed"}}>
            {saving?"Creating…":"Create Invoice ✦"}
          </button>
        </div>

        <InvoiceListTab invoices={invoices} markPaid={markPaid} deleteInvoice={deleteInvoice} printInvoice={printInvoice} compact/>
      </div>
    {invPreviewLocal&&<InvoicePreviewModal inv={invPreviewLocal} markPaid={markPaid} printInvoice={printInvoice} onClose={()=>setInvPreviewLocal(null)} setInvPreview={setInvPreviewLocal}/>}
    </div>
  );
}

/* ════════════════ INVOICE LIST TAB ════════════════ */
function InvoiceListTab({invoices,markPaid,deleteInvoice,printInvoice,compact}) {
  const [filter,setFilter]=useState("all"); const [search,setSearch]=useState(""); const [preview,setPreview]=useState(null);
  const collected  = useMemo(()=>invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.amount),0),[invoices]);
  const outstanding= useMemo(()=>invoices.filter(i=>i.status==="unpaid").reduce((s,i)=>s+Number(i.amount),0),[invoices]);
  const filtered   = useMemo(()=>invoices.filter(i=>filter==="all"||i.status===filter).filter(i=>(i.client_name||"").toLowerCase().includes(search.toLowerCase())||(i.invoice_num||"").toLowerCase().includes(search.toLowerCase())),[invoices,filter,search]);
  return (
    <div style={compact?{}:{animation:"fadeUp .3s ease"}}>
      {compact?<div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:T.charcoal,marginBottom:14}}>Recent Invoices</div>:<SectionHeader title="Invoices"/>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[["Total",invoices.length],["Collected",fmt(collected)],["Outstanding",fmt(outstanding)]].map(([l,v],i)=>(
          <div key={l} style={{background:T.white,border:"1px solid #E8E8E8",borderRadius:10,padding:"11px",textAlign:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:i===0?20:13,color:T.charcoal,marginBottom:2}}>{v}</div>
            <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:T.grayLight}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:7,marginBottom:11,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{...S.input,maxWidth:190}}/>
        {["all","unpaid","paid"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{...S.outlineBtn,padding:"7px 12px",fontSize:12,background:filter===f?T.charcoal:"transparent",color:filter===f?T.white:T.charcoal,borderColor:filter===f?T.charcoal:"#E8E8E8",textTransform:"capitalize"}}>{f==="all"?"All":f.charAt(0).toUpperCase()+f.slice(1)}</button>
        ))}
      </div>
      {filtered.length===0?<Empty icon="◻" text="No invoices found"/>:(
        <div style={{display:"grid",gap:8}}>
          {filtered.map(inv=>{
            const services=parseServices(inv.services_json);
            return (
              <div key={inv.id} className="inv-card" style={{background:T.white,border:"1px solid #E8E8E8",borderRadius:12,overflow:"hidden",transition:"all .2s"}}>
                <div style={{height:2,background:"linear-gradient(to right,"+T.gold+",#E8D89A,"+T.gold+")"}}/>
                <div style={{padding:"13px 16px",display:"flex",alignItems:"flex-start",gap:11,flexWrap:"wrap"}}>
                  <div style={{minWidth:78}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:T.charcoal}}>{inv.invoice_num}</div>
                    <div style={{fontSize:11,color:T.grayLight,marginTop:1}}>{fmtDate(inv.date)}</div>
                  </div>
                  <div style={{width:1,alignSelf:"stretch",background:"#E8E8E8",minHeight:24}}/>
                  <div style={{flex:1,minWidth:110}}>
                    <div style={{fontSize:14,color:T.charcoal,marginBottom:2}}>{inv.client_name}</div>
                    {services.length>0?services.map((s,i)=><div key={i} style={{fontSize:11,color:T.grayLight}}>· {s.name}</div>):<div style={{fontSize:11,color:T.grayLight}}>{inv.service_name||"—"}</div>}
                    {Number(inv.discount)>0&&<div style={{fontSize:11,color:T.green,marginTop:2}}>Discount: − {fmt(inv.discount)}</div>}
                  </div>
                  <div style={{textAlign:"right",minWidth:85}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:T.charcoal}}>{fmt(inv.amount)}</div>
                    <span style={{fontSize:9,letterSpacing:1,padding:"2px 7px",borderRadius:20,textTransform:"uppercase",display:"inline-block",marginTop:3,background:inv.status==="paid"?T.greenLight:T.parchment,color:inv.status==="paid"?T.green:T.grayLight,border:"1px solid "+(inv.status==="paid"?"#A8D4B0":"#E8E8E8")}}>{inv.status}</span>
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {inv.status==="unpaid"&&<button className="outline-btn" onClick={()=>markPaid(inv.id)} style={{...S.outlineBtn,fontSize:11,padding:"4px 8px",color:T.green,borderColor:"#A8D4B0"}}>Paid</button>}
                    <button className="outline-btn" onClick={()=>setPreview(inv)} style={{...S.outlineBtn,fontSize:11,padding:"4px 8px"}}>View</button>
                    <button className="outline-btn" onClick={()=>printInvoice(inv)} style={{...S.outlineBtn,fontSize:11,padding:"4px 8px"}}>Print</button>
                    {deleteInvoice&&<button className="outline-btn" onClick={()=>deleteInvoice(inv.id)} style={{...S.outlineBtn,fontSize:11,padding:"4px 8px",color:T.red,borderColor:"#D4A0A0"}}>Del</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {preview&&<InvoicePreviewModal inv={preview} markPaid={markPaid} printInvoice={printInvoice} onClose={()=>setPreview(null)} setInvPreview={setPreview}/>}
    </div>
  );
}

/* ════════════════ INVOICE PREVIEW MODAL ════════════════ */
function InvoicePreviewModal({inv,markPaid,printInvoice,onClose,setInvPreview}) {
  const services=parseServices(inv.services_json);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadeIn .2s ease"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:18,width:"100%",maxWidth:460,padding:28,boxShadow:"0 24px 64px rgba(0,0,0,.12)",animation:"fadeUp .25s ease",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{width:42,height:42,margin:"0 auto 8px"}}><img src="/saisha-monogram-transparent.png" alt="SB" style={{width:"100%"}}/></div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,letterSpacing:3,textTransform:"uppercase",color:T.charcoal}}>Saisha Beauty</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:11,color:T.grayLight,fontStyle:"italic"}}>Time to Glow</div>
        </div>
        <div style={{height:1,background:"linear-gradient(to right,transparent,"+T.gold+",transparent)",marginBottom:14}}/>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:13}}>
          <div>
            <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.grayLight,marginBottom:3}}>Invoice</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:T.charcoal}}>{inv.invoice_num}</div>
            <span style={{fontSize:9,letterSpacing:1,padding:"2px 8px",borderRadius:20,textTransform:"uppercase",display:"inline-block",marginTop:4,background:inv.status==="paid"?T.greenLight:T.parchment,color:inv.status==="paid"?T.green:T.grayLight,border:"1px solid "+(inv.status==="paid"?"#A8D4B0":"#E8E8E8")}}>{inv.status}</span>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.grayLight,marginBottom:3}}>Date</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:T.charcoal}}>{fmtDate(inv.date)}</div>
          </div>
        </div>
        <div style={{background:T.parchment,border:"1px solid #E8E8E8",borderRadius:10,padding:13,marginBottom:14}}>
          <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.grayLight,marginBottom:5}}>Billed To</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:T.charcoal,marginBottom:9}}>{inv.client_name}</div>
          <div style={{height:1,background:"#E8E8E8",marginBottom:9}}/>
          <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.grayLight,marginBottom:5}}>Services</div>
          {services.length>0?services.map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
              <span style={{color:T.charcoal}}>{s.name}</span>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:T.charcoal}}>{fmt(s.price)}</span>
            </div>
          )):<div style={{fontSize:13,color:T.grayLight}}>{inv.service_name}</div>}
          {Number(inv.discount)>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:T.green,marginTop:3}}><span>Discount</span><span>− {fmt(inv.discount)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:"500",marginTop:7,paddingTop:7,borderTop:"1px solid #E8E8E8"}}>
            <span>Total</span><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16}}>{fmt(inv.amount)}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:7,justifyContent:"flex-end"}}>
          {inv.status==="unpaid"&&<button className="outline-btn" onClick={()=>{markPaid(inv.id);setInvPreview(p=>({...p,status:"paid"}));}} style={{...S.outlineBtn,color:T.green,borderColor:"#A8D4B0"}}>Mark Paid</button>}
          <button className="outline-btn" onClick={()=>printInvoice(inv)} style={S.outlineBtn}>Print / PDF</button>
          <button onClick={onClose} style={{...S.outlineBtn,color:T.grayLight}}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════ APPT LIST + CARD ════════════════ */
function ApptList({title,appts,cMap,SERVICES,canDelete,showDate,completed,onEdit,onDelete,onInvoice,empty,emptyIcon}) {
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <SectionHeader title={title} action={<span style={{fontSize:12,color:T.grayLight}}>{appts.length} appt{appts.length!==1?"s":""}</span>}/>
      {appts.length===0?<Empty icon={emptyIcon} text={empty}/>:(
        <div style={{display:"grid",gap:10}}>
          {appts.map(a=><ApptCard key={a.id} appt={a} client={cMap[a.client_id]} SERVICES={SERVICES} showDate={showDate} canDelete={canDelete} completed={completed} onEdit={()=>onEdit(a)} onDelete={canDelete&&onDelete?()=>onDelete(a.id):null} onInvoice={()=>onInvoice(a)}/>)}
        </div>
      )}
    </div>
  );
}

function ApptCard({appt,client,SERVICES,showDate,canDelete,completed,onEdit,onDelete,onInvoice}) {
  const services=parseServices(appt.services);
  const total=services.reduce((s,sv)=>s+Number(sv.price||0),0);
  return (
    <div style={{background:T.white,border:"1px solid #E8E8E8",borderRadius:10,padding:"13px 17px",display:"flex",alignItems:"flex-start",gap:13,flexWrap:"wrap",opacity:completed?0.85:1}}>
      <div style={{minWidth:70,textAlign:"center",background:T.parchment,borderRadius:8,padding:"8px 6px",border:"1px solid #E8E8E8",flexShrink:0}}>
        {showDate&&<div style={{fontSize:9,color:T.gold,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>{fmtDate(appt.date)}</div>}
        <div style={{fontSize:13,color:T.charcoal,fontWeight:"500"}}>{appt.time}</div>
        {appt.total_duration>0&&<div style={{fontSize:10,color:T.grayLight,marginTop:1}}>{appt.total_duration}m</div>}
      </div>
      <div style={{flex:1,minWidth:130}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:T.charcoal}}>{client?.name||"Guest"}</div>
          {completed&&<span style={{fontSize:9,letterSpacing:1,color:T.grayLight,background:T.parchment,padding:"1px 6px",borderRadius:10,border:"1px solid #E8E8E8",textTransform:"uppercase"}}>Done</span>}
          {appt.source==="online"&&<span style={{fontSize:9,letterSpacing:1,color:T.gold,textTransform:"uppercase"}}>Online</span>}
        </div>
        {services.length>0?(
          services.map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:2}}>
              <span style={{color:T.gray}}>· {s.name}</span>
              <span style={{color:T.charcoal,fontSize:12}}>{fmt(s.price)}</span>
            </div>
          ))
        ):<div style={{fontSize:12,color:T.grayLight}}>No services</div>}
        {services.length>1&&<div style={{fontSize:13,color:T.charcoal,fontWeight:"500",marginTop:4,paddingTop:4,borderTop:"1px solid #E8E8E8"}}>Total: {fmt(total)}</div>}
        {appt.special_request&&<div style={{fontSize:11,color:T.grayLight,fontStyle:"italic",marginTop:3}}>"{appt.special_request}"</div>}
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignSelf:"center"}}>
        {!appt.invoiced&&<button className="outline-btn" onClick={onInvoice} style={{...S.outlineBtn,fontSize:11,padding:"4px 9px",color:T.green,borderColor:"#A8D4B0"}}>Invoice</button>}
        {appt.invoiced&&<span style={{fontSize:11,color:T.green,padding:"4px 0"}}>✓ Inv</span>}
        <button className="outline-btn" onClick={onEdit} style={{...S.outlineBtn,fontSize:11,padding:"4px 9px"}}>Edit</button>
        {canDelete&&onDelete
          ?<button className="outline-btn" onClick={onDelete} style={{...S.outlineBtn,fontSize:11,padding:"4px 9px",color:T.red,borderColor:"#D4A0A0"}}>Remove</button>
          :<span style={{fontSize:10,color:T.grayLight,padding:"4px 6px",background:T.parchment,borderRadius:6,border:"1px solid #E8E8E8"}}>🔒</span>}
      </div>
    </div>
  );
}

/* ════════════════ APPT MODAL (multi-service) ════════════════ */
function ApptModal({data,clients,SERVICES,onSave,setClients,onClose}) {
  const existing     = parseServices(data.services);
  const existingClient = clients.find(c=>c.id===data.client_id);

  const [clientId,   setClientId]   = useState(data.client_id||"");
  const [clientName, setClientName] = useState(existingClient?.name||"");
  const [phone,      setPhone]      = useState(existingClient?.phone||"");
  const [email,      setEmail]      = useState(existingClient?.email||"");
  const [special,    setSpecial]    = useState(data.special_request||"");
  const [isNew,      setIsNew]      = useState(!data.client_id);
  const [suggestions,setSuggestions]= useState([]);
  const [showSugg,   setShowSugg]   = useState(false);
  const [selected,   setSelected]   = useState(existing);
  const [date,       setDate]       = useState(data.date||todayStr());
  const [time,       setTime]       = useState(data.time||"");
  const [svcSearch,  setSvcSearch]  = useState("");
  const [saving,     setSaving]     = useState(false);

  const handleClientName=(val)=>{
    setClientName(val); setClientId(""); setIsNew(true);
    setPhone(""); setEmail("");
    if(val.length>=1){const m=clients.filter(c=>c.name.toLowerCase().includes(val.toLowerCase()));setSuggestions(m);setShowSugg(m.length>0);}
    else{setSuggestions([]);setShowSugg(false);}
  };
  const pickClient=(c)=>{
    setClientName(c.name); setClientId(c.id);
    setPhone(c.phone||""); setEmail(c.email||"");
    setIsNew(false); setShowSugg(false); setSuggestions([]);
  };
  const toggleSvc=(svc)=>setSelected(prev=>prev.find(s=>s.id===svc.id)?prev.filter(s=>s.id!==svc.id):[...prev,svc]);
  const total=selected.reduce((s,sv)=>s+sv.price,0);
  const valid=clientName&&selected.length>0&&date&&time;

  const handleSave=async()=>{
    if(!valid)return; setSaving(true);
    let cid=clientId;
    if(isNew&&clientName){
      const {data:nd,error}=await supabase.from("clients").insert({name:clientName,phone:phone||"",email:email||"",notes:""}).select().single();
      if(error){setSaving(false);return;}
      cid=nd.id;
      setClients(prev=>[nd,...prev]);
    }
    if(!cid){setSaving(false);return;}
    const ok=await onSave({id:data.id||"",clientId:cid,services:selected,date,time,specialRequest:special||null,invoiced:data.invoiced||false,source:data.source||"manual"});
    if(!ok) setSaving(false);
  };

  const filtered=SERVICES.filter(s=>s.name.toLowerCase().includes(svcSearch.toLowerCase()));

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadeIn .2s ease"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:20,width:"100%",maxWidth:560,boxShadow:"0 24px 64px rgba(0,0,0,.12)",animation:"fadeUp .25s ease",maxHeight:"94vh",overflowY:"auto",display:"flex",flexDirection:"column"}}>

        {/* ── Header ── */}
        <div style={{padding:"22px 26px 18px",borderBottom:"1px solid #E8E8E8",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:T.charcoal}}>{data.id?"Edit Booking":"New Booking"}</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:20,color:T.grayLight,lineHeight:1,padding:"2px 6px"}}>×</button>
        </div>

        <div style={{padding:"20px 26px",display:"grid",gap:0,overflowY:"auto"}}>

          {/* ── Section: Client Info ── */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.gold,marginBottom:12}}>Client Information</div>
            <div style={{display:"grid",gap:12}}>

              {/* Name autocomplete */}
              <div style={{position:"relative"}}>
                <FieldLabel>Full Name *</FieldLabel>
                <input
                  value={clientName}
                  onChange={e=>handleClientName(e.target.value)}
                  onBlur={()=>setTimeout(()=>setShowSugg(false),150)}
                  onFocus={()=>clientName&&suggestions.length>0&&setShowSugg(true)}
                  placeholder="Your name"
                  style={{...S.input,borderColor:clientId?T.gold:"#E8E8E8"}}
                  autoComplete="off"
                />
                {clientId&&<span style={{position:"absolute",right:12,top:32,fontSize:11,color:T.green}}>✓ Returning client</span>}
                {isNew&&clientName&&!clientId&&<span style={{position:"absolute",right:12,top:32,fontSize:11,color:T.grayLight}}>New — will be saved</span>}
                {showSugg&&(
                  <div style={{position:"absolute",top:"100%",left:0,right:0,background:T.white,border:"1px solid #E8E8E8",borderRadius:8,zIndex:50,boxShadow:"0 8px 24px rgba(0,0,0,.1)",marginTop:2,maxHeight:160,overflowY:"auto"}}>
                    {suggestions.map(c=>(
                      <div key={c.id} className="suggestion-item" onClick={()=>pickClient(c)} style={{padding:"9px 13px",cursor:"pointer",transition:"background .15s"}}>
                        <div style={{fontSize:13,color:T.charcoal,fontWeight:"400"}}>{c.name}</div>
                        <div style={{fontSize:11,color:T.grayLight}}>{[c.phone,c.email].filter(Boolean).join(" · ")}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone + Email side by side */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <FieldLabel>Phone</FieldLabel>
                  <input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="03001234567"
                    style={{...S.input,background:clientId?T.parchment:T.white}} readOnly={!!clientId}/>
                </div>
                <div>
                  <FieldLabel>Email</FieldLabel>
                  <input type="email" inputMode="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="hello@example.com"
                    style={{...S.input,background:clientId?T.parchment:T.white}} readOnly={!!clientId}/>
                </div>
              </div>
              {clientId&&<div style={{fontSize:11,color:T.grayLight,marginTop:-6}}>Contact details auto-filled from client record</div>}

              {/* Special instructions */}
              <div>
                <FieldLabel>Special Instructions <span style={{color:T.grayLight,textTransform:"none",letterSpacing:0,fontWeight:300}}>(optional)</span></FieldLabel>
                <textarea value={special} onChange={e=>setSpecial(e.target.value)} rows={2}
                  placeholder="Allergies, preferences, anything to note…"
                  style={{...S.input,resize:"vertical"}}/>
              </div>
            </div>
          </div>

          {/* divider */}
          <div style={{height:1,background:"#F0F0F0",marginBottom:20}}/>

          {/* ── Section: Services ── */}
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.gold}}>Services</div>
              {selected.length>0&&<div style={{fontSize:12,color:T.charcoal,fontFamily:"'Cormorant Garamond',serif"}}>{selected.length} selected · {fmt(total)}</div>}
            </div>

            {/* Selected chips */}
            {selected.length>0&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10,padding:"9px 11px",background:T.parchment,borderRadius:8,border:"1px solid #E8E8E8"}}>
                {selected.map(s=>(
                  <div key={s.id} style={{display:"flex",alignItems:"center",gap:5,background:T.charcoal,color:T.white,borderRadius:20,padding:"3px 10px",fontSize:12}}>
                    <span>{s.name}</span>
                    <button onClick={()=>toggleSvc(s)} style={{background:"transparent",border:"none",color:"#aaa",cursor:"pointer",fontSize:14,lineHeight:1,padding:0}}>×</button>
                  </div>
                ))}
              </div>
            )}

            <input value={svcSearch} onChange={e=>setSvcSearch(e.target.value)} placeholder="Search services…"
              style={{...S.input,marginBottom:6}}/>
            <div style={{maxHeight:180,overflowY:"auto",border:"1px solid #E8E8E8",borderRadius:8}}>
              {filtered.map(s=>{
                const sel=!!selected.find(x=>x.id===s.id);
                return (
                  <div key={s.id} onClick={()=>toggleSvc(s)}
                    style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",cursor:"pointer",background:sel?"#FFFDF7":T.white,borderBottom:"1px solid #F5F5F5",transition:"background .12s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <div style={{width:15,height:15,borderRadius:4,border:"2px solid "+(sel?T.gold:"#E0E0E0"),background:sel?T.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {sel&&<span style={{color:T.white,fontSize:9,fontWeight:"bold",lineHeight:1}}>✓</span>}
                      </div>
                      <div>
                        <div style={{fontSize:13,color:T.charcoal}}>{s.name}</div>
                        {s.duration>0&&<div style={{fontSize:10,color:T.grayLight}}>{s.duration} min</div>}
                      </div>
                    </div>
                    <div style={{fontSize:13,fontFamily:"'Cormorant Garamond',serif",color:T.charcoal,whiteSpace:"nowrap"}}>{fmt(s.price)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* divider */}
          <div style={{height:1,background:"#F0F0F0",marginBottom:20}}/>

          {/* ── Section: Date & Time ── */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.gold,marginBottom:12}}>Date & Time</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <FieldLabel>Date *</FieldLabel>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={S.input}/>
              </div>
              <div>
                <FieldLabel>Time *</FieldLabel>
                <select value={time} onChange={e=>setTime(e.target.value)} style={S.input}>
                  <option value="">Select…</option>
                  {TIME_SLOTS.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Summary strip ── */}
          {valid&&(
            <div style={{background:T.parchment,borderRadius:10,padding:"12px 16px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #E8E8E8"}}>
              <div>
                <div style={{fontSize:12,color:T.charcoal}}>{clientName}</div>
                <div style={{fontSize:11,color:T.grayLight}}>{fmtDate(date)} at {time} · {selected.length} service{selected.length!==1?"s":""}</div>
              </div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:T.charcoal}}>{fmt(total)}</div>
            </div>
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div style={{padding:"16px 26px",borderTop:"1px solid #E8E8E8",display:"flex",gap:8,justifyContent:"flex-end",flexShrink:0}}>
          <button className="outline-btn" onClick={onClose} style={S.outlineBtn}>Cancel</button>
          <button className="gold-btn" onClick={handleSave} disabled={!valid||saving}
            style={{...S.goldBtn,opacity:valid&&!saving?1:0.4,cursor:valid&&!saving?"pointer":"not-allowed"}}>
            {saving?"Saving…":data.id?"Update Booking":"Save Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════ DEALS TAB ════════════════ */
function DealsTab({deals,saveDeal,deleteDeal,toggleDeal}) {
  const [modal,setModal]=useState(null);
  const active=deals.filter(d=>d.active&&(!d.expiry||d.expiry>=todayStr()));
  const inactive=deals.filter(d=>!d.active||(d.expiry&&d.expiry<todayStr()));
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <SectionHeader title="Deals of the Month" action={<button className="gold-btn" onClick={()=>setModal({})} style={S.goldBtn}>+ Add Deal</button>}/>
      <div style={{background:T.parchment,border:"1px solid #E8E8E8",borderRadius:10,padding:"9px 13px",marginBottom:18,fontSize:13,color:T.grayLight}}>✦ Active deals appear automatically in the booking page and invoice service menu.</div>
      {deals.length===0&&<Empty icon="✦" text="No deals yet"/>}
      {active.length>0&&<div style={{marginBottom:18}}><div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.gold,marginBottom:10}}>Active · In Menu</div><div style={{display:"grid",gap:9}}>{active.map(d=><DealCard key={d.id} deal={d} onEdit={()=>setModal(d)} onDelete={()=>deleteDeal(d.id)} onToggle={()=>toggleDeal(d.id,false)}/>)}</div></div>}
      {inactive.length>0&&<div><div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:T.grayLight,marginBottom:10}}>Inactive / Expired</div><div style={{display:"grid",gap:9}}>{inactive.map(d=><DealCard key={d.id} deal={d} inactive onEdit={()=>setModal(d)} onDelete={()=>deleteDeal(d.id)} onToggle={()=>toggleDeal(d.id,true)}/>)}</div></div>}
      {modal!==null&&<DealModal deal={modal} onSave={saveDeal} onClose={()=>setModal(null)}/>}
    </div>
  );
}
function DealCard({deal,inactive,onEdit,onDelete,onToggle}) {
  const expired=deal.expiry&&deal.expiry<todayStr();
  return (
    <div style={{background:T.white,border:"1px solid "+(inactive?"#E8E8E8":T.gold),borderRadius:12,overflow:"hidden",opacity:inactive?0.7:1}}>
      {!inactive&&<div style={{height:2,background:"linear-gradient(to right,"+T.gold+",#E8D89A,"+T.gold+")"}}/>}
      <div style={{padding:"13px 17px",display:"flex",alignItems:"center",gap:13,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:150}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:T.charcoal}}>{deal.name}</div>
            {expired&&<span style={{fontSize:9,letterSpacing:1,padding:"1px 6px",borderRadius:10,background:T.redLight,color:T.red,textTransform:"uppercase"}}>Expired</span>}
          </div>
          {deal.description&&<div style={{fontSize:12,color:T.grayLight,marginBottom:3}}>{deal.description}</div>}
          {deal.expiry&&<div style={{fontSize:11,color:expired?T.red:T.gold}}>Expires {fmtDate(deal.expiry)}</div>}
        </div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:T.charcoal}}>{fmt(deal.price)}</div>
        <div style={{display:"flex",gap:5}}>
          <button className="outline-btn" onClick={onToggle} style={{...S.outlineBtn,fontSize:11,padding:"4px 9px",color:inactive?T.green:T.grayLight,borderColor:inactive?"#A8D4B0":"#E8E8E8"}}>{inactive?"Activate":"Deactivate"}</button>
          <button className="outline-btn" onClick={onEdit} style={{...S.outlineBtn,fontSize:11,padding:"4px 9px"}}>Edit</button>
          <button className="outline-btn" onClick={onDelete} style={{...S.outlineBtn,fontSize:11,padding:"4px 9px",color:T.red,borderColor:"#D4A0A0"}}>Delete</button>
        </div>
      </div>
    </div>
  );
}
function DealModal({deal,onSave,onClose}) {
  const [form,setForm]=useState({id:deal.id||"",name:deal.name||"",price:deal.price||"",description:deal.description||"",expiry:deal.expiry||"",active:deal.active!==undefined?deal.active:true});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const valid=form.name&&form.price;
  const handleSave=async()=>{if(!valid)return;setSaving(true);await onSave({...form,price:Number(form.price)});setSaving(false);onClose();};
  return (
    <Modal title={form.id?"Edit Deal":"New Deal"} onClose={onClose}>
      <div style={{display:"grid",gap:12}}>
        <div><FieldLabel>Deal Name *</FieldLabel><input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Summer Glow Package" style={S.input}/></div>
        <div><FieldLabel>Price (Rs.) *</FieldLabel><input type="number" inputMode="numeric" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="e.g. 8000" style={S.input}/></div>
        <div><FieldLabel>Description</FieldLabel><textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={2} placeholder="What's included…" style={{...S.input,resize:"vertical"}}/></div>
        <div><FieldLabel>Expiry Date</FieldLabel><input type="date" value={form.expiry} onChange={e=>set("expiry",e.target.value)} style={S.input}/></div>
        {form.name&&form.price&&<div style={{background:"#FFFDF7",border:"1px solid "+T.gold,borderRadius:8,padding:"10px 13px"}}><div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:T.gold,marginBottom:5}}>Preview</div><div style={{fontSize:13,color:T.charcoal,fontWeight:"500"}}>{form.name}</div>{form.description&&<div style={{fontSize:11,color:T.grayLight,marginTop:1}}>{form.description}</div>}<div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:T.charcoal,marginTop:3}}>{fmt(Number(form.price)||0)}</div></div>}
      </div>
      <div style={{display:"flex",gap:7,justifyContent:"flex-end",marginTop:16}}>
        <button className="outline-btn" onClick={onClose} style={S.outlineBtn}>Cancel</button>
        <button className="gold-btn" onClick={handleSave} disabled={!valid||saving} style={{...S.goldBtn,opacity:valid&&!saving?1:0.4}}>{saving?"Saving…":form.id?"Update":"Add Deal"}</button>
      </div>
    </Modal>
  );
}

/* ════════════════ FINANCES TAB ════════════════ */
function FinancesTab({invoices}) {
  const [period,setPeriod]=useState("monthly");
  const paid=invoices.filter(i=>i.status==="paid");
  const grouped=paid.reduce((acc,inv)=>{const key=period==="daily"?inv.date:period==="weekly"?weekStart(inv.date):inv.date?.slice(0,7);if(!key)return acc;acc[key]=(acc[key]||0)+Number(inv.amount);return acc;},{});
  const keys=Object.keys(grouped).sort(); const maxVal=Math.max(...Object.values(grouped),1);
  const labelFor=k=>period==="daily"?fmtDate(k):period==="weekly"?"W/c "+fmtDate(k):monthStr(k+"-01");
  const total=paid.reduce((s,i)=>s+Number(i.amount),0);
  const month=paid.filter(i=>i.date?.startsWith(todayStr().slice(0,7))).reduce((s,i)=>s+Number(i.amount),0);
  const week=paid.filter(i=>i.date&&weekStart(i.date)===weekStart(todayStr())).reduce((s,i)=>s+Number(i.amount),0);
  const today=paid.filter(i=>i.date===todayStr()).reduce((s,i)=>s+Number(i.amount),0);
  const svcRev=paid.reduce((acc,inv)=>{parseServices(inv.services_json).forEach(s=>{const n=s.name||"Unknown";acc[n]=(acc[n]||0)+Number(s.price||0);});return acc;},{});
  const top=Object.entries(svcRev).sort((a,b)=>b[1]-a[1]).slice(0,5);
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <SectionHeader title="Finances"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:11,marginBottom:18}}>
        {[["Today",fmt(today)],["This Week",fmt(week)],["This Month",fmt(month)],["All Time",fmt(total)]].map(([l,v])=>(
          <div key={l} style={{background:T.white,border:"1px solid #E8E8E8",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:T.grayLight,marginBottom:4}}>{l}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:T.charcoal}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{background:T.white,border:"1px solid #E8E8E8",borderRadius:14,padding:18,marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:T.charcoal}}>Revenue Over Time</div>
          <div style={{display:"flex",gap:4}}>
            {["daily","weekly","monthly"].map(p=>(
              <button key={p} onClick={()=>setPeriod(p)} style={{...S.outlineBtn,padding:"5px 9px",fontSize:11,background:period===p?T.charcoal:"transparent",color:period===p?T.white:T.charcoal,borderColor:period===p?T.charcoal:"#E8E8E8",textTransform:"capitalize"}}>{p.charAt(0).toUpperCase()+p.slice(1)}</button>
            ))}
          </div>
        </div>
        {keys.length===0?<div style={{textAlign:"center",padding:"28px 0",color:T.grayLight,fontSize:13}}>No paid invoices yet</div>:(
          <div style={{display:"flex",alignItems:"flex-end",gap:5,height:130,overflowX:"auto",paddingBottom:6}}>
            {keys.map(k=>{const v=grouped[k];const bh=Math.max(4,(v/maxVal)*110);const cur=(period==="daily"&&k===todayStr())||(period==="weekly"&&k===weekStart(todayStr()))||(period==="monthly"&&k===todayStr().slice(0,7));return(
              <div key={k} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,minWidth:34,flex:period==="monthly"?"1":"0 0 auto"}}>
                <div style={{fontSize:8,color:T.grayLight,whiteSpace:"nowrap"}}>{fmt(v).replace("Rs. ","")}</div>
                <div style={{width:"100%",maxWidth:34,height:bh,background:cur?T.gold:"#111",borderRadius:"3px 3px 0 0",opacity:cur?1:.7}}/>
                <div style={{fontSize:8,color:T.grayLight,textAlign:"center",whiteSpace:"nowrap",maxWidth:44,overflow:"hidden",textOverflow:"ellipsis"}}>{labelFor(k)}</div>
              </div>
            );})}
          </div>
        )}
      </div>
      {top.length>0&&(
        <div style={{background:T.white,border:"1px solid #E8E8E8",borderRadius:14,padding:18}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:T.charcoal,marginBottom:13}}>Top Services by Revenue</div>
          <div style={{display:"grid",gap:10}}>
            {top.map(([name,amount],idx)=>{const pct=Math.round((amount/total)*100);return(
              <div key={name}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:T.charcoal,display:"flex",gap:5}}><span style={{color:T.grayLight}}>#{idx+1}</span>{name}</span><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13}}>{fmt(amount)}</span></div>
                <div style={{height:4,background:"#E8E8E8",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:T.charcoal,borderRadius:2}}/></div>
              </div>
            );})}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════ SETTINGS TAB ════════════════ */
function SettingsTab({managerName,onUpdate,showToast}) {
  const [name,setName]=useState(managerName); const [saved,setSaved]=useState(false);
  const save=()=>{if(!name.trim())return;onUpdate(name.trim());setSaved(true);showToast("Manager name updated ✦");setTimeout(()=>setSaved(false),2000);};
  return (
    <div style={{animation:"fadeUp .3s ease",maxWidth:380}}>
      <SectionHeader title="Settings"/>
      <div style={{background:T.white,border:"1px solid #E8E8E8",borderRadius:12,padding:20}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:T.charcoal,marginBottom:3}}>Manager Name</div>
        <div style={{fontSize:13,color:T.grayLight,marginBottom:13}}>Shown on the manager's welcome screen</div>
        <FieldLabel>Name</FieldLabel>
        <input value={name} onChange={e=>{setName(e.target.value);setSaved(false);}} placeholder="Manager name" style={{...S.input,marginBottom:11}}/>
        <button className="gold-btn" onClick={save} style={{...S.goldBtn,width:"100%"}}>{saved?"✓ Saved":"Save Name"}</button>
      </div>
    </div>
  );
}

/* ════════════════ SHARED SMALL COMPONENTS ════════════════ */
function ClientModal({data,onSave,onClose}) {
  const [form,setForm]=useState({id:data.id||"",name:data.name||"",phone:data.phone||"",email:data.email||"",notes:data.notes||""});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSave=async()=>{if(!form.name)return;setSaving(true);await onSave(form);setSaving(false);};
  return (
    <Modal title={form.id?"Edit Client":"New Client"} onClose={onClose}>
      <div style={{display:"grid",gap:11}}>
        {[
          ["name","Full Name","Your name","text","name"],
          ["phone","Phone","03001234567","tel","tel"],
          ["email","Email","hello@example.com","email","email"]
        ].map(([k,l,ph,type,ac])=>(
          <div key={k}><FieldLabel>{l}</FieldLabel><input type={type} inputMode={type==="tel"?"tel":type==="email"?"email":"text"} autoComplete={ac} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} style={S.input}/></div>
        ))}
        <div><FieldLabel>Notes</FieldLabel><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} style={{...S.input,resize:"vertical"}}/></div>
      </div>
      <div style={{display:"flex",gap:7,justifyContent:"flex-end",marginTop:14}}>
        <button className="outline-btn" onClick={onClose} style={S.outlineBtn}>Cancel</button>
        <button className="gold-btn" onClick={handleSave} disabled={!form.name||saving} style={{...S.goldBtn,opacity:form.name&&!saving?1:0.4}}>{saving?"Saving…":"Save"}</button>
      </div>
    </Modal>
  );
}

function Modal({title,children,onClose}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadeIn .2s ease"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:16,width:"100%",maxWidth:480,padding:26,boxShadow:"0 24px 64px rgba(0,0,0,.1)",animation:"fadeUp .25s ease",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:T.charcoal,marginBottom:16}}>{title}</div>
        {children}
      </div>
    </div>
  );
}
function NavButtons({step,setStep,canNext}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",marginTop:22}}>
      <button className="outline-btn" onClick={()=>setStep(s=>s-1)} style={S.outlineBtn}>← Back</button>
      <button className="gold-btn" onClick={()=>canNext&&setStep(s=>s+1)} style={{...S.goldBtn,opacity:canNext?1:0.4,cursor:canNext?"pointer":"not-allowed"}}>Continue →</button>
    </div>
  );
}
function SectionHeader({title,action}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,color:T.charcoal}}>{title}</div>
      {action}
    </div>
  );
}
function PageTitle({children,style}){return<div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:T.charcoal,marginBottom:16,letterSpacing:0.5,...style}}>{children}</div>;}
function FieldLabel({children}){return<div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:T.grayLight,marginBottom:5}}>{children}</div>;}
function Empty({icon,text}){return<div style={{textAlign:"center",padding:"44px 0"}}><div style={{fontSize:30,marginBottom:9}}>{icon}</div><div style={{fontSize:13,letterSpacing:1,color:T.grayLight}}>{text}</div></div>;}

const S={
  goldBtn:    {background:T.charcoal,border:"none",color:T.white,padding:"11px 20px",borderRadius:8,cursor:"pointer",fontSize:13,letterSpacing:".5px",fontFamily:"'Jost',sans-serif",fontWeight:"400",transition:"all .2s"},
  outlineBtn: {background:"transparent",border:"1px solid #E8E8E8",color:T.charcoal,padding:"11px 18px",borderRadius:8,cursor:"pointer",fontSize:13,letterSpacing:".5px",fontFamily:"'Jost',sans-serif",fontWeight:"300",transition:"all .2s"},
  input:      {width:"100%",background:T.white,border:"1px solid #E8E8E8",borderRadius:8,color:T.charcoal,padding:"11px 13px",fontSize:14,fontFamily:"'Jost',sans-serif",outline:"none",transition:"border-color .2s"},
};
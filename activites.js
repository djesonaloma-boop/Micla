"use strict";
const KEY="micla_activities";
const box=document.getElementById("activities-container");
function get(){try{const v=JSON.parse(localStorage.getItem(KEY));return Array.isArray(v)?v:[]}catch{return[]}}
function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function dateFR(v){if(!v)return "";const d=new Date(v+"T00:00:00");return isNaN(d)?v:d.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})}
function render(){
 const items=get().filter(x=>x&&x.active!==false);
 if(!items.length){box.innerHTML=`<div class="empty"><div class="empty-icon">⭐</div><h2>Aucune activité publiée</h2><p>Les activités et annonces seront affichées ici dès leur publication par l'administration.</p></div>`;return}
 box.innerHTML=items.map(x=>{
  const poster=x.poster?`<img src="${x.poster}" alt="${esc(x.title||"Activité")}" style="width:100%;border-radius:15px;max-height:360px;object-fit:cover;">`:"";
  const wa=x.whatsapp?`<a class="button button-whatsapp" href="${/^https?:\/\//i.test(x.whatsapp)?x.whatsapp:"https://wa.me/"+String(x.whatsapp).replace(/\D/g,"")}" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>`:"";
  const link=x.link?`<a class="button button-link" href="${x.link}" target="_blank" rel="noopener noreferrer">🔗 Ouvrir le lien</a>`:"";
  const video=x.video?`<div class="video-box"><video controls preload="metadata" src="${x.video}"></video></div>`:"";
  return `<article class="activity-card" style="margin-bottom:18px;padding:20px;border:1px solid rgba(255,255,255,.07);border-radius:22px;background:linear-gradient(145deg,rgba(18,35,60,.94),rgba(9,16,28,.96));animation:cardAppear .5s ease both;">
   ${poster}<div class="activity-content" style="padding-top:${poster?"18px":"0"}">
   <div style="color:#d8b45a;font-size:10px;font-weight:800;letter-spacing:1.5px;">${esc(x.type||"Activité")}</div>
   <h2 class="activity-title" style="margin:8px 0;color:white;">${esc(x.title||"Activité")}</h2>
   ${x.description?`<p class="description" style="color:#8996aa;line-height:1.7;">${esc(x.description)}</p>`:""}
   <div class="information-box">
   ${x.date?`<div class="information">📅 <strong>Date :</strong> ${esc(dateFR(x.date))}</div>`:""}
   ${x.time?`<div class="information">🕐 <strong>Heure :</strong> ${esc(x.time)}</div>`:""}
   ${x.location?`<div class="information">📍 <strong>Lieu :</strong> ${esc(x.location)}</div>`:""}
   </div>${video}<div class="buttons">${wa}${link}</div></div></article>`
 }).join("")
}
window.addEventListener("storage",render);render();

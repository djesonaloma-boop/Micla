"use strict";
const KEY="micla_global_announcements";
const title=document.getElementById("title");
const message=document.getElementById("message");
const list=document.getElementById("list");
const statusBox=document.getElementById("status");
const save=document.getElementById("save");
const cancel=document.getElementById("cancel");
const formTitle=document.getElementById("formTitle");
let editingId=null;
function get(){try{const v=JSON.parse(localStorage.getItem(KEY));return Array.isArray(v)?v:[]}catch{return[]}}
function set(v){localStorage.setItem(KEY,JSON.stringify(v))}
function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function show(t){statusBox.textContent=t;statusBox.className="status show";setTimeout(()=>statusBox.className="status",2500)}
function render(){
 const data=get();
 list.innerHTML=data.length?data.map(x=>`<article class="item"><strong>${esc(x.title||"Annonce")}</strong><p class="muted">${esc(x.message||"")}</p><button onclick="editAnnouncement('${esc(x.id)}')">✏️ Modifier</button><button class="danger" onclick="deleteAnnouncement('${esc(x.id)}')">🗑️ Supprimer</button></article>`).join(""):'<p class="muted">Aucune annonce publiée.</p>';
}
function reset(){editingId=null;title.value="";message.value="";save.textContent="📢 Publier";cancel.style.display="none";formTitle.textContent="Nouvelle annonce"}
save.onclick=()=>{
 const t=title.value.trim(), m=message.value.trim();
 if(!t||!m){show("Le titre et le message sont obligatoires.");return}
 let data=get();
 if(editingId){const i=data.findIndex(x=>String(x.id)===String(editingId));if(i>=0)data[i]={...data[i],title:t,message:m,updatedAt:new Date().toISOString(),active:true,published:true}}
 else data.unshift({id:Date.now().toString(),title:t,message:m,active:true,published:true,createdAt:new Date().toISOString()});
 set(data);reset();render();show("Annonce enregistrée.");};
cancel.onclick=reset;
window.editAnnouncement=id=>{const x=get().find(x=>String(x.id)===String(id));if(!x)return;editingId=x.id;title.value=x.title||"";message.value=x.message||"";save.textContent="💾 Enregistrer";cancel.style.display="inline-block";formTitle.textContent="Modifier l'annonce";scrollTo({top:0,behavior:"smooth"})};
window.deleteAnnouncement=id=>{if(!confirm("Supprimer cette annonce ?"))return;set(get().filter(x=>String(x.id)!==String(id)));render();show("Annonce supprimée.")};
window.addEventListener("storage",render);
render();

const KEY="micla_preachings";

const form=document.getElementById("form");
const id=document.getElementById("id");
const title=document.getElementById("title");
const preacher=document.getElementById("preacher");
const verse=document.getElementById("verse");
const messageField=document.getElementById("message");
const audio=document.getElementById("audio");
const video=document.getElementById("video");
const list=document.getElementById("preachings");
const status=document.getElementById("status");
const formTitle=document.getElementById("formTitle");
const save=document.getElementById("save");
const cancel=document.getElementById("cancel");

let editing=null;

function getData(){
try{return JSON.parse(localStorage.getItem(KEY))||[]}
catch(e){return []}
}

function saveData(data){
localStorage.setItem(KEY,JSON.stringify(data));
}

function esc(v){
return String(v||"").replace(/[&<>"']/g,m=>({
"&":"&amp;","<":"&lt;",">":"&gt;",
'"':"&quot;","'":"&#039;"
}[m]));
}

function msg(t){
status.textContent=t;
status.className="status show";
setTimeout(()=>status.className="status",2500);
}

form.addEventListener("submit",e=>{
e.preventDefault();

let data=getData();

const old=editing
?data.find(x=>String(x.id)===String(editing))
:null;

const item={
id:editing||Date.now().toString(),
title:title.value.trim(),
preacher:preacher.value.trim(),
verse:verse.value.trim(),
message:messageField.value.trim(),
audio:audio.value.trim(),
video:video.value.trim(),
active:old?old.active!==false:true,
createdAt:old?old.createdAt:new Date().toISOString(),
updatedAt:new Date().toISOString()
};

const index=data.findIndex(x=>String(x.id)===String(item.id));

if(index>=0){
data[index]=item;
msg("Prédication modifiée.");
}else{
data.unshift(item);
msg("Prédication publiée.");
}

saveData(data);
reset();
render();
});

function render(){
const data=getData();

if(!data.length){
list.innerHTML=`
<div class="empty">
<div style="font-size:38px">🎙️</div>
<p>Aucune prédication enregistrée.</p>
</div>`;
return;
}

list.innerHTML=data.map(item=>`
<article class="preaching">
<div class="icon">🎙️</div>
<h3>${esc(item.title)}</h3>
<p>${esc(item.message)}</p>

<div class="meta">
${item.preacher?`<div>👤 ${esc(item.preacher)}</div>`:""}
${item.verse?`<div>📖 ${esc(item.verse)}</div>`:""}
${item.audio?`<div>🎧 Audio disponible</div>`:""}
${item.video?`<div>🎥 Vidéo disponible</div>`:""}
</div>

<div class="buttons">
<button class="edit" onclick="editPreaching('${item.id}')">✏️ Modifier</button>
<button class="toggle" onclick="togglePreaching('${item.id}')">
${item.active!==false?"👁️ Publiée":"🚫 Masquée"}
</button>
<button class="delete" onclick="deletePreaching('${item.id}')">🗑️ Supprimer</button>
</div>
</article>
`).join("");
}

function editPreaching(itemId){
const item=getData().find(x=>String(x.id)===String(itemId));
if(!item)return;

editing=item.id;
id.value=item.id;
title.value=item.title||"";
preacher.value=item.preacher||"";
verse.value=item.verse||"";
messageField.value=item.message||"";
audio.value=item.audio||"";
video.value=item.video||"";

formTitle.textContent="✏️ Modifier la prédication";
save.textContent="Enregistrer";
cancel.classList.remove("hidden");

scrollTo({top:0,behavior:"smooth"});
}

function reset(){
form.reset();
editing=null;
id.value="";
formTitle.textContent="🎙️ Nouvelle prédication";
save.textContent="Publier";
cancel.classList.add("hidden");
}

cancel.onclick=reset;

function togglePreaching(itemId){
let data=getData();
const index=data.findIndex(x=>String(x.id)===String(itemId));
if(index<0)return;

data[index].active=data[index].active===false;
saveData(data);
render();
msg(data[index].active?"Prédication publiée.":"Prédication masquée.");
}

function deletePreaching(itemId){
const item=getData().find(x=>String(x.id)===String(itemId));
if(!item)return;

if(!confirm(`Supprimer "${item.title}" ?`))return;

saveData(getData().filter(x=>String(x.id)!==String(itemId)));
render();
msg("Prédication supprimée.");
}

document.getElementById("menu").onclick=()=>{
document.getElementById("nav").classList.toggle("open");
};

window.editPreaching=editPreaching;
window.togglePreaching=togglePreaching;
window.deletePreaching=deletePreaching;

render();
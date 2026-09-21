const KEY="micla_gallery";

const form=document.getElementById("form");
const id=document.getElementById("id");
const title=document.getElementById("title");
const description=document.getElementById("description");
const photo=document.getElementById("photo");
const preview=document.getElementById("preview");
const gallery=document.getElementById("gallery");
const status=document.getElementById("status");
const formTitle=document.getElementById("formTitle");
const save=document.getElementById("save");
const cancel=document.getElementById("cancel");

let imageData="";
let editing=null;

function getData(){
try{return JSON.parse(localStorage.getItem(KEY))||[]}
catch(e){return []}
}

function saveData(data){
localStorage.setItem(KEY,JSON.stringify(data));
}

function message(txt){
status.textContent=txt;
status.className="status show";
setTimeout(()=>status.className="status",2500);
}

function esc(v){
return String(v||"").replace(/[&<>"']/g,m=>({
"&":"&amp;","<":"&lt;",">":"&gt;",
'"':"&quot;","'":"&#039;"
}[m]));
}

photo.addEventListener("change",()=>{
const file=photo.files[0];
if(!file)return;

if(!file.type.startsWith("image/")){
message("Fichier image invalide.");
return;
}

const reader=new FileReader();
reader.onload=e=>{
imageData=e.target.result;
preview.src=imageData;
preview.style.display="block";
};
reader.readAsDataURL(file);
});

form.addEventListener("submit",e=>{
e.preventDefault();

if(!imageData && !editing){
message("Sélectionne une photo.");
return;
}

let data=getData();

const old=editing
? data.find(x=>String(x.id)===String(editing))
:null;

const item={
id:editing||Date.now().toString(),
title:title.value.trim()||"Photo MI.C.L.A",
description:description.value.trim(),
photo:imageData||old.photo,
active:old?old.active!==false:true,
createdAt:old?old.createdAt:new Date().toISOString(),
updatedAt:new Date().toISOString()
};

const index=data.findIndex(x=>String(x.id)===String(item.id));

if(index>=0){
data[index]=item;
message("Photo modifiée avec succès.");
}else{
data.unshift(item);
message("Photo publiée avec succès.");
}

saveData(data);
reset();
render();
});

function render(){
const data=getData();

if(!data.length){
gallery.innerHTML=`
<div class="empty">
<div style="font-size:38px">🖼️</div>
<p>Aucune photo dans la galerie.</p>
</div>`;
return;
}

gallery.innerHTML=data.map(item=>{
const active=item.active!==false;

return `
<article class="photo">
<img src="${item.photo}" alt="${esc(item.title)}">
<div class="body">
<h3>${esc(item.title)}</h3>
<p>${esc(item.description)}</p>

<div class="buttons">
<button class="edit" onclick="editPhoto('${item.id}')">✏️ Modifier</button>
<button class="toggle" onclick="togglePhoto('${item.id}')">
${active?"👁️ Publiée":"🚫 Masquée"}
</button>
<button class="delete" onclick="deletePhoto('${item.id}')">🗑️ Supprimer</button>
</div>
</div>
</article>`;
}).join("");
}

function editPhoto(itemId){
const item=getData().find(x=>String(x.id)===String(itemId));
if(!item)return;

editing=item.id;
id.value=item.id;
title.value=item.title||"";
description.value=item.description||"";
imageData=item.photo||"";

preview.src=imageData;
preview.style.display="block";

photo.required=false;
formTitle.textContent="✏️ Modifier la photo";
save.textContent="Enregistrer";
cancel.classList.remove("hidden");

window.scrollTo({top:0,behavior:"smooth"});
}

cancel.onclick=reset;

function reset(){
form.reset();
editing=null;
id.value="";
imageData="";
preview.removeAttribute("src");
preview.style.display="none";
photo.required=true;
formTitle.textContent="➕ Ajouter une photo";
save.textContent="Publier la photo";
cancel.classList.add("hidden");
}

function togglePhoto(itemId){
let data=getData();
const index=data.findIndex(x=>String(x.id)===String(itemId));
if(index<0)return;

data[index].active=data[index].active===false;
saveData(data);
render();
message(data[index].active?"Photo publiée.":"Photo masquée.");
}

function deletePhoto(itemId){
const item=getData().find(x=>String(x.id)===String(itemId));
if(!item)return;

if(!confirm(`Supprimer "${item.title}" ?`))return;

saveData(getData().filter(x=>String(x.id)!==String(itemId)));
render();
message("Photo supprimée.");
}

document.getElementById("menu").onclick=()=>{
document.getElementById("nav").classList.toggle("open");
};

window.editPhoto=editPhoto;
window.togglePhoto=togglePhoto;
window.deletePhoto=deletePhoto;

render();
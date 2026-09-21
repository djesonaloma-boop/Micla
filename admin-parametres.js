const KEY="micla_settings";

const form=document.getElementById("form");
const churchName=document.getElementById("churchName");
const subtitle=document.getElementById("subtitle");
const welcome=document.getElementById("welcome");
const phone=document.getElementById("phone");
const whatsapp=document.getElementById("whatsapp");
const status=document.getElementById("status");

function getSettings(){
try{
return JSON.parse(localStorage.getItem(KEY))||{};
}catch(e){
return {};
}
}

function render(){

const data=getSettings();

churchName.value=data.churchName||"";
subtitle.value=data.subtitle||"";
welcome.value=data.welcome||"";
phone.value=data.phone||"";
whatsapp.value=data.whatsapp||"";

}

function message(text){

status.textContent=text;
status.className="status show";

setTimeout(()=>{
status.className="status";
},3000);

}

form.addEventListener("submit",e=>{

e.preventDefault();

const data={
churchName:churchName.value.trim(),
subtitle:subtitle.value.trim(),
welcome:welcome.value.trim(),
phone:phone.value.trim(),
whatsapp:whatsapp.value.trim(),
updatedAt:new Date().toISOString()
};

localStorage.setItem(KEY,JSON.stringify(data));

message("Les paramètres ont été enregistrés.");

});

document.getElementById("export").addEventListener("click",()=>{

const allData={};

for(let i=0;i<localStorage.length;i++){

const key=localStorage.key(i);

if(key && key.startsWith("micla_")){

try{
allData[key]=JSON.parse(localStorage.getItem(key));
}catch(e){
allData[key]=localStorage.getItem(key);
}

}

}

const json=JSON.stringify(allData,null,2);

const blob=new Blob([json],{
type:"application/json"
});

const url=URL.createObjectURL(blob);

const a=document.createElement("a");

a.href=url;
a.download="micla-sauvegarde.json";

document.body.appendChild(a);
a.click();
a.remove();

URL.revokeObjectURL(url);

message("Sauvegarde exportée.");

});

document.getElementById("clear").addEventListener("click",()=>{

const confirmed=confirm(
"ATTENTION : cette action va supprimer toutes les données MI.C.L.A enregistrées dans ce navigateur. Continuer ?"
);

if(!confirmed)return;

const keys=[];

for(let i=0;i<localStorage.length;i++){

const key=localStorage.key(i);

if(key && key.startsWith("micla_")){
keys.push(key);
}

}

keys.forEach(key=>localStorage.removeItem(key));

render();

message("Les données locales MI.C.L.A ont été supprimées.");

});

document.getElementById("menu").onclick=()=>{
document.getElementById("nav").classList.toggle("open");
};

render();
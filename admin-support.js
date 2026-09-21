const KEY="micla_support";

const form=document.getElementById("form");
const nameField=document.getElementById("name");
const phone=document.getElementById("phone");
const whatsapp=document.getElementById("whatsapp");
const email=document.getElementById("email");
const messageField=document.getElementById("message");
const status=document.getElementById("status");

const previewName=document.getElementById("previewName");
const previewPhone=document.getElementById("previewPhone");
const previewEmail=document.getElementById("previewEmail");
const previewMessage=document.getElementById("previewMessage");

function getData(){
try{
return JSON.parse(localStorage.getItem(KEY))||{};
}catch(e){
return {};
}
}

function render(){
const data=getData();

nameField.value=data.name||"";
phone.value=data.phone||"";
whatsapp.value=data.whatsapp||"";
email.value=data.email||"";
messageField.value=data.message||"";

previewName.textContent=data.name||"Non configuré";
previewPhone.textContent=data.phone||"Non configuré";
previewEmail.textContent=data.email||"Non configuré";
previewMessage.textContent=data.message||"Aucun message";
}

form.addEventListener("submit",e=>{
e.preventDefault();

const data={
name:nameField.value.trim(),
phone:phone.value.trim(),
whatsapp:whatsapp.value.trim(),
email:email.value.trim(),
message:messageField.value.trim(),
updatedAt:new Date().toISOString()
};

localStorage.setItem(KEY,JSON.stringify(data));

status.textContent="Informations du support enregistrées.";
status.className="status show";

render();

setTimeout(()=>{
status.className="status";
},2500);
});

document.getElementById("menu").onclick=()=>{
document.getElementById("nav").classList.toggle("open");
};

render();
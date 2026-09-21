/* MICLA — Administration
   Code secret: MICLA123@
*/
const MICLA_ADMIN_CODE = "MICLA123@";

function miclaLogin(code){
  if(code === MICLA_ADMIN_CODE){
    sessionStorage.setItem("micla_admin_auth","1");
    return true;
  }
  return false;
}
function miclaLogout(){
  sessionStorage.removeItem("micla_admin_auth");
  window.location.href = "admin.html";
}
function requireMiclaAdmin(){
  if(sessionStorage.getItem("micla_admin_auth") !== "1"){
    const code = prompt("Administration MI.C.L.A — Entrez le code secret :");
    if(!miclaLogin(code || "")){
      alert("Code secret incorrect.");
      window.location.href = "admin.html";
      return false;
    }
  }
  return true;
}
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-micla-logout]").forEach(btn => {
    btn.addEventListener("click", miclaLogout);
  });
});

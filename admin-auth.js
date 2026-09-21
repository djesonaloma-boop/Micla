/* MI.C.L.A — Protection espace administration */
(function(){
  'use strict';
  const SECRET = 'MICLA123@';
  const SESSION_KEY = 'micla_admin_authenticated';

  function showLogin(){
    if(document.getElementById('miclaAdminLogin')) return;
    const overlay=document.createElement('div');
    overlay.id='miclaAdminLogin';
    overlay.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(2,8,20,.97);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Arial,sans-serif;';
    overlay.innerHTML=`<div style="width:min(430px,100%);background:#0b1830;border:1px solid rgba(216,173,85,.35);border-radius:20px;padding:28px;box-shadow:0 25px 80px rgba(0,0,0,.5);color:#fff;text-align:center">
      <img src="admin-logo.png" alt="MI.C.L.A" style="width:76px;height:76px;object-fit:cover;border-radius:50%;margin-bottom:12px">
      <h2 style="margin:0 0 8px">Espace Administration</h2>
      <p style="color:#aebbd0;margin:0 0 20px">Entrez le code secret MI.C.L.A pour continuer.</p>
      <input id="miclaAdminPassword" type="password" autocomplete="current-password" placeholder="Code secret" style="width:100%;box-sizing:border-box;padding:14px;border-radius:12px;border:1px solid #30415e;background:#071224;color:#fff;outline:none;font-size:16px">
      <button id="miclaAdminLoginBtn" type="button" style="width:100%;margin-top:12px;padding:14px;border:0;border-radius:12px;background:#d8ad55;color:#071224;font-weight:800;cursor:pointer;font-size:16px">🔐 Ouvrir l'administration</button>
      <div id="miclaAdminError" style="min-height:22px;margin-top:12px;color:#ff9aa5"></div>
    </div>`;
    document.body.appendChild(overlay);
    const input=document.getElementById('miclaAdminPassword');
    const error=document.getElementById('miclaAdminError');
    const login=()=>{
      if(input.value===SECRET){
        sessionStorage.setItem(SESSION_KEY,'1');
        overlay.remove();
      }else{
        error.textContent='❌ Code secret incorrect.';
        input.value=''; input.focus();
      }
    };
    document.getElementById('miclaAdminLoginBtn').addEventListener('click',login);
    input.addEventListener('keydown',e=>{if(e.key==='Enter') login();});
    setTimeout(()=>input.focus(),50);
  }

  function protect(){
    if(sessionStorage.getItem(SESSION_KEY)!=='1') showLogin();
  }

  window.MICLAAdminAuth={logout:function(){sessionStorage.removeItem(SESSION_KEY);location.href='admin.html';}};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',protect); else protect();
})();

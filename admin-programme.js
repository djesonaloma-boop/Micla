document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     MENU
  ========================= */

  const menu = document.getElementById("menu");
  const links = document.getElementById("links");

  menu?.addEventListener("click", () => {
    links.classList.toggle("open");
  });


  /* =========================
     ANNÉE
  ========================= */

  document.getElementById("year").textContent =
    new Date().getFullYear();


  /* =========================
     PROGRAMME PAR DÉFAUT
  ========================= */

  const defaultProgram = [

    {
      id:"monday",
      day:"Lundi",
      activity:"Intercession — Une Heure avec Jésus",
      time:"17h00 — 18h00"
    },

    {
      id:"tuesday",
      day:"Mardi",
      activity:"Partage biblique",
      time:"17h00 — 18h00"
    },

    {
      id:"wednesday",
      day:"Mercredi",
      activity:"Culte d’enseignement",
      time:"17h30 — 19h30"
    },

    {
      id:"thursday",
      day:"Jeudi",
      activity:"Intercession des serviteurs de Dieu",
      time:"17h00 — 18h00"
    },

    {
      id:"friday",
      day:"Vendredi",
      activity:"Culte de combat spirituel",
      time:"17h30 — 19h30"
    },

    {
      id:"saturday-morning",
      day:"Samedi",
      activity:"Réunion du département des Mamans",
      time:"08h30 — 12h00"
    },

    {
      id:"saturday-afternoon",
      day:"Samedi",
      activity:"Suivi et évangélisation",
      time:"14h30"
    },

    {
      id:"saturday-youth",
      day:"Samedi",
      activity:"Département de jeunesse",
      time:"16h30 — 17h30"
    },

    {
      id:"sunday",
      day:"Dimanche",
      activity:"Culte d’adoration et d’action de grâce",
      time:"07h30 — 10h30"
    }

  ];


  /* =========================
     CHARGER LES DONNÉES
  ========================= */

  let program =
    JSON.parse(
      localStorage.getItem("micla_week_program") || "null"
    );

  if (!Array.isArray(program)) {

    program = defaultProgram.map(item => ({
      ...item,

      preacher:"",
      moderator:"",
      protocol:"",
      security:"",
      singers:"",
      intercession:"",
      bibleReader:"",
      media:"",
      music:"",
      welcome:""
    }));

    saveProgram();
  }


  function saveProgram(){

    localStorage.setItem(
      "micla_week_program",
      JSON.stringify(program)
    );
  }


  /* =========================
     AFFICHER LES JOURS
  ========================= */

  const container =
    document.getElementById("daysContainer");


  function renderProgram(){

    container.innerHTML = "";

    program.forEach(item => {

      const card =
        document.createElement("div");

      card.className = "day-card";


      const roles = [];

      if(item.preacher)
        roles.push("Prédicateur : " + item.preacher);

      if(item.moderator)
        roles.push("Modérateur : " + item.moderator);

      if(item.protocol)
        roles.push("Protocole : " + item.protocol);

      if(item.security)
        roles.push("Sécurité : " + item.security);

      if(item.singers)
        roles.push("Chantres : " + item.singers);

      if(item.intercession)
        roles.push("Intercession : " + item.intercession);

      if(item.bibleReader)
        roles.push("Bible : " + item.bibleReader);

      if(item.media)
        roles.push("Média : " + item.media);

      if(item.music)
        roles.push("Musique : " + item.music);

      if(item.welcome)
        roles.push("Accueil : " + item.welcome);


      let chips = "";

      if(roles.length){

        chips = `
          <div class="roles">
            ${roles.map(role => `
              <span class="role">${escapeHTML(role)}</span>
            `).join("")}
          </div>
        `;

      }else{

        chips = `
          <div class="roles">
            <span class="role">
              Responsables non définis
            </span>
          </div>
        `;
      }


      card.innerHTML = `

        <div class="day-name">
          ${escapeHTML(item.day)}
        </div>

        <div class="activity">
          ${escapeHTML(item.activity)}
        </div>

        <div class="time">
          ${escapeHTML(item.time)}
        </div>

        ${chips}

        <button
          class="btn primary edit-button"
          data-id="${item.id}">
          Modifier cette journée
        </button>
      `;


      container.appendChild(card);

    });


    document
      .querySelectorAll(".edit-button")
      .forEach(button => {

        button.addEventListener("click", () => {

          openEditor(button.dataset.id);

        });

      });

  }


  /* =========================
     MODALE
  ========================= */

  const modal =
    document.getElementById("editModal");


  let currentId = null;


  function openEditor(id){

    const item =
      program.find(x => x.id === id);

    if(!item) return;

    currentId = id;

    document.getElementById("modalTitle").textContent =
      "Modifier " + item.day;


    document.getElementById("editDay").value =
      item.day || "";

    document.getElementById("editTime").value =
      item.time || "";

    document.getElementById("editActivity").value =
      item.activity || "";

    document.getElementById("editPreacher").value =
      item.preacher || "";

    document.getElementById("editModerator").value =
      item.moderator || "";

    document.getElementById("editProtocol").value =
      item.protocol || "";

    document.getElementById("editSecurity").value =
      item.security || "";

    document.getElementById("editSingers").value =
      item.singers || "";

    document.getElementById("editIntercession").value =
      item.intercession || "";

    document.getElementById("editBibleReader").value =
      item.bibleReader || "";

    document.getElementById("editMedia").value =
      item.media || "";

    document.getElementById("editMusic").value =
      item.music || "";

    document.getElementById("editWelcome").value =
      item.welcome || "";

    document.getElementById("dayStatus").textContent = "";

    modal.classList.add("open");
  }


  document
    .getElementById("closeModal")
    .addEventListener("click", closeModal);


  modal.addEventListener("click", event => {

    if(event.target === modal){
      closeModal();
    }

  });


  function closeModal(){

    modal.classList.remove("open");
    currentId = null;

  }


  /* =========================
     ENREGISTRER UNE JOURNÉE
  ========================= */

  document
    .getElementById("saveDay")
    .addEventListener("click", () => {

      const item =
        program.find(x => x.id === currentId);

      if(!item) return;


      item.time =
        document.getElementById("editTime").value.trim();

      item.activity =
        document.getElementById("editActivity").value.trim();

      item.preacher =
        document.getElementById("editPreacher").value.trim();

      item.moderator =
        document.getElementById("editModerator").value.trim();

      item.protocol =
        document.getElementById("editProtocol").value.trim();

      item.security =
        document.getElementById("editSecurity").value.trim();

      item.singers =
        document.getElementById("editSingers").value.trim();

      item.intercession =
        document.getElementById("editIntercession").value.trim();

      item.bibleReader =
        document.getElementById("editBibleReader").value.trim();

      item.media =
        document.getElementById("editMedia").value.trim();

      item.music =
        document.getElementById("editMusic").value.trim();

      item.welcome =
        document.getElementById("editWelcome").value.trim();


      saveProgram();

      renderProgram();


      document.getElementById("dayStatus").textContent =
        "✓ La journée a été enregistrée.";


      setTimeout(() => {
        closeModal();
      }, 700);

    });


  /* =========================
     RÉINITIALISER LA JOURNÉE
  ========================= */

  document
    .getElementById("resetDay")
    .addEventListener("click", () => {

      const item =
        program.find(x => x.id === currentId);

      if(!item) return;


      const original =
        defaultProgram.find(x => x.id === currentId);


      if(original){

        item.activity = original.activity;
        item.time = original.time;

        item.preacher = "";
        item.moderator = "";
        item.protocol = "";
        item.security = "";
        item.singers = "";
        item.intercession = "";
        item.bibleReader = "";
        item.media = "";
        item.music = "";
        item.welcome = "";

      }


      saveProgram();
      renderProgram();

      document.getElementById("dayStatus").textContent =
        "La journée a été réinitialisée.";

    });


  /* =========================
     ÉQUIPE PROTOCOLE
  ========================= */

  const protocolTeam =
    document.getElementById("protocolTeam");


  const savedProtocol =
    JSON.parse(
      localStorage.getItem("micla_protocol_team") || "[]"
    );


  if(Array.isArray(savedProtocol)){
    protocolTeam.value =
      savedProtocol.join("\n");
  }


  document
    .getElementById("saveProtocol")
    .addEventListener("click", () => {

      const members =
        protocolTeam.value
          .split("\n")
          .map(name => name.trim())
          .filter(Boolean);


      localStorage.setItem(
        "micla_protocol_team",
        JSON.stringify(members)
      );


      document.getElementById(
        "protocolStatus"
      ).textContent =
        "✓ Équipe du protocole enregistrée.";

    });


  /* =========================
     ÉQUIPE SÉCURITÉ
  ========================= */

  const securityTeam =
    document.getElementById("securityTeam");


  const savedSecurity =
    JSON.parse(
      localStorage.getItem("micla_security_team") || "[]"
    );


  if(Array.isArray(savedSecurity)){
    securityTeam.value =
      savedSecurity.join("\n");
  }


  document
    .getElementById("saveSecurity")
    .addEventListener("click", () => {

      const members =
        securityTeam.value
          .split("\n")
          .map(name => name.trim())
          .filter(Boolean);


      localStorage.setItem(
        "micla_security_team",
        JSON.stringify(members)
      );


      document.getElementById(
        "securityStatus"
      ).textContent =
        "✓ Équipe de sécurité enregistrée.";

    });


  /* =========================
     SÉCURITÉ HTML
  ========================= */

  function escapeHTML(value){

    return String(value || "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");

  }


  /* =========================
     COMPATIBILITÉ
     AVEC L'ANCIEN SYSTÈME
  ========================= */

  function syncOldKeys(){

    const protocol =
      JSON.parse(
        localStorage.getItem("micla_protocol") || "[]"
      );

    const security =
      JSON.parse(
        localStorage.getItem("micla_security") || "[]"
      );


    if(
      !localStorage.getItem("micla_protocol_team") &&
      Array.isArray(protocol)
    ){

      protocolTeam.value =
        protocol.join("\n");

    }


    if(
      !localStorage.getItem("micla_security_team") &&
      Array.isArray(security)
    ){

      securityTeam.value =
        security.join("\n");

    }

  }


  syncOldKeys();

  renderProgram();

});
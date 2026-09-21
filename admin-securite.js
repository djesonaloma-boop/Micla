/* =========================================================
   MI.C.L.A — CITÉ DE REFUGE
   ADMINISTRATION — SÉCURITÉ
   ========================================================= */

const SECURITY_KEY =
  "micla_security_department";

const MEMBERS_KEY =
  "micla_security_team";

let editingMemberId = null;


/* =========================================================
   OUTILS
   ========================================================= */

function getJSON(key, fallback) {

  try {

    const value =
      localStorage.getItem(key);

    return value
      ? JSON.parse(value)
      : fallback;

  } catch (error) {

    console.error(
      "Erreur localStorage :",
      error
    );

    return fallback;
  }
}


function saveJSON(key, value) {

  localStorage.setItem(
    key,
    JSON.stringify(value)
  );
}


function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function showStatus(
  id,
  message,
  type = "success"
) {

  const element =
    document.getElementById(id);

  if (!element) return;

  element.textContent =
    message;

  element.className =
    "status show " + type;

  setTimeout(() => {

    element.classList.remove(
      "show"
    );

  }, 3500);
}


function readImage(file) {

  return new Promise(
    (resolve, reject) => {

      if (!file) {

        resolve("");

        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {

        resolve(
          reader.result
        );
      };

      reader.onerror = () => {

        reject(
          reader.error
        );
      };

      reader.readAsDataURL(file);

    }
  );
}


/* =========================================================
   PRÉSENTATION
   ========================================================= */

function getDefaultSecurity() {

  return {

    title:
      "Département de Sécurité",

    description:
      "Le département de sécurité contribue à l'ordre, à l'organisation et à la sécurité des fidèles pendant les cultes et les activités de MI.C.L.A — Cité de Refuge.",

    mission:
      "Veiller à la sécurité et au bon déroulement",

    schedule:
      "Selon le programme de l'église",

    photo:
      "",

    updatedAt:
      new Date().toISOString()
  };
}


function loadSecurity() {

  const security =
    getJSON(
      SECURITY_KEY,
      getDefaultSecurity()
    );


  document.getElementById(
    "securityTitle"
  ).value =
    security.title || "";


  document.getElementById(
    "securityDescription"
  ).value =
    security.description || "";


  document.getElementById(
    "securityMission"
  ).value =
    security.mission || "";


  document.getElementById(
    "securitySchedule"
  ).value =
    security.schedule || "";


  const preview =
    document.getElementById(
      "securityPreview"
    );

  const box =
    document.getElementById(
      "securityPreviewBox"
    );


  if (security.photo) {

    preview.src =
      security.photo;

    box.style.display =
      "block";
  }
}


async function saveSecurity() {

  const oldSecurity =
    getJSON(
      SECURITY_KEY,
      getDefaultSecurity()
    );


  const file =
    document.getElementById(
      "securityPhoto"
    ).files[0];


  let photo =
    oldSecurity.photo || "";


  if (file) {

    photo =
      await readImage(file);
  }


  const security = {

    title:
      document.getElementById(
        "securityTitle"
      ).value.trim(),

    description:
      document.getElementById(
        "securityDescription"
      ).value.trim(),

    mission:
      document.getElementById(
        "securityMission"
      ).value.trim(),

    schedule:
      document.getElementById(
        "securitySchedule"
      ).value.trim(),

    photo,

    updatedAt:
      new Date().toISOString()
  };


  saveJSON(
    SECURITY_KEY,
    security
  );


  const preview =
    document.getElementById(
      "securityPreview"
    );

  const box =
    document.getElementById(
      "securityPreviewBox"
    );


  if (photo) {

    preview.src =
      photo;

    box.style.display =
      "block";
  }


  showStatus(
    "securityStatus",
    "La présentation de la sécurité a été enregistrée."
  );
}


function resetSecurity() {

  localStorage.removeItem(
    SECURITY_KEY
  );

  loadSecurity();

  showStatus(
    "securityStatus",
    "Les informations par défaut ont été restaurées."
  );
}


/* =========================================================
   MEMBRES
   ========================================================= */

function loadMembers() {

  const members =
    getJSON(
      MEMBERS_KEY,
      []
    );


  const container =
    document.getElementById(
      "membersList"
    );


  if (!members.length) {

    container.innerHTML = `
      <div class="empty">
        Aucun membre de l'équipe de sécurité
        n'est encore enregistré.
      </div>
    `;

    return;
  }


  container.innerHTML =
    members.map(
      member => {

        const photo =
          member.photo ||
          "logo.png";


        return `
          <article class="item">

            <div class="item-top">

              <img
                class="avatar"
                src="${photo}"
                alt="${escapeHTML(
                  member.name
                )}"
              >

              <div>

                <h3>
                  ${escapeHTML(
                    member.name
                  )}
                </h3>

                <div class="role">
                  ${escapeHTML(
                    member.role ||
                    "Membre de la sécurité"
                  )}
                </div>

              </div>

            </div>


            <p>
              <strong>
                Téléphone :
              </strong>

              ${escapeHTML(
                member.phone ||
                "Non renseigné"
              )}
            </p>


            <p>
              ${escapeHTML(
                member.description ||
                "Aucune description."
              )}
            </p>


            <div class="item-actions">

              ${
                member.phone
                ?
                `
                  <button
                    class="btn-success"
                    onclick="openWhatsApp('${escapeHTML(
                      member.phone
                    )}')"
                  >
                    WhatsApp
                  </button>
                `
                :
                ""
              }


              <button
                class="btn-secondary"
                onclick="editMember('${member.id}')"
              >
                Modifier
              </button>


              <button
                class="btn-danger"
                onclick="deleteMember('${member.id}')"
              >
                Supprimer
              </button>

            </div>

          </article>
        `;

      }
    ).join("");
}


/* =========================================================
   WHATSAPP
   ========================================================= */

function openWhatsApp(phone) {

  const number =
    String(phone || "")
      .replace(/\D/g, "");


  if (!number) return;


  window.open(
    "https://wa.me/" + number,
    "_blank"
  );
}


/* =========================================================
   AJOUT / MODIFICATION
   ========================================================= */

async function saveMember() {

  const name =
    document.getElementById(
      "memberName"
    ).value.trim();


  const role =
    document.getElementById(
      "memberRole"
    ).value.trim();


  const phone =
    document.getElementById(
      "memberPhone"
    ).value.trim();


  const description =
    document.getElementById(
      "memberDescription"
    ).value.trim();


  if (!name) {

    showStatus(
      "memberStatus",
      "Veuillez saisir le nom du membre.",
      "error"
    );

    return;
  }


  const members =
    getJSON(
      MEMBERS_KEY,
      []
    );


  const file =
    document.getElementById(
      "memberPhoto"
    ).files[0];


  let photo = "";


  if (file) {

    photo =
      await readImage(file);
  }


  /* MODIFICATION */

  if (editingMemberId) {

    const index =
      members.findIndex(
        member =>
          member.id ===
          editingMemberId
      );


    if (index !== -1) {

      if (!photo) {

        photo =
          members[index].photo ||
          "logo.png";
      }


      members[index] = {

        ...members[index],

        name,
        role,
        phone,
        description,
        photo,

        updatedAt:
          new Date().toISOString()
      };
    }


    editingMemberId =
      null;


    document.getElementById(
      "saveMember"
    ).textContent =
      "Ajouter le membre";


    document.getElementById(
      "cancelMember"
    ).style.display =
      "none";

  }


  /* NOUVEAU */

  else {

    members.push({

      id:
        Date.now().toString(),

      name,
      role,
      phone,
      description,

      photo:
        photo ||
        "logo.png",

      active:
        true,

      createdAt:
        new Date().toISOString()
    });

  }


  saveJSON(
    MEMBERS_KEY,
    members
  );


  clearMemberForm();

  loadMembers();


  showStatus(
    "memberStatus",
    "Le membre de sécurité a été enregistré."
  );
}


/* =========================================================
   MODIFIER
   ========================================================= */

function editMember(id) {

  const members =
    getJSON(
      MEMBERS_KEY,
      []
    );


  const member =
    members.find(
      item =>
        item.id === id
    );


  if (!member) return;


  editingMemberId =
    id;


  document.getElementById(
    "memberName"
  ).value =
    member.name || "";


  document.getElementById(
    "memberRole"
  ).value =
    member.role || "";


  document.getElementById(
    "memberPhone"
  ).value =
    member.phone || "";


  document.getElementById(
    "memberDescription"
  ).value =
    member.description || "";


  document.getElementById(
    "saveMember"
  ).textContent =
    "Enregistrer les modifications";


  document.getElementById(
    "cancelMember"
  ).style.display =
    "inline-block";


  window.scrollTo({

    top:
      document.getElementById(
        "memberName"
      ).getBoundingClientRect().top +
      window.scrollY -
      120,

    behavior:
      "smooth"
  });
}


/* =========================================================
   SUPPRIMER
   ========================================================= */

function deleteMember(id) {

  const members =
    getJSON(
      MEMBERS_KEY,
      []
    );


  const updated =
    members.filter(
      member =>
        member.id !== id
    );


  saveJSON(
    MEMBERS_KEY,
    updated
  );


  loadMembers();


  showStatus(
    "memberStatus",
    "Le membre a été supprimé."
  );
}


/* =========================================================
   NETTOYER
   ========================================================= */

function clearMemberForm() {

  document.getElementById(
    "memberName"
  ).value = "";


  document.getElementById(
    "memberRole"
  ).value = "";


  document.getElementById(
    "memberPhone"
  ).value = "";


  document.getElementById(
    "memberDescription"
  ).value = "";


  document.getElementById(
    "memberPhoto"
  ).value = "";
}


/* =========================================================
   MENU
   ========================================================= */

function setupMenu() {

  const button =
    document.getElementById(
      "menuBtn"
    );


  const nav =
    document.getElementById(
      "mainNav"
    );


  button.addEventListener(
    "click",
    () => {

      nav.classList.toggle(
        "open"
      );

    }
  );
}


/* =========================================================
   APERÇU PHOTO
   ========================================================= */

function setupPreview() {

  const input =
    document.getElementById(
      "securityPhoto"
    );


  const preview =
    document.getElementById(
      "securityPreview"
    );


  const box =
    document.getElementById(
      "securityPreviewBox"
    );


  input.addEventListener(
    "change",
    () => {

      const file =
        input.files[0];


      if (!file) return;


      preview.src =
        URL.createObjectURL(
          file
        );


      box.style.display =
        "block";
    }
  );
}


/* =========================================================
   ANNULATION
   ========================================================= */

function setupCancel() {

  document.getElementById(
    "cancelMember"
  ).addEventListener(
    "click",
    () => {

      editingMemberId =
        null;


      clearMemberForm();


      document.getElementById(
        "saveMember"
      ).textContent =
        "Ajouter le membre";


      document.getElementById(
        "cancelMember"
      ).style.display =
        "none";
    }
  );
}


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadSecurity();

    loadMembers();

    setupMenu();

    setupPreview();

    setupCancel();


    document.getElementById(
      "saveSecurity"
    ).addEventListener(
      "click",
      saveSecurity
    );


    document.getElementById(
      "resetSecurity"
    ).addEventListener(
      "click",
      resetSecurity
    );


    document.getElementById(
      "saveMember"
    ).addEventListener(
      "click",
      saveMember
    );

  }
);
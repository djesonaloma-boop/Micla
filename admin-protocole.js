/* =========================================================
   MI.C.L.A — CITÉ DE REFUGE
   ADMINISTRATION — PROTOCOLE
   ========================================================= */

const PROTOCOL_KEY = "micla_protocol_department";
const MEMBERS_KEY = "micla_protocol_team";

let editingMemberId = null;


/* =========================================================
   OUTILS
   ========================================================= */

function getJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error("Erreur localStorage :", error);
    return fallback;
  }
}


function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}


function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function showStatus(id, message, type = "success") {

  const element = document.getElementById(id);

  if (!element) return;

  element.textContent = message;

  element.className =
    "status show " + type;

  setTimeout(() => {
    element.classList.remove("show");
  }, 3500);
}


function readImage(file) {

  return new Promise((resolve, reject) => {

    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsDataURL(file);
  });
}


/* =========================================================
   PRESENTATION DU PROTOCOLE
   ========================================================= */

function getDefaultProtocol() {

  return {
    title: "Département du Protocole",

    description:
      "Le département du protocole participe à l'accueil, à l'orientation des fidèles et au bon déroulement des cultes et des activités de MI.C.L.A — Cité de Refuge.",

    mission:
      "Accueil, orientation et organisation",

    schedule:
      "Selon le programme de l'église",

    photo:
      "",

    updatedAt:
      new Date().toISOString()
  };
}


function loadProtocol() {

  const protocol =
    getJSON(
      PROTOCOL_KEY,
      getDefaultProtocol()
    );

  document.getElementById(
    "protocolTitle"
  ).value =
    protocol.title || "";

  document.getElementById(
    "protocolDescription"
  ).value =
    protocol.description || "";

  document.getElementById(
    "protocolMission"
  ).value =
    protocol.mission || "";

  document.getElementById(
    "protocolSchedule"
  ).value =
    protocol.schedule || "";

  const preview =
    document.getElementById(
      "protocolPreview"
    );

  const box =
    document.getElementById(
      "protocolPreviewBox"
    );

  if (protocol.photo) {

    preview.src =
      protocol.photo;

    box.style.display =
      "block";
  }
}


async function saveProtocol() {

  const oldProtocol =
    getJSON(
      PROTOCOL_KEY,
      getDefaultProtocol()
    );

  const file =
    document.getElementById(
      "protocolPhoto"
    ).files[0];

  let photo =
    oldProtocol.photo || "";

  if (file) {
    photo =
      await readImage(file);
  }

  const protocol = {

    title:
      document.getElementById(
        "protocolTitle"
      ).value.trim(),

    description:
      document.getElementById(
        "protocolDescription"
      ).value.trim(),

    mission:
      document.getElementById(
        "protocolMission"
      ).value.trim(),

    schedule:
      document.getElementById(
        "protocolSchedule"
      ).value.trim(),

    photo,

    updatedAt:
      new Date().toISOString()
  };

  saveJSON(
    PROTOCOL_KEY,
    protocol
  );

  const preview =
    document.getElementById(
      "protocolPreview"
    );

  const box =
    document.getElementById(
      "protocolPreviewBox"
    );

  if (photo) {

    preview.src =
      photo;

    box.style.display =
      "block";
  }

  showStatus(
    "protocolStatus",
    "La présentation du protocole a été enregistrée."
  );
}


function resetProtocol() {

  localStorage.removeItem(
    PROTOCOL_KEY
  );

  loadProtocol();

  showStatus(
    "protocolStatus",
    "Les informations par défaut ont été restaurées."
  );
}


/* =========================================================
   MEMBRES DU PROTOCOLE
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
        Aucun membre du protocole
        n'est encore enregistré.
      </div>
    `;

    return;
  }

  container.innerHTML =
    members.map(member => {

      const photo =
        member.photo || "logo.png";

      return `
        <article class="item">

          <div class="item-top">

            <img
              class="avatar"
              src="${photo}"
              alt="${escapeHTML(member.name)}"
            >

            <div>

              <h3>
                ${escapeHTML(member.name)}
              </h3>

              <div class="role">
                ${escapeHTML(
                  member.role ||
                  "Membre du protocole"
                )}
              </div>

            </div>

          </div>

          <p>
            <strong>Téléphone :</strong>
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
                  onclick="openWhatsApp('${member.phone}')"
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

    }).join("");
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
          member.id === editingMemberId
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

    editingMemberId = null;

    document.getElementById(
      "saveMember"
    ).textContent =
      "Ajouter le membre";

    document.getElementById(
      "cancelMember"
    ).style.display =
      "none";

  }


  /* NOUVEAU MEMBRE */

  else {

    members.push({

      id:
        Date.now().toString(),

      name,
      role,
      phone,
      description,

      photo:
        photo || "logo.png",

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
    "Le membre du protocole a été enregistré."
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
      item => item.id === id
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
   NETTOYAGE DU FORMULAIRE
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
   MENU MOBILE
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
      nav.classList.toggle("open");
    }
  );
}


/* =========================================================
   APERÇU PHOTO
   ========================================================= */

function setupPreview() {

  const input =
    document.getElementById(
      "protocolPhoto"
    );

  const preview =
    document.getElementById(
      "protocolPreview"
    );

  const box =
    document.getElementById(
      "protocolPreviewBox"
    );

  input.addEventListener(
    "change",
    () => {

      const file =
        input.files[0];

      if (!file) return;

      preview.src =
        URL.createObjectURL(file);

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

    loadProtocol();

    loadMembers();

    setupMenu();

    setupPreview();

    setupCancel();

    document.getElementById(
      "saveProtocol"
    ).addEventListener(
      "click",
      saveProtocol
    );

    document.getElementById(
      "resetProtocol"
    ).addEventListener(
      "click",
      resetProtocol
    );

    document.getElementById(
      "saveMember"
    ).addEventListener(
      "click",
      saveMember
    );

  }
);
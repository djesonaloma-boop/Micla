/* =========================================================
   MI.C.L.A — CITÉ DE REFUGE
   ADMINISTRATION — JEUNESSE
   ========================================================= */

const YOUTH_KEY = "micla_youth";
const LEADERS_KEY = "micla_youth_leaders";
const ACTIVITIES_KEY = "micla_youth_activities";

let editingLeaderId = null;


/* =========================================================
   OUTILS
   ========================================================= */

function getJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error("Erreur lecture localStorage :", error);
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showStatus(id, message, type = "success") {
  const element = document.getElementById(id);

  if (!element) return;

  element.textContent = message;
  element.className = "status show " + type;

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

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(file);
  });
}

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   PRESENTATION JEUNESSE
   ========================================================= */

function defaultYouth() {
  return {
    title: "Département de Jeunesse",
    description:
      "Une jeunesse engagée dans la foi, la prière, la communion fraternelle, l'évangélisation et le service de Dieu.",
    meetingDay: "Samedi",
    meetingTime: "16h30 – 17h30",
    photo: "CHADRACK.jpg",
    updatedAt: new Date().toISOString()
  };
}

function loadYouth() {

  const youth = getJSON(YOUTH_KEY, defaultYouth());

  document.getElementById("youthTitle").value =
    youth.title || "";

  document.getElementById("youthDescription").value =
    youth.description || "";

  document.getElementById("meetingDay").value =
    youth.meetingDay || "";

  document.getElementById("meetingTime").value =
    youth.meetingTime || "";

  if (youth.photo) {
    const preview = document.getElementById("youthPreview");
    preview.src = youth.photo;
    preview.style.display = "block";
  }
}

async function saveYouth() {

  const oldYouth = getJSON(YOUTH_KEY, defaultYouth());

  const file = document.getElementById("youthPhoto").files[0];

  let photo = oldYouth.photo || "CHADRACK.jpg";

  if (file) {
    photo = await readImage(file);
  }

  const youth = {
    title: document.getElementById("youthTitle").value.trim(),
    description: document.getElementById("youthDescription").value.trim(),
    meetingDay: document.getElementById("meetingDay").value.trim(),
    meetingTime: document.getElementById("meetingTime").value.trim(),
    photo,
    updatedAt: new Date().toISOString()
  };

  saveJSON(YOUTH_KEY, youth);

  const preview = document.getElementById("youthPreview");

  if (photo) {
    preview.src = photo;
    preview.style.display = "block";
  }

  showStatus(
    "youthStatus",
    "La présentation de la jeunesse a été enregistrée."
  );
}

function resetYouth() {
  localStorage.removeItem(YOUTH_KEY);
  loadYouth();

  showStatus(
    "youthStatus",
    "Les informations par défaut ont été restaurées."
  );
}


/* =========================================================
   RESPONSABLES
   ========================================================= */

function loadLeaders() {

  const leaders = getJSON(LEADERS_KEY, []);

  const container = document.getElementById("leadersList");

  if (!leaders.length) {

    container.innerHTML = `
      <div class="empty">
        Aucun responsable enregistré pour le moment.
      </div>
    `;

    return;
  }

  container.innerHTML = leaders.map(leader => {

    const photo =
      leader.photo ||
      "CHADRACK.jpg";

    const whatsapp =
      leader.phone
        ? `https://wa.me/${leader.phone.replace(/\D/g, "")}`
        : "#";

    return `
      <article class="item">

        <div class="item-top">

          <img
            class="avatar"
            src="${photo}"
            alt="${escapeHTML(leader.name)}"
          >

          <div>
            <h3>${escapeHTML(leader.name)}</h3>

            <div class="role">
              ${escapeHTML(
                leader.role || "Responsable"
              )}
            </div>
          </div>

        </div>

        <p>
          <strong>WhatsApp :</strong>
          ${escapeHTML(leader.phone || "Non renseigné")}
        </p>

        <p>
          ${escapeHTML(
            leader.description ||
            "Aucune description."
          )}
        </p>

        <div class="item-actions">

          ${
            leader.phone
              ? `
                <button
                  class="btn-success"
                  onclick="openWhatsApp('${whatsapp}')"
                >
                  WhatsApp
                </button>
              `
              : ""
          }

          <button
            class="btn-secondary"
            onclick="editLeader('${leader.id}')"
          >
            Modifier
          </button>

          <button
            class="btn-danger"
            onclick="deleteLeader('${leader.id}')"
          >
            Supprimer
          </button>

        </div>

      </article>
    `;

  }).join("");
}


function openWhatsApp(url) {

  if (!url || url === "#") return;

  window.open(url, "_blank");
}


async function saveLeader() {

  const name =
    document.getElementById("leaderName").value.trim();

  const role =
    document.getElementById("leaderRole").value.trim();

  const phone =
    document.getElementById("leaderPhone").value.trim();

  const description =
    document.getElementById("leaderDescription").value.trim();

  if (!name) {

    showStatus(
      "leaderStatus",
      "Veuillez saisir le nom du responsable.",
      "error"
    );

    return;
  }

  const leaders = getJSON(LEADERS_KEY, []);

  const file =
    document.getElementById("leaderPhoto").files[0];

  let photo = "";

  if (file) {
    photo = await readImage(file);
  }

  if (editingLeaderId) {

    const index = leaders.findIndex(
      leader => leader.id === editingLeaderId
    );

    if (index !== -1) {

      if (!photo) {
        photo = leaders[index].photo || "CHADRACK.jpg";
      }

      leaders[index] = {
        ...leaders[index],
        name,
        role,
        phone,
        description,
        photo,
        updatedAt: new Date().toISOString()
      };
    }

    editingLeaderId = null;

    document.getElementById("saveLeader").textContent =
      "Ajouter le responsable";

    document.getElementById("cancelLeader").style.display =
      "none";

  } else {

    leaders.push({
      id: Date.now().toString(),
      name,
      role,
      phone,
      description,
      photo: photo || "CHADRACK.jpg",
      active: true,
      createdAt: new Date().toISOString()
    });

  }

  saveJSON(LEADERS_KEY, leaders);

  clearLeaderForm();
  loadLeaders();

  showStatus(
    "leaderStatus",
    "Le responsable a été enregistré."
  );
}


function editLeader(id) {

  const leaders = getJSON(LEADERS_KEY, []);

  const leader = leaders.find(
    item => item.id === id
  );

  if (!leader) return;

  editingLeaderId = id;

  document.getElementById("leaderName").value =
    leader.name || "";

  document.getElementById("leaderRole").value =
    leader.role || "";

  document.getElementById("leaderPhone").value =
    leader.phone || "";

  document.getElementById("leaderDescription").value =
    leader.description || "";

  document.getElementById("saveLeader").textContent =
    "Enregistrer les modifications";

  document.getElementById("cancelLeader").style.display =
    "inline-block";

  window.scrollTo({
    top: document.getElementById("leaderName")
      .getBoundingClientRect().top +
      window.scrollY -
      120,
    behavior: "smooth"
  });
}


function deleteLeader(id) {

  const leaders = getJSON(LEADERS_KEY, []);

  const updated = leaders.filter(
    leader => leader.id !== id
  );

  saveJSON(LEADERS_KEY, updated);

  loadLeaders();

  showStatus(
    "leaderStatus",
    "Le responsable a été supprimé."
  );
}


function clearLeaderForm() {

  document.getElementById("leaderName").value = "";
  document.getElementById("leaderRole").value = "";
  document.getElementById("leaderPhone").value = "";
  document.getElementById("leaderDescription").value = "";
  document.getElementById("leaderPhoto").value = "";
}


/* =========================================================
   ACTIVITÉS JEUNESSE
   ========================================================= */

function loadActivities() {

  const activities =
    getJSON(ACTIVITIES_KEY, []);

  const container =
    document.getElementById("activitiesList");

  if (!activities.length) {

    container.innerHTML = `
      <div class="empty">
        Aucune activité publiée pour le moment.
      </div>
    `;

    return;
  }

  container.innerHTML =
    activities.map(activity => {

      return `
        <article class="item">

          ${
            activity.poster
              ? `
                <img
                  src="${activity.poster}"
                  alt="${escapeHTML(activity.title)}"
                  style="
                    width:100%;
                    height:180px;
                    object-fit:cover;
                    border-radius:12px;
                    margin-bottom:12px;
                  "
                >
              `
              : ""
          }

          <h3>
            ${escapeHTML(activity.title)}
          </h3>

          <p>
            ${
              activity.date
                ? "📅 " + escapeHTML(activity.date)
                : ""
            }

            ${
              activity.time
                ? " · 🕐 " + escapeHTML(activity.time)
                : ""
            }
          </p>

          ${
            activity.location
              ? `
                <p>
                  📍 ${escapeHTML(activity.location)}
                </p>
              `
              : ""
          }

          <p>
            ${escapeHTML(
              activity.description ||
              "Aucune description."
            )}
          </p>

          <div class="item-actions">

            ${
              activity.link
                ? `
                  <button
                    class="btn-success"
                    onclick="window.open('${activity.link}','_blank')"
                  >
                    Ouvrir le lien
                  </button>
                `
                : ""
            }

            <button
              class="btn-danger"
              onclick="deleteActivity('${activity.id}')"
            >
              Supprimer
            </button>

          </div>

        </article>
      `;

    }).join("");
}


async function saveActivity() {

  const title =
    document.getElementById("activityTitle")
      .value.trim();

  const date =
    document.getElementById("activityDate")
      .value;

  const time =
    document.getElementById("activityTime")
      .value.trim();

  const location =
    document.getElementById("activityLocation")
      .value.trim();

  const description =
    document.getElementById("activityDescription")
      .value.trim();

  const link =
    document.getElementById("activityLink")
      .value.trim();

  const file =
    document.getElementById("activityPoster")
      .files[0];

  if (!title) {

    showStatus(
      "activityStatus",
      "Veuillez saisir le titre de l'activité.",
      "error"
    );

    return;
  }

  let poster = "";

  if (file) {
    poster = await readImage(file);
  }

  const activities =
    getJSON(ACTIVITIES_KEY, []);

  activities.unshift({
    id: Date.now().toString(),
    title,
    date,
    time,
    location,
    description,
    link,
    poster,
    active: true,
    createdAt: new Date().toISOString()
  });

  saveJSON(
    ACTIVITIES_KEY,
    activities
  );

  document.getElementById("activityTitle").value = "";
  document.getElementById("activityDate").value = "";
  document.getElementById("activityTime").value = "";
  document.getElementById("activityLocation").value = "";
  document.getElementById("activityDescription").value = "";
  document.getElementById("activityLink").value = "";
  document.getElementById("activityPoster").value = "";

  loadActivities();

  showStatus(
    "activityStatus",
    "L'activité a été publiée."
  );
}


function deleteActivity(id) {

  const activities =
    getJSON(ACTIVITIES_KEY, []);

  const updated =
    activities.filter(
      activity => activity.id !== id
    );

  saveJSON(
    ACTIVITIES_KEY,
    updated
  );

  loadActivities();

  showStatus(
    "activityStatus",
    "L'activité a été supprimée."
  );
}


/* =========================================================
   INFORMATIONS OFFICIELLES
   ========================================================= */

function loadOfficialDefaults() {

  document.getElementById("youthTitle").value =
    "Département de Jeunesse";

  document.getElementById("youthDescription").value =
    "Une jeunesse engagée dans la foi, la prière, la communion fraternelle, l'évangélisation et le service de Dieu.";

  document.getElementById("meetingDay").value =
    "Samedi";

  document.getElementById("meetingTime").value =
    "16h30 – 17h30";

  const preview =
    document.getElementById("youthPreview");

  preview.src = "CHADRACK.jpg";
  preview.style.display = "block";

  showStatus(
    "youthStatus",
    "Les informations officielles ont été chargées."
  );
}


/* =========================================================
   RESPONSABLES OFFICIELS
   ========================================================= */

function addOfficialLeadersIfEmpty() {

  const leaders =
    getJSON(LEADERS_KEY, []);

  if (leaders.length > 0) return;

  const officialLeaders = [

    {
      id: "chadrack-mutombo",
      name: "Chadrack Mutombo",
      role: "Responsable de la jeunesse",
      phone: "+243 979 677 507",
      description:
        "Responsable au sein du département de jeunesse de MI.C.L.A — Cité de Refuge.",
      photo: "CHADRACK.jpg",
      active: true,
      createdAt: new Date().toISOString()
    },

    {
      id: "yannick-mutombo",
      name: "Yannick Mutombo",
      role: "Responsable de la jeunesse",
      phone: "+243 851 646 637",
      description:
        "Responsable au sein du département de jeunesse de MI.C.L.A — Cité de Refuge.",
      photo: "CHADRACK.jpg",
      active: true,
      createdAt: new Date().toISOString()
    },

    {
      id: "samuel-eyambela",
      name: "Samuel Eyambela",
      role: "Responsable de la jeunesse",
      phone: "+243 899 163 144",
      description:
        "Responsable au sein du département de jeunesse de MI.C.L.A — Cité de Refuge.",
      photo: "CHADRACK.jpg",
      active: true,
      createdAt: new Date().toISOString()
    }

  ];

  saveJSON(
    LEADERS_KEY,
    officialLeaders
  );
}


/* =========================================================
   MENU MOBILE
   ========================================================= */

function setupMenu() {

  const menuBtn =
    document.getElementById("menuBtn");

  const nav =
    document.getElementById("mainNav");

  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}


/* =========================================================
   APERÇU PHOTO JEUNESSE
   ========================================================= */

function setupYouthPreview() {

  const input =
    document.getElementById("youthPhoto");

  const preview =
    document.getElementById("youthPreview");

  input.addEventListener("change", () => {

    const file = input.files[0];

    if (!file) return;

    const url =
      URL.createObjectURL(file);

    preview.src = url;
    preview.style.display = "block";
  });
}


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadYouth();

    addOfficialLeadersIfEmpty();

    loadLeaders();

    loadActivities();

    setupMenu();

    setupYouthPreview();

    document
      .getElementById("saveYouth")
      .addEventListener(
        "click",
        saveYouth
      );

    document
      .getElementById("resetYouth")
      .addEventListener(
        "click",
        resetYouth
      );

    document
      .getElementById("saveLeader")
      .addEventListener(
        "click",
        saveLeader
      );

    document
      .getElementById("cancelLeader")
      .addEventListener(
        "click",
        () => {

          editingLeaderId = null;

          clearLeaderForm();

          document.getElementById(
            "saveLeader"
          ).textContent =
            "Ajouter le responsable";

          document.getElementById(
            "cancelLeader"
          ).style.display =
            "none";
        }
      );

    document
      .getElementById("saveActivity")
      .addEventListener(
        "click",
        saveActivity
      );

    document
      .getElementById("loadDefaults")
      .addEventListener(
        "click",
        loadOfficialDefaults
      );

  }
);
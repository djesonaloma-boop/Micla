const STORAGE_KEY = "micla_activities";

const form = document.getElementById("activityForm");
const activityId = document.getElementById("activityId");
const title = document.getElementById("title");
const type = document.getElementById("type");
const description = document.getElementById("description");
const date = document.getElementById("date");
const time = document.getElementById("time");
const locationInput = document.getElementById("location");
const video = document.getElementById("video");
const whatsapp = document.getElementById("whatsapp");
const link = document.getElementById("link");
const posterInput = document.getElementById("poster");

const preview = document.getElementById("preview");
const activitiesList = document.getElementById("activitiesList");
const counter = document.getElementById("counter");

const statusBox = document.getElementById("status");
const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const menuBtn = document.getElementById("menuBtn");
const adminNav = document.getElementById("adminNav");

let posterData = "";
let editingId = null;


/* =========================
   OUTILS
========================= */

function getActivities(){
  try{
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if(!Array.isArray(data)){
      return [];
    }

    return data;
  }catch(error){
    console.error("Erreur lecture activités :", error);
    return [];
  }
}


function saveActivities(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}


function showStatus(message, type = "success"){
  statusBox.textContent = message;
  statusBox.className = "status " + type;

  setTimeout(() => {
    statusBox.className = "status";
  }, 3000);
}


function escapeHTML(value){
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatDate(value){
  if(!value){
    return "Date non précisée";
  }

  const d = new Date(value + "T00:00:00");

  if(Number.isNaN(d.getTime())){
    return value;
  }

  return d.toLocaleDateString("fr-FR", {
    day:"2-digit",
    month:"2-digit",
    year:"numeric"
  });
}


/* =========================
   APERÇU IMAGE
========================= */

posterInput.addEventListener("change", function(){

  const file = this.files[0];

  if(!file){
    return;
  }

  if(!file.type.startsWith("image/")){
    showStatus("Veuillez sélectionner une image.", "error");
    this.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event){
    posterData = event.target.result;

    preview.src = posterData;
    preview.style.display = "block";
  };

  reader.readAsDataURL(file);
});


/* =========================
   AFFICHAGE
========================= */

function renderActivities(){

  const activities = getActivities();

  counter.textContent =
    activities.length +
    (activities.length > 1 ? " activités" : " activité");

  if(!activities.length){

    activitiesList.innerHTML = `
      <div class="empty">
        <div style="font-size:38px;margin-bottom:10px;">📅</div>
        <strong>Aucune activité</strong>
        <p style="margin-top:7px;">
          Crée ta première activité avec le formulaire.
        </p>
      </div>
    `;

    return;
  }

  activitiesList.innerHTML = activities.map(activity => {

    const active = activity.active !== false;

    const poster = activity.poster
      ? `<img class="poster"
              src="${activity.poster}"
              alt="${escapeHTML(activity.title)}">`
      : `<div class="poster placeholder">
           Aucune affiche
         </div>`;

    const videoLink = activity.video
      ? `<div>🎥 Vidéo disponible</div>`
      : "";

    const whatsappLink = activity.whatsapp
      ? `<div>💬 WhatsApp disponible</div>`
      : "";

    const externalLink = activity.link
      ? `<div>🔗 Lien externe disponible</div>`
      : "";

    return `
      <article class="activity">

        ${poster}

        <div class="activity-body">

          <span class="badge">
            ${escapeHTML(activity.type || "Activité")}
          </span>

          <h3>
            ${escapeHTML(activity.title || "Sans titre")}
          </h3>

          ${
            activity.description
            ? `
              <div class="description">
                ${escapeHTML(activity.description)}
              </div>
            `
            : ""
          }

          <div class="meta">

            ${
              activity.date
              ? `<div>📅 ${formatDate(activity.date)}</div>`
              : ""
            }

            ${
              activity.time
              ? `<div>🕐 ${escapeHTML(activity.time)}</div>`
              : ""
            }

            ${
              activity.location
              ? `<div>📍 ${escapeHTML(activity.location)}</div>`
              : ""
            }

            ${
              !activity.date &&
              !activity.time &&
              !activity.location
              ? `<div>Informations de date non précisées</div>`
              : ""
            }

            ${videoLink}
            ${whatsappLink}
            ${externalLink}

          </div>

          <div class="card-actions">

            <button
              class="edit"
              onclick="editActivity('${activity.id}')"
            >
              ✏️ Modifier
            </button>

            <button
              class="toggle ${active ? "" : "off"}"
              onclick="toggleActivity('${activity.id}')"
            >
              ${active ? "👁️ Publiée" : "🚫 Masquée"}
            </button>

            <button
              class="delete"
              onclick="deleteActivity('${activity.id}')"
            >
              🗑️ Supprimer
            </button>

          </div>

        </div>

      </article>
    `;

  }).join("");
}


/* =========================
   CRÉER / MODIFIER
========================= */

form.addEventListener("submit", function(event){

  event.preventDefault();

  const activityTitle = title.value.trim();

  if(!activityTitle){
    showStatus("Le titre est obligatoire.", "error");
    return;
  }

  let activities = getActivities();

  const existingIndex = activities.findIndex(
    item => String(item.id) === String(editingId)
  );

  const oldActivity =
    existingIndex !== -1
      ? activities[existingIndex]
      : null;

  const activity = {

    id:
      editingId ||
      Date.now().toString(),

    title: activityTitle,

    type:
      type.value ||
      "Activité",

    description:
      description.value.trim(),

    date:
      date.value,

    time:
      time.value.trim(),

    location:
      locationInput.value.trim(),

    poster:
      posterData ||
      (oldActivity ? oldActivity.poster : ""),

    video:
      video.value.trim(),

    whatsapp:
      whatsapp.value.trim(),

    link:
      link.value.trim(),

    active:
      oldActivity
        ? oldActivity.active !== false
        : true,

    createdAt:
      oldActivity
        ? oldActivity.createdAt
        : new Date().toISOString(),

    updatedAt:
      new Date().toISOString()
  };


  if(existingIndex !== -1){

    activities[existingIndex] = activity;

    showStatus("Activité modifiée avec succès.");

  }else{

    activities.unshift(activity);

    showStatus("Activité publiée avec succès.");
  }


  saveActivities(activities);

  resetForm();

  renderActivities();

});


/* =========================
   MODIFICATION
========================= */

function editActivity(id){

  const activities = getActivities();

  const activity = activities.find(
    item => String(item.id) === String(id)
  );

  if(!activity){
    showStatus("Activité introuvable.", "error");
    return;
  }

  editingId = activity.id;

  activityId.value = activity.id;

  title.value = activity.title || "";
  type.value = activity.type || "Activité";
  description.value = activity.description || "";
  date.value = activity.date || "";
  time.value = activity.time || "";
  locationInput.value = activity.location || "";
  video.value = activity.video || "";
  whatsapp.value = activity.whatsapp || "";
  link.value = activity.link || "";

  posterData = activity.poster || "";

  if(activity.poster){

    preview.src = activity.poster;
    preview.style.display = "block";

  }else{

    preview.removeAttribute("src");
    preview.style.display = "none";
  }

  formTitle.textContent = "✏️ Modifier l'activité";

  saveBtn.textContent = "Enregistrer les modifications";

  cancelBtn.classList.remove("hidden");

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}


/* =========================
   ANNULER
========================= */

cancelBtn.addEventListener("click", function(){
  resetForm();
});


function resetForm(){

  form.reset();

  editingId = null;
  activityId.value = "";

  posterData = "";

  preview.removeAttribute("src");
  preview.style.display = "none";

  formTitle.textContent = "➕ Nouvelle activité";

  saveBtn.textContent = "Publier l'activité";

  cancelBtn.classList.add("hidden");

  posterInput.value = "";
}


/* =========================
   ACTIVER / DÉSACTIVER
========================= */

function toggleActivity(id){

  const activities = getActivities();

  const index = activities.findIndex(
    item => String(item.id) === String(id)
  );

  if(index === -1){
    return;
  }

  activities[index].active =
    activities[index].active === false;

  activities[index].updatedAt =
    new Date().toISOString();

  saveActivities(activities);

  renderActivities();

  showStatus(
    activities[index].active
      ? "Activité publiée."
      : "Activité masquée."
  );
}


/* =========================
   SUPPRIMER
========================= */

function deleteActivity(id){

  const activities = getActivities();

  const activity = activities.find(
    item => String(item.id) === String(id)
  );

  if(!activity){
    return;
  }

  const confirmed = confirm(
    `Supprimer définitivement l'activité "${activity.title}" ?`
  );

  if(!confirmed){
    return;
  }

  const updated = activities.filter(
    item => String(item.id) !== String(id)
  );

  saveActivities(updated);

  if(String(editingId) === String(id)){
    resetForm();
  }

  renderActivities();

  showStatus("Activité supprimée.");
}


/* =========================
   MENU MOBILE
========================= */

menuBtn.addEventListener("click", function(){

  adminNav.classList.toggle("open");

});


/* =========================
   INITIALISATION
========================= */

renderActivities();


/*
  Fonctions accessibles depuis les boutons HTML.
*/
window.editActivity = editActivity;
window.toggleActivity = toggleActivity;
window.deleteActivity = deleteActivity;
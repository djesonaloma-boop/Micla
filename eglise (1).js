/* =========================================================
   MI.C.L.A — CITÉ DE REFUGE
   eglise.js
   Gestion Pasteur / Berger
   Messages • Vocaux • Prières • Annonces • WhatsApp
   ========================================================= */

"use strict";


const MICLA = {

  pasteur: {
    key: "pasteur",
    name: "Pasteur Jérémie Bakadisanga",
    phone: "+243 904 490 937",
    phoneClean: "243904490937",
    whatsapp: "243904490937"
  },

  berger: {
    key: "berger",
    name: "Chardin Vuanda",
    phone: "+243 896 039 439",
    phoneClean: "243896039439",
    whatsapp: "243896039439"
  }

};


let currentPerson = "pasteur";

let prayerRecorder = null;
let prayerStream = null;
let prayerChunks = [];
let prayerAudioBlob = null;
let prayerAudioUrl = null;

let prayerTimerInterval = null;
let prayerSeconds = 0;


/* =========================================================
   OUTILS
   ========================================================= */

function safeJSON(value, fallback = null) {

  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }

}


function getStorage(key, fallback = null) {

  try {

    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return value;

  } catch (error) {

    console.warn("LocalStorage inaccessible :", error);

    return fallback;
  }

}


function getJSON(key, fallback = null) {

  return safeJSON(
    getStorage(key, null),
    fallback
  );

}


function setText(id, value, fallback = "") {

  const element = document.getElementById(id);

  if (!element) return;

  const text =
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
      ? String(value)
      : fallback;

  element.textContent = text;
}


function normalizePerson(person) {

  return person === "berger"
    ? "berger"
    : "pasteur";

}


function normalizePhone(value) {

  let clean = String(value || "").replace(/[^0-9]/g, "");

  // Numéros congolais : 090xxxxxxx / 08xxxxxxxx -> 2439xxxxxxxx / 2438xxxxxxxx
  if (clean.startsWith("00")) clean = clean.slice(2);
  if (clean.startsWith("0") && clean.length >= 10) clean = "243" + clean.slice(1);
  if (clean.startsWith("243243")) clean = clean.slice(3);

  return clean;

}


function phoneToWhatsApp(value) {

  const clean = normalizePhone(value);

  return clean ? `https://wa.me/${clean}` : "";

}


function loadContactSettings() {

  // Les coordonnées individuelles enregistrées dans l'administration
  // deviennent prioritaires sur les valeurs par défaut.
  ["pasteur", "berger"].forEach(person => {

    const info = getJSON(`micla_${person}_info`, {});

    if (!info || typeof info !== "object") return;

    const clean = normalizePhone(info.phone);

    if (clean) {
      MICLA[person].phoneClean = clean;
      MICLA[person].whatsapp = clean;
    }

    if (info.name) {
      MICLA[person].name = info.name;
    }

  });

}


/* =========================================================
   INFORMATIONS DE L'ÉGLISE
   ========================================================= */

function loadChurchInfo() {

  const data = getJSON(
    "micla_church_info",
    {}
  );

  if (!data || typeof data !== "object") {
    return;
  }

  if (data.pasteur) {

    const p = data.pasteur;

    if (p.name) {
      setText(
        "pasteur-name",
        p.name,
        MICLA.pasteur.name
      );
    }

    if (p.phone) {
      setText(
        "pasteur-phone",
        p.phone,
        MICLA.pasteur.phone
      );
    }

  }

  if (data.berger) {

    const b = data.berger;

    if (b.name) {
      setText(
        "berger-name",
        b.name,
        MICLA.berger.name
      );
    }

    if (b.phone) {
      setText(
        "berger-phone",
        b.phone,
        MICLA.berger.phone
      );
    }

  }

}


/* =========================================================
   INFORMATIONS INDIVIDUELLES
   ========================================================= */

function loadPersonInfo(person) {

  person = normalizePerson(person);

  const info =
    getJSON(
      `micla_${person}_info`,
      {}
    );

  if (!info || typeof info !== "object") {
    return;
  }

  const nameId =
    `${person}-name`;

  const phoneId =
    `${person}-phone`;

  if (info.name) {

    setText(
      nameId,
      info.name,
      MICLA[person].name
    );

  }

  if (info.phone) {

    setText(
      phoneId,
      info.phone,
      MICLA[person].phone
    );

  }

}


/* =========================================================
   CONTACTS
   ========================================================= */

function setupContacts() {

  ["pasteur", "berger"].forEach(person => {

    const data = MICLA[person];

    const whatsapp =
      document.getElementById(
        `${person}-whatsapp`
      );

    const call =
      document.getElementById(
        `${person}-call`
      );

    if (whatsapp) {

      let message = "";

      if (person === "pasteur") {

        message =
          "Bonjour Pasteur Jérémie";

      } else {

        message =
          "Bonjour Berger Chardin";

      }

      const cleanWhatsApp =
        normalizePhone(data.whatsapp || data.phoneClean || data.phone);

      if (cleanWhatsApp) {
        const waUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(message)}`;
        whatsapp.href = waUrl;
        whatsapp.target = "_blank";
        whatsapp.rel = "noopener noreferrer";
        whatsapp.removeAttribute("aria-disabled");
        whatsapp.onclick = function(event){
          event.preventDefault();
          const opened = window.open(waUrl, "_blank", "noopener,noreferrer");
          if (!opened) window.location.href = waUrl;
        };
      } else {
        whatsapp.removeAttribute("href");
        whatsapp.setAttribute("aria-disabled", "true");
      }

    }


    if (call) {

      const cleanPhone =
        normalizePhone(data.phoneClean || data.whatsapp || data.phone);

      if (cleanPhone) {
        const telUrl = `tel:+${cleanPhone}`;
        call.href = telUrl;
        call.onclick = function(){ window.location.href = telUrl; };
      } else {
        call.removeAttribute("href");
      }

    }

  });

}


/* =========================================================
   MESSAGES
   ========================================================= */

function getPublishedMessage(person) {

  person = normalizePerson(person);

  const possibleKeys = [

    `micla_${person}_message`,

    `micla_${person}_messages`

  ];

  for (const key of possibleKeys) {

    const value =
      getStorage(key, null);

    if (
      value !== null &&
      String(value).trim() !== ""
    ) {

      const json =
        safeJSON(value, null);

      if (json !== null) {

        if (typeof json === "string") {
          return json;
        }

        if (Array.isArray(json)) {

          const active =
            json.filter(
              item =>
                item &&
                item.published !== false &&
                item.active !== false
            );

          if (active.length) {

            const last =
              active[active.length - 1];

            return (
              last.message ||
              last.text ||
              last.content ||
              last.title ||
              ""
            );
          }

        }

        if (typeof json === "object") {

          return (
            json.message ||
            json.text ||
            json.content ||
            ""
          );

        }

      }

      return value;
    }

  }

  return "";
}


function loadMessages() {

  ["pasteur", "berger"].forEach(person => {

    const message =
      getPublishedMessage(person);

    setText(
      `${person}-message`,
      message,
      "Aucun message publié pour le moment."
    );

  });

}


/* =========================================================
   PRIÈRES PUBLIÉES
   ========================================================= */

function getPublishedPrayer(person) {

  person = normalizePerson(person);

  const value =
    getStorage(
      `micla_${person}_prayer`,
      ""
    );

  if (!value) {
    return "";
  }

  const json =
    safeJSON(value, null);

  if (json === null) {
    return value;
  }

  if (typeof json === "string") {
    return json;
  }

  if (Array.isArray(json)) {

    const active =
      json.filter(
        item =>
          item &&
          item.published !== false &&
          item.active !== false
      );

    if (!active.length) {
      return "";
    }

    const last =
      active[active.length - 1];

    return (
      last.prayer ||
      last.message ||
      last.text ||
      last.content ||
      ""
    );

  }

  return (
    json.prayer ||
    json.message ||
    json.text ||
    json.content ||
    ""
  );

}


function loadPrayers() {

  ["pasteur", "berger"].forEach(person => {

    const prayer =
      getPublishedPrayer(person);

    setText(
      `${person}-prayer`,
      prayer,
      "Aucune prière publiée pour le moment."
    );

  });

}


/* =========================================================
   ANNONCES
   ========================================================= */

function getPublishedAnnouncements(person) {

  person = normalizePerson(person);

  const value =
    getStorage(
      `micla_${person}_announcements`,
      ""
    );

  if (!value) {
    return "";
  }

  const json =
    safeJSON(value, null);

  if (json === null) {
    return value;
  }

  if (typeof json === "string") {
    return json;
  }

  if (Array.isArray(json)) {

    const active =
      json.filter(
        item =>
          item &&
          item.published !== false &&
          item.active !== false
      );

    if (!active.length) {
      return "";
    }

    return active
      .map(item => {

        const title =
          item.title ||
          "";

        const text =
          item.message ||
          item.text ||
          item.content ||
          "";

        return title
          ? `${title}\n${text}`
          : text;

      })
      .filter(Boolean)
      .join("\n\n");

  }

  return (
    json.message ||
    json.text ||
    json.content ||
    ""
  );

}


function loadAnnouncements() {

  ["pasteur", "berger"].forEach(person => {

    const announcements =
      getPublishedAnnouncements(person);

    setText(
      `${person}-announcements`,
      announcements,
      "Aucune annonce publiée pour le moment."
    );

  });

}


/* =========================================================
   VOCAUX
   ========================================================= */

function getVocals(person) {

  person = normalizePerson(person);

  let data =
    getJSON(
      `micla_${person}_audio`,
      null
    );

  if (
    !data ||
    (Array.isArray(data) && data.length === 0)
  ) {

    data =
      getJSON(
        `micla_${person}_vocals`,
        []
      );

  }

  if (!data) {
    return [];
  }

  if (!Array.isArray(data)) {

    if (typeof data === "object") {
      data = [data];
    } else {
      data = [data];
    }

  }

  return data.filter(item => {

    if (!item) return false;

    if (
      typeof item === "object" &&
      (
        item.published === false ||
        item.active === false
      )
    ) {
      return false;
    }

    return true;

  });

}


function getAudioUrl(item) {

  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return "";
  }

  return (
    item.url ||
    item.audio ||
    item.data ||
    item.src ||
    item.audioUrl ||
    ""
  );

}


function getAudioTitle(item, index) {

  if (typeof item === "string") {

    return `Vocal ${index + 1}`;

  }

  if (!item || typeof item !== "object") {

    return `Vocal ${index + 1}`;

  }

  return (
    item.title ||
    item.name ||
    `Vocal ${index + 1}`
  );

}


function getAudioDate(item) {

  if (!item || typeof item !== "object") {
    return "";
  }

  const value =
    item.createdAt ||
    item.date ||
    item.created_at ||
    "";

  if (!value) {
    return "";
  }

  try {

    return new Date(value)
      .toLocaleString("fr-FR");

  } catch {

    return String(value);

  }

}


function createAudioCard(item, index) {

  const url =
    getAudioUrl(item);

  if (!url) {
    return null;
  }

  const card =
    document.createElement("div");

  card.className =
    "audio-card";


  const title =
    document.createElement("strong");

  title.textContent =
    getAudioTitle(item, index);


  const date =
    document.createElement("small");

  const dateText =
    getAudioDate(item);

  date.textContent =
    dateText
      ? `Publié le ${dateText}`
      : "Vocal publié par l'administration";


  const audio =
    document.createElement("audio");

  audio.controls = true;

  audio.preload = "metadata";

  audio.src = url;


  card.appendChild(title);

  card.appendChild(date);

  card.appendChild(audio);


  return card;

}


function loadVocals(person) {

  person =
    normalizePerson(person);

  const container =
    document.getElementById(
      `${person}-audio`
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const vocals =
    getVocals(person);


  if (!vocals.length) {

    const empty =
      document.createElement("div");

    empty.className =
      "empty";

    empty.textContent =
      "Aucun vocal publié pour le moment.";

    container.appendChild(empty);

    return;
  }


  let count = 0;

  vocals.forEach((item, index) => {

    const card =
      createAudioCard(
        item,
        index
      );

    if (card) {

      container.appendChild(card);

      count++;

    }

  });


  if (count === 0) {

    const empty =
      document.createElement("div");

    empty.className =
      "empty";

    empty.textContent =
      "Aucun vocal publié pour le moment.";

    container.appendChild(empty);

  }

}


function loadAllVocals() {

  loadVocals("pasteur");

  loadVocals("berger");

}


/* =========================================================
   BOUTON VOCAL
   ========================================================= */

function scrollToAudio(person) {

  person =
    normalizePerson(person);

  const element =
    document.getElementById(
      `${person}-audio`
    );

  if (!element) {
    return;
  }

  const panel =
    element.closest(".panel");

  const target =
    panel || element;

  target.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


function scrollToAnnouncements(person) {

  person =
    normalizePerson(person);

  const element =
    document.getElementById(
      `${person}-announcements`
    );

  if (!element) {
    return;
  }

  const panel =
    element.closest(".panel");

  const target =
    panel || element;

  target.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


/* =========================================================
   MODAL MESSAGE
   ========================================================= */

function openMessage(person) {

  person =
    normalizePerson(person);

  currentPerson =
    person;

  const modal =
    document.getElementById(
      "messageModal"
    );

  const title =
    document.getElementById(
      "messageTitle"
    );

  const text =
    document.getElementById(
      "messageText"
    );

  if (!modal) {
    return;
  }

  if (title) {

    title.textContent =
      `Écrire à ${MICLA[person].name}`;

  }

  if (text) {
    text.value = "";
  }

  modal.classList.add("show");

}


function sendMessageWhatsApp() {

  const textElement =
    document.getElementById(
      "messageText"
    );

  const text =
    textElement
      ? textElement.value.trim()
      : "";

  if (!text) {

    alert(
      "Veuillez écrire votre message."
    );

    return;
  }


  const data =
    MICLA[currentPerson];

  const number = normalizePhone(data.whatsapp || data.phoneClean || data.phone);

  if (!number) {
    alert("Le numéro WhatsApp de ce responsable n'est pas configuré.");
    return;
  }

  const message =
    `Bonjour ${data.name},\n\n${text}`;


  const url =
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`;


  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) window.location.href = url;

}


function closeModal(id) {

  const modal =
    document.getElementById(id);

  if (modal) {

    modal.classList.remove("show");

  }

}


/* =========================================================
   PRIÈRE
   ========================================================= */

function openPrayer(person) {

  person =
    normalizePerson(person);

  currentPerson =
    person;

  const modal =
    document.getElementById(
      "prayerModal"
    );

  const title =
    document.getElementById(
      "prayerTitle"
    );

  const text =
    document.getElementById(
      "prayerText"
    );


  if (!modal) {
    return;
  }


  if (title) {

    title.textContent =
      `Demande de prière — ${MICLA[person].name}`;

  }


  if (text) {
    text.value = "";
  }


  deletePrayerRecording();

  resetPrayerTimer();

  modal.classList.add("show");

}


function closePrayer() {

  stopPrayerRecording();

  deletePrayerRecording();

  resetPrayerTimer();

  const modal =
    document.getElementById(
      "prayerModal"
    );

  if (modal) {
    modal.classList.remove("show");
  }

}


/* =========================================================
   ENREGISTREUR VOCAL
   ========================================================= */

async function startPrayerRecording() {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    updatePrayerStatus(
      "L'enregistrement vocal n'est pas disponible sur ce navigateur."
    );

    return;
  }


  if (
    typeof MediaRecorder === "undefined"
  ) {

    updatePrayerStatus(
      "MediaRecorder n'est pas disponible sur cet appareil."
    );

    return;
  }


  try {

    deletePrayerRecording();

    prayerStream =
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });


    prayerChunks = [];


    let options = {};

    if (
      MediaRecorder.isTypeSupported &&
      MediaRecorder.isTypeSupported(
        "audio/webm;codecs=opus"
      )
    ) {

      options.mimeType =
        "audio/webm;codecs=opus";

    } else if (
      MediaRecorder.isTypeSupported &&
      MediaRecorder.isTypeSupported(
        "audio/webm"
      )
    ) {

      options.mimeType =
        "audio/webm";

    }


    const recorder =
      new MediaRecorder(
        prayerStream,
        options
      );


    prayerRecorder =
      recorder;


    recorder.ondataavailable =
      function(event) {

        if (
          event.data &&
          event.data.size > 0
        ) {

          prayerChunks.push(
            event.data
          );

        }

      };


    recorder.onstop =
      function() {

        const mimeType =
          recorder.mimeType ||
          "audio/webm";


        if (!prayerChunks.length) {

          updatePrayerStatus(
            "Aucun audio enregistré."
          );

          return;
        }


        prayerAudioBlob =
          new Blob(
            prayerChunks,
            {
              type: mimeType
            }
          );


        if (prayerAudioUrl) {

          URL.revokeObjectURL(
            prayerAudioUrl
          );

        }


        prayerAudioUrl =
          URL.createObjectURL(
            prayerAudioBlob
          );


        const preview =
          document.getElementById(
            "prayerPreview"
          );


        if (preview) {

          preview.src =
            prayerAudioUrl;

          preview.style.display =
            "block";

        }


        updatePrayerStatus(
          "Vocal enregistré. Vous pouvez maintenant envoyer la demande."
        );

      };


    recorder.onerror =
      function() {

        updatePrayerStatus(
          "Une erreur est survenue pendant l'enregistrement."
        );

      };


    recorder.start();


    startPrayerTimer();


    updatePrayerStatus(
      "Enregistrement en cours..."
    );


  } catch (error) {

    console.error(
      "Erreur microphone :",
      error
    );


    updatePrayerStatus(
      "Impossible d'accéder au microphone. Autorisez le microphone puis réessayez."
    );

  }

}


function stopPrayerRecording() {

  if (
    prayerRecorder &&
    prayerRecorder.state !== "inactive"
  ) {

    try {

      prayerRecorder.stop();

    } catch (error) {

      console.warn(
        "Arrêt enregistreur :",
        error
      );

    }

  }


  if (prayerStream) {

    prayerStream
      .getTracks()
      .forEach(
        track => track.stop()
      );

    prayerStream = null;

  }


  stopPrayerTimer();


  if (
    prayerRecorder &&
    prayerRecorder.state === "inactive"
  ) {

    prayerRecorder = null;

  }

}


function deletePrayerRecording() {

  if (
    prayerRecorder &&
    prayerRecorder.state !== "inactive"
  ) {

    try {

      prayerRecorder.stop();

    } catch {}

  }


  prayerRecorder = null;


  if (prayerStream) {

    prayerStream
      .getTracks()
      .forEach(
        track => track.stop()
      );

    prayerStream = null;

  }


  prayerChunks = [];

  prayerAudioBlob = null;


  if (prayerAudioUrl) {

    try {

      URL.revokeObjectURL(
        prayerAudioUrl
      );

    } catch {}

    prayerAudioUrl = null;

  }


  const preview =
    document.getElementById(
      "prayerPreview"
    );


  if (preview) {

    preview.pause();

    preview.removeAttribute(
      "src"
    );

    preview.load();

    preview.style.display =
      "none";

  }


  updatePrayerStatus(
    "Vous pouvez écrire ou enregistrer un vocal."
  );

}


/* =========================================================
   TIMER
   ========================================================= */

function startPrayerTimer() {

  stopPrayerTimer();

  prayerSeconds = 0;

  updatePrayerTimer();


  prayerTimerInterval =
    setInterval(
      function() {

        prayerSeconds++;

        updatePrayerTimer();

      },
      1000
    );

}


function stopPrayerTimer() {

  if (prayerTimerInterval) {

    clearInterval(
      prayerTimerInterval
    );

    prayerTimerInterval =
      null;

  }

}


function resetPrayerTimer() {

  stopPrayerTimer();

  prayerSeconds = 0;

  updatePrayerTimer();

}


function updatePrayerTimer() {

  const timer =
    document.getElementById(
      "prayerTimer"
    );

  if (!timer) {
    return;
  }


  const minutes =
    Math.floor(
      prayerSeconds / 60
    );

  const seconds =
    prayerSeconds % 60;


  timer.textContent =
    `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

}


function updatePrayerStatus(message) {

  const status =
    document.getElementById(
      "prayerRecordStatus"
    );

  if (status) {

    status.textContent =
      message;

  }

}


/* =========================================================
   ENVOI DEMANDE DE PRIÈRE
   ========================================================= */

function sendPrayerWhatsApp() {

  const textElement =
    document.getElementById(
      "prayerText"
    );

  const text =
    textElement
      ? textElement.value.trim()
      : "";


  const data =
    MICLA[currentPerson];

  const number = normalizePhone(data.whatsapp || data.phoneClean || data.phone);

  if (!number) {
    alert("Le numéro WhatsApp de ce responsable n'est pas configuré.");
    return;
  }


  let message =
    `Bonjour ${data.name},\n\nJe souhaite vous transmettre une demande de prière.`;


  if (text) {

    message +=
      `\n\nMa demande :\n${text}`;

  }


  if (prayerAudioBlob) {

    message +=
      "\n\n🎙️ J'ai également enregistré un vocal. Après l'ouverture de WhatsApp, je pourrai joindre le vocal manuellement.";

  }


  const url =
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`;


  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) window.location.href = url;

}


/* =========================================================
   MODALES
   ========================================================= */

function setupModalEvents() {

  const messageModal =
    document.getElementById(
      "messageModal"
    );

  const prayerModal =
    document.getElementById(
      "prayerModal"
    );


  [messageModal, prayerModal]
    .forEach(modal => {

      if (!modal) return;

      modal.addEventListener(
        "click",
        function(event) {

          if (
            event.target === modal
          ) {

            if (
              modal.id ===
              "prayerModal"
            ) {

              closePrayer();

            } else {

              closeModal(
                modal.id
              );

            }

          }

        }
      );

    });


  document.addEventListener(
    "keydown",
    function(event) {

      if (
        event.key !== "Escape"
      ) {
        return;
      }


      if (
        prayerModal &&
        prayerModal.classList.contains(
          "show"
        )
      ) {

        closePrayer();

      }


      if (
        messageModal &&
        messageModal.classList.contains(
          "show"
        )
      ) {

        closeModal(
          "messageModal"
        );

      }

    }
  );

}


/* =========================================================
   BOUTONS ENREGISTREUR
   ========================================================= */

function setupRecorderButtons() {

  const start =
    document.getElementById(
      "startPrayerRecord"
    );

  const stop =
    document.getElementById(
      "stopPrayerRecord"
    );

  const remove =
    document.getElementById(
      "deletePrayerRecord"
    );


  if (start) {

    start.addEventListener(
      "click",
      startPrayerRecording
    );

  }


  if (stop) {

    stop.addEventListener(
      "click",
      stopPrayerRecording
    );

  }


  if (remove) {

    remove.addEventListener(
      "click",
      function() {

        deletePrayerRecording();

        resetPrayerTimer();

      }
    );

  }

}


/* =========================================================
   ANNÉE
   ========================================================= */

function setYear() {

  const year =
    document.getElementById(
      "year"
    );

  if (year) {

    year.textContent =
      new Date().getFullYear();

  }

}


/* =========================================================
   RAFRAÎCHISSEMENT
   ========================================================= */

function refreshChurchPage() {

  loadContactSettings();

  loadChurchInfo();

  loadPersonInfo("pasteur");

  loadPersonInfo("berger");

  setupContacts();

  loadMessages();

  loadPrayers();

  loadAnnouncements();

  loadAllVocals();

}


/* =========================================================
   INITIALISATION
   ========================================================= */

window.addEventListener("storage", function(event) {

  if (event.key && event.key.startsWith("micla_")) {
    refreshChurchPage();
  }

});


document.addEventListener(
  "DOMContentLoaded",
  function() {

    refreshChurchPage();

    setupModalEvents();

    setupRecorderButtons();

    setYear();

  }
);


/* =========================================================
   EXPORT GLOBAL POUR LES onclick DU HTML
   ========================================================= */

window.openMessage =
  openMessage;

window.sendMessageWhatsApp =
  sendMessageWhatsApp;

window.closeModal =
  closeModal;

window.openPrayer =
  openPrayer;

window.closePrayer =
  closePrayer;

window.sendPrayerWhatsApp =
  sendPrayerWhatsApp;

window.scrollToAudio =
  scrollToAudio;

window.scrollToAnnouncements =
  scrollToAnnouncements;

window.startPrayerRecording =
  startPrayerRecording;

window.stopPrayerRecording =
  stopPrayerRecording;

window.deletePrayerRecording =
  deletePrayerRecording;
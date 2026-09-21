document.addEventListener("DOMContentLoaded", () => {

  /* =====================================
     ANNÉE
  ====================================== */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* =====================================
     SÉCURITÉ HTML
  ====================================== */

  function escapeHTML(value) {

    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  /* =====================================
     LECTURE LOCALSTORAGE
  ====================================== */

  function getData(key, defaultValue) {

    try {

      const saved = localStorage.getItem(key);

      if (!saved) {
        return defaultValue;
      }

      return JSON.parse(saved);

    } catch (error) {

      console.error(
        "Erreur de lecture :",
        key,
        error
      );

      return defaultValue;
    }
  }


  /* =====================================
     PHOTO PRINCIPALE
  ====================================== */

  const savedPhoto =
    getData("micla_youth_photo", "");

  const mainPhoto =
    document.getElementById("youth-main-photo");

  if (savedPhoto && mainPhoto) {
    mainPhoto.src = savedPhoto;
  }


  /* =====================================
     MESSAGE
  ====================================== */

  const savedMessage =
    getData("micla_youth_message", "");

  const message =
    document.getElementById("youth-message");

  if (savedMessage && message) {

    message.innerHTML =
      escapeHTML(savedMessage);

  }


  /* =====================================
     PRIÈRE
  ====================================== */

  const savedPrayer =
    getData("micla_youth_prayer", "");

  const prayer =
    document.getElementById("youth-prayer");

  if (savedPrayer && prayer) {

    prayer.innerHTML =
      escapeHTML(savedPrayer);

  }


  /* =====================================
     NOTE
  ====================================== */

  const savedNote =
    getData("micla_youth_note", "");

  const note =
    document.getElementById("youth-note");

  if (savedNote && note) {

    note.innerHTML = `
      <strong>📢 Message à la jeunesse</strong>
      <br><br>
      ${escapeHTML(savedNote)}
    `;

  }


  /* =====================================
     PRÉDICATEUR
  ====================================== */

  const preacher =
    getData("micla_youth_preacher", "");

  const preacherElement =
    document.getElementById("youth-preacher");

  if (preacher && preacherElement) {

    preacherElement.textContent =
      preacher;

  }


  /* =====================================
     MODÉRATEUR
  ====================================== */

  const moderator =
    getData("micla_youth_moderator", "");

  const moderatorElement =
    document.getElementById("youth-moderator");

  if (moderator && moderatorElement) {

    moderatorElement.textContent =
      moderator;

  }


  /* =====================================
     ANNONCES
  ====================================== */

  const announcements =
    getData("micla_youth_announcements", []);

  const announcementContainer =
    document.getElementById("youth-announcements");


  if (
    Array.isArray(announcements) &&
    announcements.length > 0 &&
    announcementContainer
  ) {

    announcementContainer.innerHTML = "";

    announcements.forEach(item => {

      const card =
        document.createElement("div");

      card.className =
        "announcement";

      card.innerHTML = `

        <strong>
          ${escapeHTML(
            item.title || "Annonce"
          )}
        </strong>

        <p>
          ${escapeHTML(
            item.text || ""
          )}
        </p>

        ${
          item.date
          ? `
            <small>
              📅 ${escapeHTML(item.date)}
            </small>
          `
          : ""
        }

      `;

      announcementContainer.appendChild(card);

    });

  }


  /* =====================================
     VOCAUX
  ====================================== */

  const audios =
    getData("micla_youth_audios", []);

  const audioContainer =
    document.getElementById("youth-audios");


  if (
    Array.isArray(audios) &&
    audios.length > 0 &&
    audioContainer
  ) {

    audioContainer.innerHTML = "";

    audios.forEach(audio => {

      if (!audio.url) return;

      const card =
        document.createElement("div");

      card.className =
        "audio-card";

      card.innerHTML = `

        <h3>
          🎙️ ${escapeHTML(
            audio.title || "Message vocal"
          )}
        </h3>

        ${
          audio.date
          ? `
            <small>
              📅 ${escapeHTML(audio.date)}
            </small>
          `
          : ""
        }

        <audio controls preload="metadata">

          <source
            src="${escapeHTML(audio.url)}"
            type="${escapeHTML(
              audio.type || "audio/mpeg"
            )}"
          >

          Votre navigateur ne supporte
          pas la lecture audio.

        </audio>

      `;

      audioContainer.appendChild(card);

    });

  }


  /* =====================================
     GALERIE PHOTOS
  ====================================== */

  const photos =
    getData("micla_youth_gallery", []);

  const gallery =
    document.getElementById("youth-gallery");


  if (
    Array.isArray(photos) &&
    photos.length > 0 &&
    gallery
  ) {

    gallery.innerHTML = "";

    photos.forEach(photo => {

      if (!photo.url) return;

      const image =
        document.createElement("img");

      image.src =
        photo.url;

      image.alt =
        photo.title || "Photo jeunesse";

      gallery.appendChild(image);

    });

  }


  /* =====================================
     VIDÉOS
  ====================================== */

  const videos =
    getData("micla_youth_videos", []);

  const videoContainer =
    document.getElementById("youth-videos");


  if (
    Array.isArray(videos) &&
    videos.length > 0 &&
    videoContainer
  ) {

    videoContainer.innerHTML = "";

    videos.forEach(video => {

      if (!video.url) return;

      const card =
        document.createElement("div");

      card.className =
        "video-card";

      card.innerHTML = `

        <h3>
          🎬 ${escapeHTML(
            video.title || "Vidéo jeunesse"
          )}
        </h3>

        <video
          controls
          preload="metadata"
        >

          <source
            src="${escapeHTML(video.url)}"
            type="${escapeHTML(
              video.type || "video/mp4"
            )}"
          >

          Votre navigateur ne supporte
          pas la lecture vidéo.

        </video>

      `;

      videoContainer.appendChild(card);

    });

  }


  /* =====================================
     VERSET / PENSÉE
  ====================================== */

  const verse =
    getData("micla_youth_verse", "");

  const verseReference =
    getData(
      "micla_youth_verse_reference",
      ""
    );

  const verseElement =
    document.getElementById("youth-verse");

  const referenceElement =
    document.getElementById(
      "youth-verse-reference"
    );


  if (verse && verseElement) {

    verseElement.textContent =
      verse;

  }


  if (
    verseReference &&
    referenceElement
  ) {

    referenceElement.textContent =
      verseReference;

  }


  /* =====================================
     ACTIVITÉS DYNAMIQUES
  ====================================== */

  const activities =
    getData("micla_youth_activities", []);

  const activitiesContainer =
    document.getElementById(
      "youth-activities"
    );


  if (
    Array.isArray(activities) &&
    activities.length > 0 &&
    activitiesContainer
  ) {

    activitiesContainer.innerHTML = "";

    activities.forEach(activity => {

      const card =
        document.createElement("div");

      card.className =
        "activity";

      card.innerHTML = `

        <h3>
          ${escapeHTML(
            activity.title || "Activité"
          )}
        </h3>

        <p>
          ${escapeHTML(
            activity.description || ""
          )}
        </p>

      `;

      activitiesContainer.appendChild(card);

    });

  }


  console.log(
    "MI.C.L.A — Espace jeunesse chargé."
  );

});
document.addEventListener("DOMContentLoaded", () => {

  /* ================================
     ANNÉE
  ================================= */

  document.querySelectorAll("[data-year]").forEach(element => {
    element.textContent = new Date().getFullYear();
  });


  /* ================================
     SÉCURITÉ
  ================================= */

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


  /* ================================
     LECTURE DES DONNÉES
  ================================= */

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


  /* ================================
     ANNÉE / SEMAINE
  ================================= */

  const weekTitle = document.getElementById("week-title");

  const savedWeek = getData(
    "micla_program_week",
    ""
  );

  if (savedWeek && weekTitle) {
    weekTitle.textContent = savedWeek;
  }


  /* ================================
     MESSAGE D'APPEL
  ================================= */

  const callMessage =
    document.getElementById("call-message");

  const savedCall = getData(
    "micla_program_call",
    ""
  );

  if (savedCall && callMessage) {
    callMessage.textContent = savedCall;
  }


  /* ================================
     PROGRAMME
  ================================= */

  const savedProgram = getData(
    "micla_week_program",
    null
  );

  if (
    Array.isArray(savedProgram) &&
    savedProgram.length > 0
  ) {

    const table =
      document.getElementById("program-table");

    if (table) {

      table.innerHTML = "";

      savedProgram.forEach(item => {

        const row = document.createElement("tr");

        row.innerHTML = `
          <td class="day">
            ${escapeHTML(item.day || "—")}
          </td>

          <td class="activity">
            ${escapeHTML(item.activity || "—")}
          </td>

          <td>
            ${escapeHTML(item.time || "—")}
          </td>

          <td class="person">
            ${escapeHTML(item.preacher || "—")}
          </td>

          <td class="person">
            ${escapeHTML(item.moderator || "—")}
          </td>
        `;

        table.appendChild(row);

      });
    }
  }


  /* ================================
     PRÉDICATEURS
  ================================= */

  const preachers =
    getData("micla_preachers", []);

  const preachersContent =
    document.getElementById("preachers-content");

  if (
    Array.isArray(preachers) &&
    preachers.length > 0 &&
    preachersContent
  ) {

    preachersContent.innerHTML =
      preachers
        .map(person =>
          `🎙️ ${escapeHTML(person)}`
        )
        .join("<br>");
  }


  /* ================================
     MODÉRATEURS
  ================================= */

  const moderators =
    getData("micla_moderators", []);

  const moderatorsContent =
    document.getElementById("moderators-content");

  if (
    Array.isArray(moderators) &&
    moderators.length > 0 &&
    moderatorsContent
  ) {

    moderatorsContent.innerHTML =
      moderators
        .map(person =>
          `🎤 ${escapeHTML(person)}`
        )
        .join("<br>");
  }


  /* ================================
     AUTRES RESPONSABILITÉS
  ================================= */

  const responsibilities = {
    singers: "micla_singers",
    intercession: "micla_intercession",
    "bible-reader": "micla_bible_reader",
    protocol: "micla_protocol",
    security: "micla_security",
    media: "micla_media",
    music: "micla_music",
    welcome: "micla_welcome"
  };


  Object.entries(responsibilities).forEach(
    ([elementId, storageKey]) => {

      const element =
        document.getElementById(elementId);

      if (!element) return;

      const value =
        getData(storageKey, "");

      if (value) {
        element.textContent = value;
      }

    }
  );


  /* ================================
     BOUTONS LISTES
  ================================= */

  window.toggleList = function(listId, button) {

    const list =
      document.getElementById(listId);

    if (!list) return;

    const isOpen =
      list.classList.contains("show");

    /*
      Fermer les autres listes
    */

    document
      .querySelectorAll(".list-box")
      .forEach(box => {
        box.classList.remove("show");
      });

    document
      .querySelectorAll(".action-btn")
      .forEach(btn => {
        btn.classList.remove("active");
      });


    /*
      Ouvrir la liste sélectionnée
    */

    if (!isOpen) {

      list.classList.add("show");

      if (button) {
        button.classList.add("active");
      }

    }

  };


  /* ================================
     MESSAGE CONSOLE
  ================================= */

  console.log(
    "MI.C.L.A — Programme chargé avec succès."
  );

});
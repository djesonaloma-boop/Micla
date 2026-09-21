document.addEventListener("DOMContentLoaded", () => {

  /* =========================================
     NUMÉROS WHATSAPP OFFICIELS
  ========================================== */

  const chantres = {
    betty: {
      nom: "Sœur Betty Bakadisanga",
      whatsapp: "243910013337"
    },

    prodige: {
      nom: "Prodige Masanka",
      whatsapp: "243848633243"
    }
  };


  /* =========================================
     WHATSAPP BETTY
  ========================================== */

  const bettyButton =
    document.getElementById("whatsapp-betty");

  if (bettyButton) {

    bettyButton.href =
      "https://wa.me/" +
      chantres.betty.whatsapp;

    bettyButton.target = "_blank";

    bettyButton.rel =
      "noopener noreferrer";
  }


  /* =========================================
     WHATSAPP PRODIGE
  ========================================== */

  const prodigeButton =
    document.getElementById("whatsapp-prodige");

  if (prodigeButton) {

    prodigeButton.href =
      "https://wa.me/" +
      chantres.prodige.whatsapp;

    prodigeButton.target = "_blank";

    prodigeButton.rel =
      "noopener noreferrer";
  }


  /* =========================================
     ANNÉE
  ========================================== */

  const year =
    document.getElementById("year");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }


  /* =========================================
     SÉCURITÉ HTML
  ========================================== */

  function escapeHTML(value) {

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  /* =========================================
     LOCAL STORAGE
  ========================================== */

  function getData(key, defaultValue) {

    try {

      const data =
        localStorage.getItem(key);

      if (!data) {
        return defaultValue;
      }

      return JSON.parse(data);

    } catch (error) {

      console.error(
        "Erreur localStorage :",
        error
      );

      return defaultValue;
    }
  }


  /* =========================================
     AUTRES CHANTRES
  ========================================== */

  const container =
    document.getElementById("other-singers");

  if (container) {

    const singers =
      getData(
        "micla_other_singers",
        []
      );

    if (
      !Array.isArray(singers) ||
      singers.length === 0
    ) {

      container.innerHTML = `
        <p class="empty">
          Aucun autre chantre n'a encore été ajouté.
        </p>
      `;

    } else {

      container.innerHTML = "";

      singers.forEach((singer) => {

        const item =
          document.createElement("div");

        item.className =
          "extra-item";

        const name =
          escapeHTML(
            singer.name ||
            "Chantre"
          );

        const role =
          escapeHTML(
            singer.role ||
            "Chantre de l'église"
          );

        const phone =
          String(
            singer.phone || ""
          ).replace(/\D/g, "");

        item.innerHTML = `
          <strong>
            🎤 ${name}
          </strong>

          <span>
            ${role}
          </span>

          ${
            phone
              ? `
                <br><br>

                <a
                  href="https://wa.me/${phone}"
                  class="whatsapp-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Contacter sur WhatsApp
                </a>
              `
              : ""
          }
        `;

        container.appendChild(item);

      });

    }

  }


  /* =========================================
     CONSOLE
  ========================================== */

  console.log(
    "MI.C.L.A — Page Chantres chargée."
  );

});
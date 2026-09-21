document.addEventListener("DOMContentLoaded", () => {

  /* =====================================
     ANNÉE
  ====================================== */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* =====================================
     LECTURE LOCALSTORAGE
  ====================================== */

  function getData(key, defaultValue) {

    try {

      const value = localStorage.getItem(key);

      if (!value) {
        return defaultValue;
      }

      return JSON.parse(value);

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
     SÉCURITÉ HTML
  ====================================== */

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


  /* =====================================
     PROTOCOLE
  ====================================== */

  const protocolMembers =
    getData(
      "micla_protocol_members",
      []
    );

  const protocolContainer =
    document.getElementById(
      "protocol-members"
    );


  function renderMembers(
    members,
    container,
    defaultRole
  ) {

    if (!container) return;

    if (
      !Array.isArray(members) ||
      members.length === 0
    ) {

      container.innerHTML = `
        <p class="empty">
          Aucun membre publié pour le moment.
        </p>
      `;

      return;
    }


    container.innerHTML = "";


    members.forEach(member => {

      if (
        member.active === false
      ) {
        return;
      }


      const article =
        document.createElement("article");

      article.className =
        "member";


      const photo =
        document.createElement("img");

      photo.className =
        "member-photo";

      photo.src =
        member.photo ||
        "assets/images/eglise.jpg";

      photo.alt =
        member.name ||
        defaultRole;

      photo.onerror = () => {

        photo.src =
          "assets/images/eglise.jpg";

      };


      const info =
        document.createElement("div");

      info.className =
        "member-info";


      const name =
        document.createElement("h4");

      name.textContent =
        member.name ||
        "Nom non renseigné";


      const role =
        document.createElement("p");

      role.textContent =
        member.role ||
        defaultRole;


      info.appendChild(name);
      info.appendChild(role);


      if (member.description) {

        const description =
          document.createElement("p");

        description.textContent =
          member.description;

        info.appendChild(description);

      }


      if (member.phone) {

        const phone =
          String(member.phone)
            .replace(/\D/g, "");


        if (phone) {

          const whatsapp =
            document.createElement("a");

          whatsapp.className =
            "whatsapp";

          whatsapp.href =
            "https://wa.me/" + phone;

          whatsapp.target =
            "_blank";

          whatsapp.rel =
            "noopener";

          whatsapp.textContent =
            "💬 WhatsApp";

          info.appendChild(whatsapp);

        }

      }


      article.appendChild(photo);
      article.appendChild(info);

      container.appendChild(article);

    });

  }


  renderMembers(
    protocolMembers,
    protocolContainer,
    "Membre du Protocole"
  );


  /* =====================================
     SÉCURITÉ
  ====================================== */

  const securityMembers =
    getData(
      "micla_security_members",
      []
    );

  const securityContainer =
    document.getElementById(
      "security-members"
    );


  renderMembers(
    securityMembers,
    securityContainer,
    "Membre de la Sécurité"
  );


  /* =====================================
     TABLEAU DE LA SEMAINE
  ====================================== */

  const schedule =
    getData(
      "micla_protocol_security_schedule",
      []
    );

  const table =
    document.getElementById(
      "service-table"
    );


  if (
    Array.isArray(schedule) &&
    schedule.length > 0 &&
    table
  ) {

    table.innerHTML = "";


    schedule.forEach(item => {

      const row =
        document.createElement("tr");


      const day =
        document.createElement("td");

      day.textContent =
        item.day || "—";


      const time =
        document.createElement("td");

      time.textContent =
        item.time || "—";


      const activity =
        document.createElement("td");

      activity.textContent =
        item.activity || "—";


      const protocol =
        document.createElement("td");

      protocol.textContent =
        item.protocol || "—";


      const security =
        document.createElement("td");

      security.textContent =
        item.security || "—";


      row.appendChild(day);
      row.appendChild(time);
      row.appendChild(activity);
      row.appendChild(protocol);
      row.appendChild(security);


      table.appendChild(row);

    });

  }


  /* =====================================
     NOTE DE DISCIPLINE
  ====================================== */

  const disciplineNote =
    getData(
      "micla_protocol_security_note",
      ""
    );

  const note =
    document.getElementById(
      "discipline-note"
    );


  if (
    disciplineNote &&
    note
  ) {

    note.innerHTML = `

      <strong>
        ⏰ Note importante — Respect du programme
      </strong>

      ${escapeHTML(disciplineNote)}

    `;

  }


  /* =====================================
     ANNONCES
  ====================================== */

  const announcements =
    getData(
      "micla_protocol_security_announcements",
      []
    );

  const announcementsContainer =
    document.getElementById(
      "announcements"
    );


  if (
    Array.isArray(announcements) &&
    announcements.length > 0 &&
    announcementsContainer
  ) {

    announcementsContainer.innerHTML = "";


    announcements.forEach(item => {

      if (
        item.active === false
      ) {
        return;
      }


      const article =
        document.createElement("article");

      article.className =
        "announcement";


      const title =
        document.createElement("h3");

      title.textContent =
        "📢 " +
        (
          item.title ||
          "Annonce"
        );


      const text =
        document.createElement("p");

      text.textContent =
        item.text || "";


      article.appendChild(title);
      article.appendChild(text);


      if (item.date) {

        const date =
          document.createElement("small");

        date.textContent =
          "📅 " + item.date;

        article.appendChild(date);

      }


      announcementsContainer
        .appendChild(article);

    });

  }


  /* =====================================
     CONSIGNES
  ====================================== */

  const instructions =
    getData(
      "micla_protocol_security_instructions",
      []
    );

  const instructionsContainer =
    document.getElementById(
      "instructions"
    );


  if (
    Array.isArray(instructions) &&
    instructions.length > 0 &&
    instructionsContainer
  ) {

    instructionsContainer.innerHTML = "";


    instructions.forEach(item => {

      const box =
        document.createElement("div");

      box.className =
        "instruction";


      const title =
        document.createElement("h3");

      title.textContent =
        item.title ||
        "Consigne";


      const text =
        document.createElement("p");

      text.textContent =
        item.text || "";


      box.appendChild(title);
      box.appendChild(text);


      instructionsContainer
        .appendChild(box);

    });

  }


  /* =====================================
     GALERIE
  ====================================== */

  const gallery =
    getData(
      "micla_protocol_security_gallery",
      []
    );

  const galleryContainer =
    document.getElementById(
      "gallery"
    );


  if (
    Array.isArray(gallery) &&
    gallery.length > 0 &&
    galleryContainer
  ) {

    galleryContainer.innerHTML = "";


    gallery.forEach(item => {

      if (!item.url) return;


      const box =
        document.createElement("div");

      box.className =
        "gallery-item";


      const image =
        document.createElement("img");

      image.src =
        item.url;

      image.alt =
        item.title ||
        "Photo Protocole & Sécurité";


      image.onerror = () => {

        box.remove();

      };


      box.appendChild(image);


      if (item.title) {

        const title =
          document.createElement("p");

        title.textContent =
          item.title;

        box.appendChild(title);

      }


      galleryContainer
        .appendChild(box);

    });

  }


  console.log(
    "MI.C.L.A — Protocole & Sécurité chargé."
  );

});
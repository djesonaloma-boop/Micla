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
     CHAMPS
  ========================= */

  const name =
    document.getElementById("name");

  const role =
    document.getElementById("role");

  const phone =
    document.getElementById("phone");

  const main =
    document.getElementById("main");

  const description =
    document.getElementById("description");

  const photo =
    document.getElementById("photo");

  const audio =
    document.getElementById("audio");

  const video =
    document.getElementById("video");

  const status =
    document.getElementById("status");

  const grid =
    document.getElementById("singerGrid");


  /* =========================
     STORAGE
  ========================= */

  let singers =
    JSON.parse(
      localStorage.getItem("micla_other_singers") || "[]"
    );


  if (!Array.isArray(singers)) {
    singers = [];
  }


  function saveSingers(){

    localStorage.setItem(
      "micla_other_singers",
      JSON.stringify(singers)
    );

  }


  /* =========================
     LECTURE FICHIER
  ========================= */

  function readFile(file){

    return new Promise(resolve => {

      if(!file){
        resolve("");
        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        resolve("");
      };

      reader.readAsDataURL(file);

    });

  }


  /* =========================
     AFFICHAGE
  ========================= */

  function renderSingers(){

    grid.innerHTML = "";

    if(!singers.length){

      grid.innerHTML = `
        <div class="empty">
          Aucun chantre n'a encore été ajouté.
        </div>
      `;

      return;
    }


    singers.forEach(singer => {

      const card =
        document.createElement("article");

      card.className = "singer-card";


      const photoHTML =
        singer.photo

        ? `
          <img
            class="singer-photo"
            src="${singer.photo}"
            alt="${escapeHTML(singer.name)}"
          >
        `

        : `
          <div
            class="singer-photo"
            style="
              display:grid;
              place-items:center;
              color:#d8b45a;
              font-size:55px;
            "
          >
            ♪
          </div>
        `;


      const badge =
        singer.active !== false

        ? `
          <span class="badge active">
            Actif
          </span>
        `

        : `
          <span class="badge inactive">
            Désactivé
          </span>
        `;


      const mainBadge =
        singer.main

        ? `
          <span class="badge active">
            Principal
          </span>
        `

        : "";


      card.innerHTML = `

        ${photoHTML}

        <div class="singer-content">

          <h3>
            ${escapeHTML(singer.name)}
          </h3>

          <div class="role">
            ${escapeHTML(singer.role || "Chantre")}
          </div>

          ${
            singer.phone
            ? `
              <div class="phone">
                ${escapeHTML(singer.phone)}
              </div>
            `
            : ""
          }

          ${
            singer.description
            ? `
              <div class="description">
                ${escapeHTML(singer.description)}
              </div>
            `
            : ""
          }

          ${
            singer.audio
            ? `
              <audio
                controls
                preload="none"
                src="${singer.audio}">
              </audio>
            `
            : ""
          }

          ${
            singer.video
            ? `
              <video
                controls
                preload="metadata"
                src="${singer.video}">
              </video>
            `
            : ""
          }

          <div>
            ${badge}
            ${mainBadge}
          </div>

          <div class="singer-actions">

            <button
              class="btn toggle"
              data-id="${singer.id}">
              ${
                singer.active !== false
                ? "Désactiver"
                : "Activer"
              }
            </button>

            <button
              class="btn primary principal"
              data-id="${singer.id}">
              ${
                singer.main
                ? "Retirer principal"
                : "Définir principal"
              }
            </button>

            <button
              class="btn danger delete"
              data-id="${singer.id}">
              Supprimer
            </button>

          </div>

        </div>
      `;


      grid.appendChild(card);

    });


    attachActions();

  }


  /* =========================
     ACTIONS
  ========================= */

  function attachActions(){

    document
      .querySelectorAll(".toggle")
      .forEach(button => {

        button.addEventListener("click", () => {

          const singer =
            singers.find(
              item => item.id === button.dataset.id
            );

          if(!singer) return;

          singer.active =
            singer.active === false;

          saveSingers();

          renderSingers();

        });

      });


    document
      .querySelectorAll(".principal")
      .forEach(button => {

        button.addEventListener("click", () => {

          const id =
            button.dataset.id;

          singers.forEach(singer => {

            singer.main =
              singer.id === id;

          });

          saveSingers();

          renderSingers();

        });

      });


    document
      .querySelectorAll(".delete")
      .forEach(button => {

        button.addEventListener("click", () => {

          const confirmed =
            confirm(
              "Voulez-vous vraiment supprimer ce chantre ?"
            );

          if(!confirmed) return;


          singers =
            singers.filter(
              singer =>
                singer.id !== button.dataset.id
            );


          saveSingers();

          renderSingers();

        });

      });

  }


  /* =========================
     AJOUTER UN CHANTRE
  ========================= */

  document
    .getElementById("saveSinger")
    .addEventListener("click", async () => {

      const singerName =
        name.value.trim();

      const singerRole =
        role.value.trim();

      const singerPhone =
        phone.value.trim();

      const singerDescription =
        description.value.trim();


      if(!singerName){

        status.textContent =
          "Veuillez entrer le nom du chantre.";

        name.focus();

        return;
      }


      status.textContent =
        "Préparation des fichiers...";


      try{

        const [
          photoData,
          audioData,
          videoData
        ] = await Promise.all([

          readFile(photo.files[0]),

          readFile(audio.files[0]),

          readFile(video.files[0])

        ]);


        /*
         * Si on choisit un chantre principal,
         * les autres deviennent automatiquement
         * membres normaux.
         */

        const isMain =
          main.value === "true";


        if(isMain){

          singers.forEach(singer => {
            singer.main = false;
          });

        }


        const singer = {

          id:
            Date.now().toString(),

          name:
            singerName,

          role:
            singerRole || "Chantre",

          phone:
            singerPhone,

          description:
            singerDescription,

          photo:
            photoData,

          audio:
            audioData,

          video:
            videoData,

          main:
            isMain,

          active:
            true,

          createdAt:
            new Date().toISOString()

        };


        singers.unshift(singer);

        saveSingers();

        renderSingers();

        clearForm();


        status.textContent =
          "✓ Chantre ajouté avec succès.";

      }

      catch(error){

        console.error(error);

        status.textContent =
          "Une erreur est survenue.";

      }

    });


  /* =========================
     EFFACER
  ========================= */

  function clearForm(){

    name.value = "";
    role.value = "";
    phone.value = "";
    description.value = "";

    main.value = "false";

    photo.value = "";
    audio.value = "";
    video.value = "";

  }


  document
    .getElementById("clearForm")
    .addEventListener("click", () => {

      clearForm();

      status.textContent = "";

    });


  /* =========================
     PROTECTION HTML
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
     INITIALISATION
  ========================= */

  renderSingers();

});
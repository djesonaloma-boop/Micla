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

  const title =
    document.getElementById("title");

  const artist =
    document.getElementById("artist");

  const description =
    document.getElementById("description");

  const cover =
    document.getElementById("cover");

  const audio =
    document.getElementById("audio");

  const status =
    document.getElementById("status");

  const grid =
    document.getElementById("musicGrid");


  /* =========================
     STORAGE
  ========================= */

  let songs =
    JSON.parse(
      localStorage.getItem("micla_songs") || "[]"
    );


  if (!Array.isArray(songs)) {
    songs = [];
  }


  function saveSongs(){

    localStorage.setItem(
      "micla_songs",
      JSON.stringify(songs)
    );

  }


  /* =========================
     AFFICHAGE
  ========================= */

  function renderSongs(){

    grid.innerHTML = "";

    if (!songs.length) {

      grid.innerHTML = `
        <div class="empty">
          Aucune chanson n'a encore été ajoutée.
        </div>
      `;

      return;
    }


    songs.forEach(song => {

      const card =
        document.createElement("article");

      card.className = "music-card";


      const coverHTML =
        song.cover
        ? `<img
             class="cover"
             src="${song.cover}"
             alt="Pochette">
           `
        : `
          <div
            class="cover"
            style="
              display:grid;
              place-items:center;
              color:#d8b45a;
              font-size:40px;
            ">
            ♪
          </div>
        `;


      const badge =
        song.active !== false
        ? `<span class="badge active">
             Publiée
           </span>`
        : `<span class="badge inactive">
             Désactivée
           </span>`;


      card.innerHTML = `

        ${coverHTML}

        <div class="music-content">

          <h3>
            ${escapeHTML(song.title)}
          </h3>

          <div class="artist">
            ${escapeHTML(song.artist)}
          </div>

          <div class="description">
            ${escapeHTML(song.description || "")}
          </div>

          ${song.audio
            ? `
              <audio
                controls
                preload="none"
                src="${song.audio}">
              </audio>
            `
            : ""
          }

          ${badge}

          <div class="card-actions">

            <button
              class="btn toggle"
              data-id="${song.id}">
              ${song.active !== false
                ? "Désactiver"
                : "Activer"}
            </button>

            <button
              class="btn danger delete"
              data-id="${song.id}">
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

          const id = button.dataset.id;

          const song =
            songs.find(item => item.id === id);

          if (!song) return;

          song.active =
            song.active === false;

          saveSongs();
          renderSongs();

        });

      });


    document
      .querySelectorAll(".delete")
      .forEach(button => {

        button.addEventListener("click", () => {

          const id = button.dataset.id;

          const confirmed =
            confirm(
              "Voulez-vous vraiment supprimer cette chanson ?"
            );

          if (!confirmed) return;


          songs =
            songs.filter(
              item => item.id !== id
            );


          saveSongs();
          renderSongs();

        });

      });

  }


  /* =========================
     AJOUTER UNE CHANSON
  ========================= */

  document
    .getElementById("saveSong")
    .addEventListener("click", () => {

      const songTitle =
        title.value.trim();

      const songArtist =
        artist.value.trim();

      const songDescription =
        description.value.trim();

      const coverFile =
        cover.files[0];

      const audioFile =
        audio.files[0];


      if (!songTitle) {

        status.textContent =
          "Veuillez entrer le titre de la chanson.";

        title.focus();

        return;
      }


      if (!songArtist) {

        status.textContent =
          "Veuillez entrer le nom de l'artiste.";

        artist.focus();

        return;
      }


      if (!audioFile) {

        status.textContent =
          "Veuillez sélectionner un fichier audio.";

        return;
      }


      /*
       * Lecture de la pochette
       */

      const readCover = () => {

        return new Promise(resolve => {

          if (!coverFile) {
            resolve("");
            return;
          }


          const reader =
            new FileReader();

          reader.onload = () => {
            resolve(reader.result);
          };

          reader.readAsDataURL(coverFile);

        });

      };


      /*
       * Lecture de l'audio
       */

      const readAudio = () => {

        return new Promise(resolve => {

          const reader =
            new FileReader();

          reader.onload = () => {
            resolve(reader.result);
          };

          reader.readAsDataURL(audioFile);

        });

      };


      status.textContent =
        "Préparation de la chanson...";


      Promise
        .all([
          readCover(),
          readAudio()
        ])
        .then(([coverData,audioData]) => {

          const song = {

            id:
              Date.now().toString(),

            title:
              songTitle,

            artist:
              songArtist,

            description:
              songDescription,

            cover:
              coverData,

            audio:
              audioData,

            fileName:
              audioFile.name,

            active:
              true,

            createdAt:
              new Date().toISOString()

          };


          songs.unshift(song);

          saveSongs();

          renderSongs();

          clearForm();


          status.textContent =
            "✓ Chanson ajoutée avec succès.";

        })
        .catch(error => {

          console.error(error);

          status.textContent =
            "Une erreur est survenue pendant l'ajout.";

        });

    });


  /* =========================
     EFFACER LE FORMULAIRE
  ========================= */

  function clearForm(){

    title.value = "";
    artist.value = "";
    description.value = "";
    cover.value = "";
    audio.value = "";

  }


  document
    .getElementById("clearForm")
    .addEventListener("click", () => {

      clearForm();

      status.textContent = "";

    });


  /* =========================
     SUPPRIMER TOUT
  ========================= */

  document
    .getElementById("clearAll")
    .addEventListener("click", () => {

      if (!songs.length) return;


      const confirmed =
        confirm(
          "Voulez-vous vraiment supprimer toutes les chansons ?"
        );


      if (!confirmed) return;


      songs = [];

      saveSongs();

      renderSongs();

      status.textContent =
        "Toutes les chansons ont été supprimées.";

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

  renderSongs();

});
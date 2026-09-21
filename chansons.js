const STORAGE_KEY = "micla_songs";

const container = document.getElementById("songs-container");
const empty = document.getElementById("empty");


/* ================================
   PROTECTION DU TEXTE
================================ */

function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ================================
   RÉCUPÉRER LES CHANSONS
================================ */

function getSongs() {

  try {

    const songs =
      JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

    if (!Array.isArray(songs)) {
      return [];
    }

    return songs;

  } catch (error) {

    console.error(
      "Erreur de lecture des chansons :",
      error
    );

    return [];
  }
}


/* ================================
   AFFICHER LES CHANSONS
================================ */

function renderSongs() {

  const songs = getSongs()
    .filter(song => song.active !== false);

  container.innerHTML = "";


  /* AUCUNE CHANSON */

  if (songs.length === 0) {

    empty.style.display = "block";

    return;
  }


  empty.style.display = "none";


  /* CRÉATION DES CARTES */

  songs.forEach((song, index) => {

    const card =
      document.createElement("article");

    card.className = "song-card";


    /* POCHETTE */

    let coverHTML = `
      <div class="cover">
        <div class="cover-placeholder">
          🎵
        </div>
      </div>
    `;


    if (song.cover) {

      coverHTML = `
        <div class="cover">

          <img
            src="${escapeHTML(song.cover)}"
            alt="${escapeHTML(song.title || "Chanson")}"
            loading="lazy"
          >

        </div>
      `;
    }


    /* AUDIO */

    let audioHTML = "";

    if (song.audio) {

      audioHTML = `
        <div class="audio-box">

          <audio
            controls
            preload="metadata"
            src="${escapeHTML(song.audio)}"
          >
            Votre navigateur ne prend pas en charge
            la lecture audio.
          </audio>

        </div>
      `;
    }


    /* TÉLÉCHARGEMENT */

    let downloadHTML = "";

    if (song.audio) {

      downloadHTML = `
        <a
          class="action download"
          href="${escapeHTML(song.audio)}"
          download="${escapeHTML(
            song.fileName ||
            song.title ||
            "chanson"
          )}"
        >
          ⬇️ Télécharger
        </a>
      `;

    } else {

      downloadHTML = `
        <span class="action">
          Audio indisponible
        </span>
      `;
    }


    /* CARTE */

    card.innerHTML = `

      ${coverHTML}

      <div class="song-content">

        <div class="badge">
          🎵 CHANSON
        </div>

        <h2 class="song-title">
          ${escapeHTML(
            song.title || "Sans titre"
          )}
        </h2>

        <div class="artist">
          ${escapeHTML(
            song.artist ||
            "MI.C.L.A — Cité de Refuge"
          )}
        </div>

        ${
          song.description
            ? `
              <p class="description">
                ${escapeHTML(song.description)}
              </p>
            `
            : ""
        }

        ${audioHTML}

        <div class="actions">

          <button
            type="button"
            class="action"
            data-share="${index}"
          >
            📤 Partager
          </button>

          ${downloadHTML}

        </div>

      </div>
    `;


    container.appendChild(card);

  });


  /* BOUTONS PARTAGER */

  document
    .querySelectorAll("[data-share]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(button.dataset.share);

          shareSong(songs[index]);

        }
      );

    });
}


/* ================================
   PARTAGER UNE CHANSON
================================ */

async function shareSong(song) {

  if (!song) {
    return;
  }


  const title =
    song.title ||
    "Chanson MI.C.L.A";


  const text =
    `🎵 ${title}\n` +
    `MI.C.L.A — Cité de Refuge`;


  /* PARTAGE NATIF DU TÉLÉPHONE */

  if (navigator.share) {

    try {

      await navigator.share({

        title: title,

        text: text,

        url: window.location.href

      });

    } catch (error) {
      /* Partage annulé */
    }

    return;
  }


  /* COPIE DU LIEN */

  try {

    await navigator.clipboard.writeText(
      window.location.href
    );

    alert(
      "Lien de la page copié."
    );

  } catch (error) {

    alert(
      "Impossible de partager la chanson."
    );
  }
}


/* ================================
   ACTUALISATION AUTOMATIQUE
================================ */

window.addEventListener(
  "storage",
  event => {

    if (event.key === STORAGE_KEY) {
      renderSongs();
    }

  }
);


document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState ===
      "visible"
    ) {
      renderSongs();
    }

  }
);


/* ================================
   DÉMARRAGE
================================ */

renderSongs();
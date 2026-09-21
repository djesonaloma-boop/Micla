/* =========================================================
   MI.C.L.A — ADMIN ÉGLISE
   Pasteur + Berger
   Messages / Prières / Annonces / Vocaux
   Maximum vocal : 50 minutes
   ========================================================= */

"use strict";

const MAX_DURATION = 50 * 60 * 1000;


/* =========================================================
   OUTILS LOCALSTORAGE
   ========================================================= */

function getJSON(key, fallback = []) {

  try {

    const value = localStorage.getItem(key);

    if (!value) return fallback;

    const parsed = JSON.parse(value);

    return parsed;

  } catch (error) {

    console.error("Erreur lecture:", key, error);

    return fallback;
  }
}

function saveJSON(key, value) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;

  } catch (error) {

    console.error("Erreur sauvegarde:", error);

    alert(
      "Impossible de sauvegarder cette donnée. " +
      "Un vocal trop long peut dépasser la capacité du stockage du navigateur."
    );

    return false;
  }
}

function status(id, message, type = "") {

  const element =
    document.getElementById(id);

  if (!element) return;

  element.textContent = message;
  element.className =
    "status " + type;
}


/* =========================================================
   DONNÉES PASTEUR / BERGER
   ========================================================= */

const people = {

  pasteur: {

    infoKey: "micla_pasteur_info",

    messageKey: "micla_pasteur_message",

    prayerKey: "micla_pasteur_prayer",

    announcementsKey:
      "micla_pasteur_announcements",

    audioKey:
      "micla_pasteur_audio",

    nameId: "pastorName",

    phoneId: "pastorPhone",

    messageId: "pastorMessage",

    prayerId: "pastorPrayer",

    announcementsId:
      "pastorAnnouncements",

    statusId:
      "pastorStatus"
  },

  berger: {

    infoKey: "micla_berger_info",

    messageKey: "micla_berger_message",

    prayerKey: "micla_berger_prayer",

    announcementsKey:
      "micla_berger_announcements",

    audioKey:
      "micla_berger_audio",

    nameId: "bergerName",

    phoneId: "bergerPhone",

    messageId: "bergerMessage",

    prayerId: "bergerPrayer",

    announcementsId:
      "bergerAnnouncements",

    statusId:
      "bergerStatus"
  }
};


/* =========================================================
   ENREGISTREUR
   ========================================================= */

class VoiceRecorder {

  constructor(person) {

    this.person = person;

    this.config = people[person];

    this.recorder = null;

    this.stream = null;

    this.chunks = [];

    this.blob = null;

    this.url = null;

    this.timer = 0;

    this.timerInterval = null;

    this.startTime = 0;

    this.pausedTime = 0;

    this.isPaused = false;

    this.bindButtons();

    this.loadList();
  }


  /* -------------------------------------------------------
     BOUTONS
     ------------------------------------------------------- */

  bindButtons() {

    const prefix =
      this.person === "pasteur"
        ? "pastor"
        : "berger";

    document
      .getElementById(prefix + "StartRecord")
      ?.addEventListener(
        "click",
        () => this.start()
      );

    document
      .getElementById(prefix + "PauseRecord")
      ?.addEventListener(
        "click",
        () => this.pause()
      );

    document
      .getElementById(prefix + "ResumeRecord")
      ?.addEventListener(
        "click",
        () => this.resume()
      );

    document
      .getElementById(prefix + "StopRecord")
      ?.addEventListener(
        "click",
        () => this.stop()
      );

    document
      .getElementById(prefix + "DeleteRecord")
      ?.addEventListener(
        "click",
        () => this.delete()
      );

    document
      .getElementById(prefix + "PublishRecord")
      ?.addEventListener(
        "click",
        () => this.publish()
      );
  }


  /* -------------------------------------------------------
     MICROPHONE
     ------------------------------------------------------- */

  async start() {

    if (
      this.recorder &&
      this.recorder.state === "recording"
    ) {
      return;
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      this.setState(
        "Votre navigateur ne supporte pas le microphone.",
        true
      );

      return;
    }

    try {

      this.stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });

      this.chunks = [];

      this.blob = null;

      const options = {};

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus"
        )
      ) {

        options.mimeType =
          "audio/webm;codecs=opus";

      } else if (
        MediaRecorder.isTypeSupported(
          "audio/webm"
        )
      ) {

        options.mimeType =
          "audio/webm";
      }

      this.recorder =
        new MediaRecorder(
          this.stream,
          options
        );

      this.recorder.ondataavailable =
        event => {

          if (
            event.data &&
            event.data.size > 0
          ) {

            this.chunks.push(event.data);
          }
        };


      this.recorder.onstop =
        () => {

          const type =
            this.recorder.mimeType ||
            "audio/webm";

          this.blob =
            new Blob(
              this.chunks,
              { type }
            );

          if (this.url) {
            URL.revokeObjectURL(
              this.url
            );
          }

          this.url =
            URL.createObjectURL(
              this.blob
            );

          this.showPreview();

          this.setState(
            "Vocal enregistré. Vous pouvez l'écouter puis le publier."
          );

          this.stopStream();
        };


      this.recorder.start(1000);

      this.timer = 0;

      this.startTime =
        Date.now();

      this.pausedTime = 0;

      this.isPaused = false;

      this.startTimer();

      this.setState(
        "🔴 Enregistrement en cours..."
      );

    } catch (error) {

      console.error(error);

      this.setState(
        "Impossible d'accéder au microphone. Autorisez le microphone.",
        true
      );
    }
  }


  /* -------------------------------------------------------
     PAUSE
     ------------------------------------------------------- */

  pause() {

    if (
      !this.recorder ||
      this.recorder.state !== "recording"
    ) {
      return;
    }

    this.recorder.pause();

    this.isPaused = true;

    this.pausedTime =
      Date.now();

    this.setState(
      "⏸️ Enregistrement en pause."
    );
  }


  /* -------------------------------------------------------
     REPRISE
     ------------------------------------------------------- */

  resume() {

    if (
      !this.recorder ||
      this.recorder.state !== "paused"
    ) {
      return;
    }

    this.recorder.resume();

    this.isPaused = false;

    if (this.pausedTime) {

      this.startTime +=
        Date.now() -
        this.pausedTime;
    }

    this.pausedTime = 0;

    this.setState(
      "🔴 Enregistrement repris..."
    );
  }


  /* -------------------------------------------------------
     STOP
     ------------------------------------------------------- */

  stop() {

    this.stopTimer();

    if (
      this.recorder &&
      this.recorder.state !== "inactive"
    ) {

      this.recorder.stop();

    } else {

      this.stopStream();
    }
  }


  /* -------------------------------------------------------
     TIMER
     ------------------------------------------------------- */

  startTimer() {

    this.stopTimer();

    this.updateTimer();

    this.timerInterval =
      setInterval(
        () => {

          if (this.isPaused) {
            return;
          }

          this.updateTimer();

          const elapsed =
            Date.now() -
            this.startTime;

          if (
            elapsed >= MAX_DURATION
          ) {

            this.stop();

            this.setState(
              "⏱️ Limite de 50 minutes atteinte."
            );
          }

        },
        500
      );
  }


  updateTimer() {

    if (!this.startTime) return;

    let elapsed =
      Date.now() -
      this.startTime;

    if (this.isPaused &&
        this.pausedTime) {

      elapsed =
        this.pausedTime -
        this.startTime;
    }

    this.timer =
      Math.floor(
        elapsed / 1000
      );

    const minutes =
      Math.floor(
        this.timer / 60
      )
      .toString()
      .padStart(2, "0");

    const seconds =
      (this.timer % 60)
      .toString()
      .padStart(2, "0");

    const id =
      this.person === "pasteur"
        ? "pastorTimer"
        : "bergerTimer";

    const element =
      document.getElementById(id);

    if (element) {
      element.textContent =
        minutes + ":" + seconds;
    }
  }


  stopTimer() {

    if (this.timerInterval) {

      clearInterval(
        this.timerInterval
      );

      this.timerInterval = null;
    }
  }


  /* -------------------------------------------------------
     PREVIEW
     ------------------------------------------------------- */

  showPreview() {

    const id =
      this.person === "pasteur"
        ? "pastorAudioPreview"
        : "bergerAudioPreview";

    const audio =
      document.getElementById(id);

    if (!audio || !this.url) {
      return;
    }

    audio.src = this.url;

    audio.style.display =
      "block";
  }


  /* -------------------------------------------------------
     SUPPRIMER
     ------------------------------------------------------- */

  delete() {

    this.stop();

    this.chunks = [];

    this.blob = null;

    if (this.url) {

      URL.revokeObjectURL(
        this.url
      );

      this.url = null;
    }

    const id =
      this.person === "pasteur"
        ? "pastorAudioPreview"
        : "bergerAudioPreview";

    const audio =
      document.getElementById(id);

    if (audio) {

      audio.pause();

      audio.removeAttribute(
        "src"
      );

      audio.style.display =
        "none";

      audio.load();
    }

    const timerId =
      this.person === "pasteur"
        ? "pastorTimer"
        : "bergerTimer";

    document.getElementById(
      timerId
    ).textContent = "00:00";

    this.setState(
      "Vocal supprimé."
    );
  }


  /* -------------------------------------------------------
     PUBLICATION
     ------------------------------------------------------- */

  async publish() {

    if (!this.blob) {

      this.setState(
        "Enregistrez d'abord un vocal.",
        true
      );

      return;
    }

    const prefix =
      this.person === "pasteur"
        ? "pastor"
        : "berger";

    const titleInput =
      document.getElementById(
        prefix + "AudioTitle"
      );

    const title =
      titleInput?.value.trim() ||
      "Vocal du " +
      (this.person === "pasteur"
        ? "Pasteur"
        : "Berger");


    this.setState(
      "Préparation du vocal..."
    );


    try {

      const dataUrl =
        await this.blobToDataURL(
          this.blob
        );

      const list =
        getJSON(
          this.config.audioKey,
          []
        );

      const items =
        Array.isArray(list)
          ? list
          : [];


      const item = {

        id:
          Date.now().toString(),

        title,

        author:
          document.getElementById(
            this.config.nameId
          )?.value ||
          "",

        date:
          new Date().toISOString(),

        duration:
          this.timer,

        mimeType:
          this.blob.type,

        url:
          dataUrl,

        published:
          true,

        active:
          true
      };


      items.push(item);


      const success =
        saveJSON(
          this.config.audioKey,
          items
        );


      if (!success) {

        this.setState(
          "La publication a échoué.",
          true
        );

        return;
      }


      this.setState(
        "✅ Vocal publié. Il est maintenant disponible dans la page Église.",
        false,
        true
      );


      this.loadList();

      this.deletePreviewOnly();

      if (titleInput) {
        titleInput.value = "";
      }

    } catch (error) {

      console.error(error);

      this.setState(
        "Impossible de publier ce vocal. S'il est très long, le stockage du navigateur peut être insuffisant.",
        true
      );
    }
  }


  /* -------------------------------------------------------
     BLOB → DATA URL
     ------------------------------------------------------- */

  blobToDataURL(blob) {

    return new Promise(
      (resolve, reject) => {

        const reader =
          new FileReader();

        reader.onload =
          () => resolve(
            reader.result
          );

        reader.onerror =
          reject;

        reader.readAsDataURL(
          blob
        );
      }
    );
  }


  /* -------------------------------------------------------
     LISTE DES VOCALS
     ------------------------------------------------------- */

  loadList() {

    const id =
      this.person === "pasteur"
        ? "pastorAudioList"
        : "bergerAudioList";

    const container =
      document.getElementById(id);

    if (!container) return;

    let list =
      getJSON(
        this.config.audioKey,
        []
      );

    if (!Array.isArray(list)) {
      list = [];
    }


    container.innerHTML = "";


    if (!list.length) {

      container.innerHTML =
        '<div class="item"><small>Aucun vocal publié.</small></div>';

      return;
    }


    list
      .slice()
      .reverse()
      .forEach(
        (item, reverseIndex) => {

          if (!item || !item.url) {
            return;
          }

          const wrapper =
            document.createElement(
              "div"
            );

          wrapper.className =
            "item";


          const strong =
            document.createElement(
              "strong"
            );

          strong.textContent =
            "🎙️ " +
            (item.title ||
              "Vocal");


          const small =
            document.createElement(
              "small"
            );

          let date = "";

          if (item.date) {

            const d =
              new Date(
                item.date
              );

            if (!isNaN(
              d.getTime()
            )) {

              date =
                d.toLocaleString(
                  "fr-FR"
                );
            }
          }

          small.textContent =
            (item.author || "") +
            (date
              ? " • " + date
              : "");


          const audio =
            document.createElement(
              "audio"
            );

          audio.controls = true;
          audio.src = item.url;


          const actions =
            document.createElement(
              "div"
            );

          actions.className =
            "actions";


          const deleteButton =
            document.createElement(
              "button"
            );

          deleteButton.className =
            "btn danger";

          deleteButton.textContent =
            "🗑️ Supprimer";


          deleteButton.onclick =
            () => {

              this.deletePublished(
                item.id
              );
            };


          actions.appendChild(
            deleteButton
          );


          wrapper.appendChild(
            strong
          );

          wrapper.appendChild(
            small
          );

          wrapper.appendChild(
            audio
          );

          wrapper.appendChild(
            actions
          );

          container.appendChild(
            wrapper
          );
        }
      );
  }


  /* -------------------------------------------------------
     SUPPRIMER VOCAL PUBLIÉ
     ------------------------------------------------------- */

  deletePublished(id) {

    if (!confirm(
      "Supprimer définitivement ce vocal ?"
    )) {
      return;
    }

    let list =
      getJSON(
        this.config.audioKey,
        []
      );

    if (!Array.isArray(list)) {
      list = [];
    }

    list =
      list.filter(
        item =>
          String(item.id) !==
          String(id)
      );

    saveJSON(
      this.config.audioKey,
      list
    );

    this.loadList();

    this.setState(
      "Vocal supprimé de la publication."
    );
  }


  /* -------------------------------------------------------
     RESET PREVIEW
     ------------------------------------------------------- */

  deletePreviewOnly() {

    this.chunks = [];

    this.blob = null;

    if (this.url) {

      URL.revokeObjectURL(
        this.url
      );

      this.url = null;
    }

    const id =
      this.person === "pasteur"
        ? "pastorAudioPreview"
        : "bergerAudioPreview";

    const audio =
      document.getElementById(id);

    if (audio) {

      audio.pause();

      audio.removeAttribute(
        "src"
      );

      audio.style.display =
        "none";

      audio.load();
    }

    const timerId =
      this.person === "pasteur"
        ? "pastorTimer"
        : "bergerTimer";

    const timer =
      document.getElementById(
        timerId
      );

    if (timer) {
      timer.textContent =
        "00:00";
    }

    this.stopTimer();
  }


  /* -------------------------------------------------------
     MICROPHONE STOP
     ------------------------------------------------------- */

  stopStream() {

    if (this.stream) {

      this.stream
        .getTracks()
        .forEach(
          track =>
            track.stop()
        );

      this.stream = null;
    }
  }


  /* -------------------------------------------------------
     ÉTAT
     ------------------------------------------------------- */

  setState(
    message,
    error = false,
    success = false
  ) {

    const id =
      this.person === "pasteur"
        ? "pastorRecordState"
        : "bergerRecordState";

    const element =
      document.getElementById(
        id
      );

    if (!element) return;

    element.textContent =
      message;

    element.style.color =
      success
        ? "var(--success)"
        : error
          ? "#ff9aa5"
          : "";
  }
}


/* =========================================================
   SAUVEGARDE PASTEUR / BERGER
   ========================================================= */

function savePerson(person) {

  const config =
    people[person];

  const name =
    document.getElementById(
      config.nameId
    ).value.trim();

  const phone =
    document.getElementById(
      config.phoneId
    ).value.trim();

  const message =
    document.getElementById(
      config.messageId
    ).value.trim();

  const prayer =
    document.getElementById(
      config.prayerId
    ).value.trim();

  const announcements =
    document.getElementById(
      config.announcementsId
    ).value.trim();


  saveJSON(
    config.infoKey,
    {
      name,
      phone
    }
  );

  localStorage.setItem(
    config.messageKey,
    message
  );

  localStorage.setItem(
    config.prayerKey,
    prayer
  );

  localStorage.setItem(
    config.announcementsKey,
    announcements
  );


  status(
    config.statusId,
    "✅ Informations enregistrées. La page Église est mise à jour.",
    "success"
  );
}


function loadPerson(person) {

  const config =
    people[person];

  const info =
    getJSON(
      config.infoKey,
      null
    );


  if (info) {

    if (info.name) {

      document.getElementById(
        config.nameId
      ).value =
        info.name;
    }

    if (info.phone) {

      document.getElementById(
        config.phoneId
      ).value =
        info.phone;
    }
  }


  const message =
    localStorage.getItem(
      config.messageKey
    );

  const prayer =
    localStorage.getItem(
      config.prayerKey
    );

  const announcements =
    localStorage.getItem(
      config.announcementsKey
    );


  if (message !== null) {

    document.getElementById(
      config.messageId
    ).value =
      message;
  }

  if (prayer !== null) {

    document.getElementById(
      config.prayerId
    ).value =
      prayer;
  }

  if (announcements !== null) {

    document.getElementById(
      config.announcementsId
    ).value =
      announcements;
  }
}


/* =========================================================
   RÉINITIALISATION
   ========================================================= */

function resetPerson(person) {

  const config =
    people[person];

  if (!confirm(
    "Réinitialiser les informations de cette personne ?"
  )) {
    return;
  }


  localStorage.removeItem(
    config.infoKey
  );

  localStorage.removeItem(
    config.messageKey
  );

  localStorage.removeItem(
    config.prayerKey
  );

  localStorage.removeItem(
    config.announcementsKey
  );


  location.reload();
}


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadPerson("pasteur");
    loadPerson("berger");


    document
      .getElementById("savePastor")
      ?.addEventListener(
        "click",
        () => savePerson("pasteur")
      );


    document
      .getElementById("saveBerger")
      ?.addEventListener(
        "click",
        () => savePerson("berger")
      );


    document
      .getElementById("resetPastor")
      ?.addEventListener(
        "click",
        () => resetPerson("pasteur")
      );


    document
      .getElementById("resetBerger")
      ?.addEventListener(
        "click",
        () => resetPerson("berger")
      );


    // Deux enregistreurs complètement séparés
    window.pasteurRecorder =
      new VoiceRecorder("pasteur");

    window.bergerRecorder =
      new VoiceRecorder("berger");
  }
);
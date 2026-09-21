/* =========================================
   MI.C.L.A — CITÉ DE REFUGE
   JavaScript principal
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  console.log("MI.C.L.A — Cité de Refuge");

  // Année automatique du footer
  const yearElements = document.querySelectorAll("[data-year]");

  yearElements.forEach(element => {
    element.textContent = new Date().getFullYear();
  });

  // Animation légère à l'ouverture
  document.body.classList.add("page-loaded");

});
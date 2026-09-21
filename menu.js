/* =========================================
   MENU / NAVIGATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const links = document.querySelectorAll("a");

  links.forEach(link => {

    link.addEventListener("click", () => {

      link.style.opacity = "0.75";

      setTimeout(() => {
        link.style.opacity = "1";
      }, 300);

    });

  });

});
// diensten.js
/* ================= DARK MODE LOAD ================= */

const savedTheme = localStorage.getItem("theme");

if(savedTheme === "dark"){
    document.body.classList.add("dark-mode");
}
// FILTER

const filterBtn =
document.getElementById("filterBtn");

const filterSidebar =
document.getElementById("filterSidebar");

filterBtn.addEventListener("click", () => {

    filterSidebar.classList.toggle("active");

    filterBtn.classList.toggle("active-btn");

});

// CLEAR SEARCH

const clearBtn =
document.getElementById("clearBtn");

const searchInput =
document.getElementById("searchInput");

clearBtn.addEventListener("click", () => {

    searchInput.value = "";

});

// GRID VIEW

const gridViewBtn =
document.getElementById("gridViewBtn");

const singleViewBtn =
document.getElementById("singleViewBtn");

const postsContainer =
document.getElementById("postsContainer");

// GRID

gridViewBtn.addEventListener("click", () => {

    postsContainer.classList.add("grid-view");

});

// SINGLE

singleViewBtn.addEventListener("click", () => {

    postsContainer.classList.remove("grid-view");

});

// REFRESH

const refreshBtn =
document.querySelector(".refresh-btn");

refreshBtn.addEventListener("click", () => {

    location.reload();

});

// ================= MODAL =================

const serviceCards =
document.querySelectorAll(".service-card");

const postModal =
document.getElementById("postModal");

const closeModal =
document.getElementById("closeModal");

const modalImg =
document.getElementById("modalImg");

const modalTitle =
document.getElementById("modalTitle");

const modalDescription =
document.getElementById("modalDescription");

// OPEN

serviceCards.forEach(card => {

    card.addEventListener("click", () => {

        const img =
        card.querySelector(".service-image img").src;

        const title =
        card.querySelector("h2").innerText;

        const description =
        card.querySelector("p").innerText;

        modalImg.src = img;

        modalTitle.innerText = title;

        modalDescription.innerText =
        description;

        postModal.classList.add("active");

    });

});

// CLOSE BUTTON

closeModal.addEventListener("click", () => {

    postModal.classList.remove("active");

});

// OUTSIDE CLOSE

postModal.addEventListener("click", (e) => {

    if(e.target === postModal){

        postModal.classList.remove("active");

    }

});
document.addEventListener("DOMContentLoaded", () => {

    const darkModeBtn = document.getElementById("darkModeBtn");
    const lightModeBtn = document.getElementById("lightModeBtn");

    /* LOAD SAVED THEME */

    if(localStorage.getItem("theme") === "dark"){

        document.body.classList.add("dark-mode");

    }

    /* DARK MODE */

    if(darkModeBtn){

        darkModeBtn.addEventListener("click", () => {

            document.body.classList.add("dark-mode");

            localStorage.setItem("theme", "dark");

        });

    }

    /* LIGHT MODE */

    if(lightModeBtn){

        lightModeBtn.addEventListener("click", () => {

            document.body.classList.remove("dark-mode");

            localStorage.setItem("theme", "light");

        });

    }

});
/* ================= DARK MODE BUTTONS ================= */

const darkModeBtn = document.getElementById("darkModeBtn");
const lightModeBtn = document.getElementById("lightModeBtn");

darkModeBtn?.addEventListener("click", () => {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
});

lightModeBtn?.addEventListener("click", () => {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
});
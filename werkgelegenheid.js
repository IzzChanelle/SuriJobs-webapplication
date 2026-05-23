/* ================= DARK MODE LOAD ================= */

const savedTheme = localStorage.getItem("theme");

if(savedTheme === "dark"){
    document.body.classList.add("dark-mode");
}
// ================= SEARCH CLEAR =================

const clearBtn =
document.getElementById("clearBtn");

const searchInput =
document.getElementById("searchInput");

clearBtn.addEventListener("click", () => {

    searchInput.value = "";

    searchInput.focus();

});


// ================= FILTER SIDEBAR =================

const filterBtn =
document.getElementById("filterBtn");

const filterSidebar =
document.getElementById("filterSidebar");

filterBtn.addEventListener("click", () => {

    filterSidebar.classList.toggle("active");

    filterBtn.classList.toggle("active-btn");

});


// ================= GRID / SINGLE VIEW =================

const postsContainer =
document.getElementById("postsContainer");

const gridViewBtn =
document.getElementById("gridViewBtn");

const singleViewBtn =
document.getElementById("singleViewBtn");


// GRID VIEW

gridViewBtn.addEventListener("click", () => {

    postsContainer.classList.add("grid-view");

});


// SINGLE VIEW

singleViewBtn.addEventListener("click", () => {

    postsContainer.classList.remove("grid-view");

});


// ================= SAVE BUTTONS =================

const saveButtons =
document.querySelectorAll(".save-btn");

saveButtons.forEach(button => {

    button.addEventListener("click", () => {

        if(button.innerText === "Opslaan"){

            button.innerText = "Opgeslagen";

            button.style.background = "darkred";

        }

        else{

            button.innerText = "Opslaan";

            button.style.background = "#0ca043";

        }

    });

});
// ================= REFRESH POSTS =================

const refreshBtn =
document.querySelector(".refresh-btn");

refreshBtn.addEventListener("click", () => {

    // future backend refresh here

    location.reload();

});
// ================= POST MODAL =================

const postCards =
document.querySelectorAll(".job-card");

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


// OPEN MODAL

postCards.forEach(card => {

    card.addEventListener("click", () => {

        const img =
        card.querySelector(".job-image img").src;

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


// CLOSE MODAL

closeModal.addEventListener("click", () => {

    postModal.classList.remove("active");

});


// CLOSE OUTSIDE

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
// PROFILE PROGRESS
const progress = document.querySelector(".progress-fill-home");

window.addEventListener("load", () => {

    progress.style.width = "78%";

});



// SEARCH CLEAR
const clearBtn = document.getElementById("clearBtn");

clearBtn.addEventListener("click", () => {

    document.querySelector(".search-box input").value = "";

});
const saveButtons = document.querySelectorAll(".save-btn, .market-save");
const savedContainer = document.getElementById("savedContainer");

saveButtons.forEach(button => {

    button.addEventListener("click", () => {

        const card = button.closest(".job-card, .market-card");

        if(card){

            const clone = card.cloneNode(true);

            savedContainer.appendChild(clone);

            button.innerText = "Saved";

        }

    });

});
const savedGrid = document.getElementById("savedGrid");

/* EXAMPLE SAVED ITEMS */

const savedItems = [

    {
        title: "Frontend Developer",
        description: "Web developer vacature.",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        type: "Vacature"
    },

    {
        title: "iPhone 14 Pro",
        description: "Nieuw op markt geplaatst.",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
        type: "Markt"
    },

    {
        title: "Party Planner",
        description: "Beschikbare service.",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865",
        type: "Dienst"
    }

];

/* CREATE CARDS */

savedItems.forEach(item => {

    savedGrid.innerHTML += `

        <div class="saved-card">

            <img src="${item.image}" alt="">

            <div class="saved-content">

                <h3>${item.title}</h3>

                <p>${item.description}</p>

                <span class="saved-type">
                    ${item.type}
                </span>

            </div>

        </div>

    `;

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
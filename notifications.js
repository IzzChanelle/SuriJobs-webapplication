const clearBtn = document.getElementById("clearBtn");
const searchInput = document.getElementById("searchInput");

clearBtn.addEventListener("click", () => {
    searchInput.value = "";
});

/* FILTER */

const filterBtn = document.getElementById("filterBtn");
const filterSidebar = document.getElementById("filterSidebar");

filterBtn.addEventListener("click", () => {
    filterSidebar.classList.toggle("active");
});

/* REFRESH */

const refreshBtn = document.getElementById("refreshBtn");

refreshBtn.addEventListener("click", () => {

    const cards =
    document.querySelectorAll(".notification-card");

    cards.forEach(card => {

        card.style.opacity = "0";

        setTimeout(() => {
            card.style.opacity = "1";
        }, 400);

    });

});

/* TABS */

const tabButtons =
document.querySelectorAll(".tab-btn");

tabButtons.forEach(button => {

    button.addEventListener("click", () => {

        tabButtons.forEach(btn => {

            btn.classList.remove("active-tab");

            btn.querySelector(".tab-line")
            .classList.remove("red-tab");

            btn.querySelector(".tab-line")
            .classList.add("black-tab");

        });

        button.classList.add("active-tab");

        button.querySelector(".tab-line")
        .classList.remove("black-tab");

        button.querySelector(".tab-line")
        .classList.add("red-tab");

    });

});
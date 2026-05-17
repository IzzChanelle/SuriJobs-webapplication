const filterBtn = document.getElementById("filterBtn");
const marketSidebar = document.getElementById("marketSidebar");

filterBtn.addEventListener("click", () => {

    marketSidebar.classList.toggle("active");
    filterBtn.classList.toggle("active-btn");

});



// REFRESH BUTTON
const refreshBtn = document.getElementById("refreshBtn");

refreshBtn.addEventListener("click", () => {

    location.reload();

});



// SEARCH
const marketSearch = document.getElementById("marketSearch");
const marketCards = document.querySelectorAll(".market-card");

marketSearch.addEventListener("keyup", () => {

    const value = marketSearch.value.toLowerCase();

    marketCards.forEach(card => {

        const text = card.innerText.toLowerCase();

        if(text.includes(value)) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

});



// CLEAR SEARCH
const clearBtn = document.getElementById("clearBtn");

clearBtn.addEventListener("click", () => {

    marketSearch.value = "";

    marketCards.forEach(card => {

        card.style.display = "block";

    });

});



// SAVE BUTTON
const saveButtons = document.querySelectorAll(".market-save");

saveButtons.forEach(button => {

    button.addEventListener("click", () => {

        button.classList.toggle("saved");

        if(button.classList.contains("saved")) {

            button.innerHTML = `<i class="fa-solid fa-heart"></i>`;

        } else {

            button.innerHTML = `<i class="fa-regular fa-heart"></i>`;

        }

    });

});
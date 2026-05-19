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
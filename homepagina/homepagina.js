const animatedItems = document.querySelectorAll(".animate");

/* Scroll animation */
function showOnScroll() {
    animatedItems.forEach(item => {
        const itemTop = item.getBoundingClientRect().top;
        const trigger = window.innerHeight - 100;

        if (itemTop < trigger) {
            item.classList.add("show");
        }
    });
}

window.addEventListener("scroll", showOnScroll);
window.addEventListener("load", showOnScroll);


/* Search clear button */
const searchInput = document.querySelector(".search-box input");
const clearBtn = document.querySelector(".close-btn");

clearBtn.addEventListener("click", () => {
    searchInput.value = "";
});


/* Navbar active line */
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {
    link.addEventListener("click", function () {
        navLinks.forEach(item => item.classList.remove("active"));
        this.classList.add("active");
    });
});


document.getElementById("userName").textContent = "Uw naam";
document.getElementById("userEmail").textContent = "Uw contact adres";
document.getElementById("userPhoto").src = "https://via.placeholder.com/180";
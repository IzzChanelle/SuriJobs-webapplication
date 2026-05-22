// =========================
// SETTINGS
// =========================

const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");

if(settingsBtn && settingsMenu){

    settingsBtn.addEventListener("click", () => {

        settingsMenu.classList.toggle("show");

    });

}

// CLOSE SETTINGS WHEN CLICK OUTSIDE

window.addEventListener("click", (e) => {

    if(
        settingsBtn &&
        settingsMenu &&
        !settingsBtn.contains(e.target) &&
        !settingsMenu.contains(e.target)
    ){

        settingsMenu.classList.remove("show");

    }

});

// =========================
// SEARCH CLEAR
// =========================

const clearBtn = document.querySelector(".search-box button");
const searchInput = document.querySelector(".search-box input");

if(clearBtn && searchInput){

    clearBtn.addEventListener("click", () => {

        searchInput.value = "";
        searchInput.focus();

    });

}

// =========================
// PRODUCT MODAL
// =========================

const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const productModal = document.getElementById("productModal");

if(openModalBtn && productModal){

    openModalBtn.addEventListener("click", () => {

        productModal.classList.add("show");

    });

}

if(closeModalBtn && productModal){

    closeModalBtn.addEventListener("click", () => {

        productModal.classList.remove("show");

    });

}

// CLOSE MODAL OUTSIDE

window.addEventListener("click", (e) => {

    if(productModal && e.target === productModal){

        productModal.classList.remove("show");

    }

});

// =========================
// SAVE BUTTONS
// =========================

const saveButtons = document.querySelectorAll(".save-btn");

saveButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        const icon = btn.querySelector("i");

        if(icon){

            icon.classList.toggle("fa-regular");
            icon.classList.toggle("fa-solid");

        }

        btn.classList.toggle("saved");

    });

});

// =========================
// CONTACT FORM
// =========================

const contactForm = document.querySelector(".contact-form");

if(contactForm){

    contactForm.addEventListener("submit", (e) => {

        e.preventDefault();

        alert("Bericht succesvol verzonden!");

        contactForm.reset();

    });

}

// =========================
// SETTINGS SIDEBAR
// =========================

const settingsSidebar = document.getElementById("settingsSidebar");
const closeSettings = document.getElementById("closeSettings");

if(settingsBtn && settingsSidebar){

    settingsBtn.addEventListener("click", () => {

        settingsSidebar.classList.add("show");

    });

}

if(closeSettings && settingsSidebar){

    closeSettings.addEventListener("click", () => {

        settingsSidebar.classList.remove("show");

    });

}

// =========================
// DARK MODE
// =========================

function toggleDarkMode(){

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

    }else{

        localStorage.setItem("theme","light");

    }

}

// =========================
// LANGUAGE
// =========================

function changeLanguage(lang){

    localStorage.setItem("language", lang);

    alert("Taal ingesteld op: " + lang);

}

// =========================
// NOTIFICATIONS
// =========================

function toggleNotifications(state){

    localStorage.setItem("notifications", state);

}

// =========================
// LOAD SETTINGS
// =========================

window.onload = function(){

    // DARK MODE

    if(localStorage.getItem("theme") === "dark"){

        document.body.classList.add("dark");

    }

    // LANGUAGE

    const lang = localStorage.getItem("language");

    if(lang){

        console.log("Taal:", lang);

    }

    // NOTIFICATIONS

    const notif = localStorage.getItem("notifications");

    console.log("Meldingen:", notif);

    // FADE IN ANIMATION

    document.body.classList.add("loaded");

}

// =========================
// CHAT SYSTEM
// =========================

const sendBtn = document.querySelector(".send-btn");
const chatInput = document.querySelector(".chat-input input");
const chatBody = document.querySelector(".chat-body");

// SEND MESSAGE

if(sendBtn){

    sendBtn.addEventListener("click", sendMessage);

}

// ENTER KEY

if(chatInput){

    chatInput.addEventListener("keypress", (e) => {

        if(e.key === "Enter"){

            sendMessage();

        }

    });

}

// FUNCTION

function sendMessage(){

    const messageText = chatInput.value.trim();

    if(messageText === "") return;

    // CREATE MESSAGE

    const message = document.createElement("div");

    message.classList.add("message");
    message.classList.add("sent");

    message.innerText = messageText;

    // APPEND MESSAGE

    if(chatBody){

        chatBody.appendChild(message);

    }

    // CLEAR INPUT

    chatInput.value = "";

    // AUTO SCROLL

    chatBody.scrollTop = chatBody.scrollHeight;

    // AUTO REPLY

    setTimeout(() => {

        const reply = document.createElement("div");

        reply.classList.add("message");
        reply.classList.add("received");

        reply.innerText = "Bedankt voor je bericht 👍";

        chatBody.appendChild(reply);

        chatBody.scrollTop = chatBody.scrollHeight;

    }, 1200);

}

// =========================
// ACTIVE NAVBAR
// =========================

const navLinks = document.querySelectorAll(".navbar a");

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        navLinks.forEach(item => {

            item.classList.remove("active");

        });

        link.classList.add("active");

    });

});

// =========================
// BUTTON RIPPLE EFFECT
// =========================

const buttons = document.querySelectorAll("button");

buttons.forEach(button => {

    button.addEventListener("click", function(e){

        const circle = document.createElement("span");

        const diameter = Math.max(
            button.clientWidth,
            button.clientHeight
        );

        const radius = diameter / 2;

        circle.style.width = circle.style.height =
        `${diameter}px`;

        circle.style.left =
        `${e.clientX - button.offsetLeft - radius}px`;

        circle.style.top =
        `${e.clientY - button.offsetTop - radius}px`;

        circle.classList.add("ripple");

        const ripple = button.getElementsByClassName("ripple")[0];

        if(ripple){

            ripple.remove();

        }

        button.appendChild(circle);

    });

});

// =========================
// SCROLL ANIMATION
// =========================

const cards = document.querySelectorAll(
    ".service-card, .market-card, .profile-card, .feature-card"
);

window.addEventListener("scroll", revealCards);

function revealCards(){

    const triggerBottom = window.innerHeight * 0.85;

    cards.forEach(card => {

        const cardTop = card.getBoundingClientRect().top;

        if(cardTop < triggerBottom){

            card.classList.add("show-card");

        }

    });

}

revealCards();
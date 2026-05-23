const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");

const lightMode = document.getElementById("lightMode");
const darkMode = document.getElementById("darkMode");
const textBig = document.getElementById("textBig");
const textSmall = document.getElementById("textSmall");

if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        settingsMenu.classList.toggle("active");
    });

    document.addEventListener("click", (event) => {
        if (!settingsBtn.contains(event.target) && !settingsMenu.contains(event.target)) {
            settingsMenu.classList.remove("active");
        }
    });
}

if (darkMode) {
    darkMode.addEventListener("click", () => {
        document.body.classList.add("dark-mode");
    });
}

if (lightMode) {
    lightMode.addEventListener("click", () => {
        document.body.classList.remove("dark-mode");
    });
}

if (textBig) {
    textBig.addEventListener("click", () => {
        document.documentElement.style.fontSize = "110%";
    });
}

if (textSmall) {
    textSmall.addEventListener("click", () => {
        document.documentElement.style.fontSize = "90%";
    });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        const logoutPath = logoutBtn.dataset.logoutPath || "login.html";
        window.location.href = logoutPath;
    });
}

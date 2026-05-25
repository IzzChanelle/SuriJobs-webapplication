// ============================================
// login.js v2
// ============================================

if (Auth.isLoggedIn()) window.location.href = "index.html";

const params = new URLSearchParams(window.location.search);
if (params.get("verified") === "success") toast("Email bevestigd! Je kan nu inloggen.", "success");
if (params.get("verified") === "failed") toast("Verificatie link ongeldig.", "error");

const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (!email || !password) return toast("Vul alle velden in", "error");

    const btn = loginForm.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Bezig...";

    try {
        const data = await api("/auth/login", { method: "POST", body: { email, password } });
        Auth.token = data.token;
        Auth.user = data.user;
        toast("Welkom terug, " + data.user.name + "!", "success");
        setTimeout(() => {
            window.location.href = "role-select.html";
        }, 800);
    } catch (err) {
        toast(err.message, "error");
        btn.disabled = false;
        btn.textContent = "Inloggen";
    }
});

window.handleGoogleLogin = async (response) => {
    try {
        const data = await api("/auth/google", { method: "POST", body: { credential: response.credential } });
        Auth.token = data.token;
        Auth.user = data.user;
        toast("Welkom, " + data.user.name + "!", "success");
        setTimeout(() => {
            window.location.href = "role-select.html";
        }, 800);
    } catch (err) { toast(err.message, "error"); }
};

// ============================================
// register.js v2 — with account type
// ============================================

if (Auth.isLoggedIn()) window.location.href = "index.html";

let selectedType = "individual";

// Account type selector cards
document.querySelectorAll(".account-type-option").forEach(opt => {
    opt.addEventListener("click", () => {
        document.querySelectorAll(".account-type-option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        selectedType = opt.dataset.type;
    });
});
// Default to individual selected
const def = document.querySelector('.account-type-option[data-type="individual"]');
if (def) def.classList.add("selected");

const registerForm = document.getElementById("registerForm");
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (!name || !email || !password) return toast("Vul alle velden in", "error");
    if (password.length < 6) return toast("Min. 6 tekens", "error");
    if (password !== confirm) return toast("Wachtwoorden komen niet overeen", "error");

    const btn = registerForm.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Bezig...";

    try {
        await api("/auth/register", {
            method: "POST",
            body: { name, email, password, account_type: selectedType }
        });
        toast("Account aangemaakt! Check je email.", "success", 5000);
        setTimeout(() => window.location.href = "login.html", 2500);
    } catch (err) {
        toast(err.message, "error");
        btn.disabled = false;
        btn.textContent = "Registreren";
    }
});

window.handleGoogleLogin = async (response) => {
    try {
        const data = await api("/auth/google", {
            method: "POST",
            body: { credential: response.credential, account_type: selectedType }
        });
        Auth.token = data.token;
        Auth.user = data.user;
        toast("Account aangemaakt!", "success");
        setTimeout(() => window.location.href = "role-select.html", 800);
    } catch (err) { toast(err.message, "error"); }
};

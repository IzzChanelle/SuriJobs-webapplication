// ============================================
// reset-password.js
// ============================================

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (!token) {
    toast("Ongeldige reset link", "error");
}

const form = document.getElementById("resetForm");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (password.length < 6) return toast("Wachtwoord minimaal 6 tekens", "error");
    if (password !== confirm) return toast("Wachtwoorden komen niet overeen", "error");

    try {
        const data = await api("/auth/reset-password", {
            method: "POST",
            body: { token, password }
        });
        toast(data.message, "success");
        setTimeout(() => window.location.href = "login.html", 1500);
    } catch (err) {
        toast(err.message, "error");
    }
});

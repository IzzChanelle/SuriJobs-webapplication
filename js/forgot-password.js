// ============================================
// forgot-password.js
// ============================================

const form = document.getElementById("forgotForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    if (!email) return toast("Email is verplicht", "error");

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Bezig...";

    try {
        const data = await api("/auth/forgot-password", {
            method: "POST",
            body: { email }
        });
        toast(data.message, "success", 5000);
    } catch (err) {
        toast(err.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Verstuur reset link";
    }
});

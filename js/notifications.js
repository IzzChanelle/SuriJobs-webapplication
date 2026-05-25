// ============================================
// notifications.js (frontend) — fixed
// ============================================

Auth.require();

const container = document.getElementById("notificationsContainer");
const tabButtons = document.querySelectorAll(".tab-btn");
const markAllReadBtn = document.getElementById("markAllReadBtn");

let currentFilter = "all";

async function loadNotifications() {
    container.innerHTML = `<div class="loading">Notificaties laden</div>`;
    try {
        const params = new URLSearchParams();
        if (currentFilter === "unread")    params.append("filter", "unread");
        if (currentFilter === "important") params.append("filter", "important");

        const notifs = await api("/notifications?" + params.toString());
        renderNotifications(notifs);
    } catch (err) {
        container.innerHTML = `<div class="empty-state">${err.message}</div>`;
    }
}

function renderNotifications(notifs) {
    container.innerHTML = "";
    if (notifs.length === 0) {
        container.innerHTML = `<div class="empty-state">Geen notificaties</div>`;
        return;
    }
    notifs.forEach(n => {
        const card = document.createElement("div");
        card.className = `notification-card ${n.is_read ? "" : "unread"}`;
        card.innerHTML = `
            <div class="notif-icon">${iconFor(n.type)}</div>
            <div class="notif-content">
                <h2>${n.title}</h2>
                <p>${n.body || ""}</p>
                <span>${timeAgo(n.created_at)}</span>
            </div>
        `;
        card.addEventListener("click", async () => {
            if (!n.is_read) {
                try {
                    await api(`/notifications/${n.id}/read`, { method: "PUT" });
                    card.classList.remove("unread");
                    updateNotifBadge();
                } catch (err) { /* silent */ }
            }
            if (n.link) window.location.href = n.link;
        });
        container.appendChild(card);
    });
}

function iconFor(type) {
    const map = { job: "💼", accept: "✅", message: "📩", reject: "❌", system: "🔔", important: "⚠️", application: "📋" };
    return map[type] || "🔔";
}

function timeAgo(date) {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60)    return "Zojuist";
    if (diff < 3600)  return Math.floor(diff / 60) + " min geleden";
    if (diff < 86400) return Math.floor(diff / 3600) + " uur geleden";
    return Math.floor(diff / 86400) + " dagen geleden";
}

// Tabs
tabButtons.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active-tab"));
        btn.classList.add("active-tab");
        currentFilter = ["all", "unread", "important"][idx];
        loadNotifications();
    });
});

// Mark all read
if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", async () => {
        try {
            await api("/notifications/read-all", { method: "PUT" });
            toast("Alles als gelezen gemarkeerd", "success");
            loadNotifications();
            updateNotifBadge();
        } catch (err) { toast(err.message, "error"); }
    });
}

loadNotifications();
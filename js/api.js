const API_BASE = "http://localhost:3001/api";
const BACKEND_URL = "http://localhost:3001";

const Auth = {
    get token() { return localStorage.getItem("surijobs_token"); },
    set token(v) { v ? localStorage.setItem("surijobs_token", v) : localStorage.removeItem("surijobs_token"); },
    get user() {
        const raw = localStorage.getItem("surijobs_user");
        return raw ? JSON.parse(raw) : null;
    },
    set user(v) { v ? localStorage.setItem("surijobs_user", JSON.stringify(v)) : localStorage.removeItem("surijobs_user"); },
    isLoggedIn() { return !!this.token; },
    logout() {
        this.token = null;
        this.user = null;
        window.location.href = "login.html";
    },
    require() {
        if (!this.isLoggedIn()) window.location.href = "login.html";
    },
    isBusinessMode() {
        return this.user && this.user.active_mode === "business";
    },
    hasBusinessAccount() {
        return this.user && this.user.has_business;
    }
};

async function api(path, options = {}) {
    const headers = options.headers || {};
    if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
    }
    if (Auth.token) headers["Authorization"] = `Bearer ${Auth.token}`;

    const url = `${API_BASE}${path}`;
    console.log("🔍 API Request:", url, options);

    try {
        const res = await fetch(url, { ...options, headers });
        const data = await res.json().catch(() => ({}));
        console.log("✅ API Response:", res.status, data);
        if (!res.ok) {
            if (res.status === 401 && Auth.isLoggedIn()) Auth.logout();
            throw new Error(data.error || `HTTP ${res.status}`);
        }
        return data;
    } catch (err) {
        console.error("❌ API Error:", err);
        if (err.name === "TypeError") throw new Error("Geen verbinding met server. Draait de backend?");
        throw err;
    }
}

function toast(message, type = "info", duration = 3000) {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        setTimeout(() => el.remove(), 300);
    }, duration);
}

async function updateNotifBadge() {
    if (!Auth.isLoggedIn()) return;
    try {
        const { count } = await api("/notifications/unread-count");
        const navLinks = document.querySelectorAll(".nav-link a");
        navLinks.forEach(link => {
            if (link.href.includes("notifications.html")) {
                const existing = link.parentElement.querySelector(".notif-badge");
                if (existing) existing.remove();
                if (count > 0) {
                    const badge = document.createElement("span");
                    badge.className = "notif-badge";
                    badge.textContent = count;
                    link.appendChild(badge);
                }
            }
        });
    } catch (err) { /* silent */ }
}

async function setupModeToggle() {
    if (!Auth.isLoggedIn()) return;
    const container = document.getElementById("modeToggle");
    if (!container) return;

    const isBusiness = Auth.isBusinessMode();
    container.innerHTML = `
        <button class="${!isBusiness ? 'active' : ''}" data-mode="individual">👤 Ik zoek</button>
        <button class="business ${isBusiness ? 'active' : ''}" data-mode="business">🏢 Ik bied aan</button>
    `;

    container.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", async () => {
            const mode = btn.dataset.mode;
            if (mode === Auth.user.active_mode) return;
            try {
                await api("/auth/mode", { method: "POST", body: { mode } });
                const u = Auth.user;
                u.active_mode = mode;
                u.has_business = u.has_business || mode === "business";
                Auth.user = u;
                toast(mode === "business" ? "Switched to business mode 🏢" : "Switched to individual mode 👤", "success");

                const path = window.location.pathname.split("/").pop();
                if (mode === "business" && (path === "werkgelegenheid.html" || path === "index.html")) {
                    setTimeout(() => window.location.href = "dashboard.html", 500);
                } else if (mode === "individual" && path === "dashboard.html") {
                    setTimeout(() => window.location.href = "werkgelegenheid.html", 500);
                } else {
                    setTimeout(() => window.location.reload(), 500);
                }
            } catch (err) { toast(err.message, "error"); }
        });
    });
}

function setupScrollReveal() {
    const els = document.querySelectorAll(".scroll-reveal");
    if (els.length === 0) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add("revealed");
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
}

function markActiveNav() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link a").forEach(a => {
        if (a.getAttribute("href") === path) {
            a.parentElement.classList.add("active");
        }
    });
}

if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        updateNotifBadge();
        setupModeToggle();
        setupScrollReveal();
        markActiveNav();
    });
}
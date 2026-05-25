// ============================================
// homepage.js v3 — discovery sections
// ============================================

Auth.require();

if (Auth.isBusinessMode()) {
    window.location.href = "dashboard.html";
}

// DOM refs
const welcomeTitle    = document.getElementById("welcomeTitle");
const homeProfilePic  = document.getElementById("homeProfilePic");
const homeProfileName = document.getElementById("homeProfileName");
const homeProfileEmail= document.getElementById("homeProfileEmail");
const completionPct   = document.getElementById("completionPct");
const homeProgressFill= document.getElementById("homeProgressFill");
const statApps        = document.getElementById("statApps");
const statSaved       = document.getElementById("statSaved");
const statListings    = document.getElementById("statListings");
const savedRow        = document.getElementById("savedRow");
const trendingRow     = document.getElementById("trendingRow");
const marketRow       = document.getElementById("marketRow");

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) logoutBtn.addEventListener("click", () => Auth.logout());

// ---- helpers ----
function placeholder(text) {
    return `<div class="section-empty">${text}</div>`;
}

function tagFor(type) {
    const map = { job: "Vacature", market: "Markt", service: "Dienst" };
    return `<span class="saved-card-tag ${type}">${map[type] || type}</span>`;
}

function timeAgo(date) {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60)    return "Zojuist";
    if (diff < 3600)  return Math.floor(diff/60) + " min geleden";
    if (diff < 86400) return Math.floor(diff/3600) + " uur geleden";
    return Math.floor(diff/86400) + " d geleden";
}

// ---- load profile strip ----
async function loadProfile() {
    if (Auth.user) {
        welcomeTitle.textContent = `Hallo, ${Auth.user.name.split(' ')[0]}! 👋`;
        homeProfileName.textContent = Auth.user.name;
        homeProfileEmail.textContent = Auth.user.email;
        if (Auth.user.photo) homeProfilePic.src = Auth.user.photo;
    }

    try {
        const comp = await api("/profile/completion");
        completionPct.textContent = comp.percentage + "%";
        homeProgressFill.style.width = comp.percentage + "%";
    } catch(e) {}

    try {
        const apps = await api("/jobs/my/applications");
        statApps.textContent = apps.length;
    } catch(e) { statApps.textContent = "0"; }

    try {
        const items = await api("/market/my/items");
        statListings.textContent = items.length;
    } catch(e) { statListings.textContent = "0"; }
}

// ---- load saved items ----
async function loadSaved() {
    try {
        const saved = await api("/profile/saved");
        const all = [
            ...saved.jobs.map(j => ({ ...j, _type: "job", _img: j.image_url, _title: j.title || j.company, _sub: j.company, _href: "werkgelegenheid.html" })),
            ...saved.services.map(s => ({ ...s, _type: "service", _img: s.image_url, _title: s.name, _sub: s.branche || "", _href: "diensten.html" })),
            ...saved.market.map(m => ({ ...m, _type: "market", _img: m.image_url, _title: m.name, _sub: m.price || "", _href: "markt.html" }))
        ];

        const total = all.length;
        statSaved.textContent = total;

        if (total === 0) {
            savedRow.innerHTML = placeholder("Nog niets opgeslagen. Sla vacatures, diensten of producten op!");
            return;
        }

        savedRow.innerHTML = "";
        all.slice(0, 10).forEach(item => {
            const card = document.createElement("div");
            card.className = "saved-card";
            card.innerHTML = `
                <img class="saved-card-img" src="${item._img || 'https://via.placeholder.com/220x120/f0f0f0/999?text=+'}" alt="">
                <div class="saved-card-body">
                    <h4>${item._title}</h4>
                    <p>${item._sub}</p>
                    ${tagFor(item._type)}
                </div>
            `;
            card.addEventListener("click", () => window.location.href = item._href);
            savedRow.appendChild(card);
        });
    } catch(e) {
        savedRow.innerHTML = placeholder("⚠️ " + e.message);
    }
}

// ---- load trending jobs ----
async function loadTrending() {
    try {
        const jobs = await api("/jobs");
        if (jobs.length === 0) {
            trendingRow.innerHTML = placeholder("Geen vacatures gevonden.");
            return;
        }
        trendingRow.innerHTML = "";
        jobs.slice(0, 8).forEach(job => {
            const card = document.createElement("div");
            card.className = "trending-card";
            card.innerHTML = `
                <img class="trending-card-img" src="${job.image_url || 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400'}" alt="">
                <div class="trending-card-body">
                    <h4>${job.title || job.company}</h4>
                    <div class="trending-card-company">${job.company}</div>
                    <div class="trending-card-meta">${job.district || ''} ${job.district && job.hours ? '·' : ''} ${job.hours || ''}</div>
                </div>
            `;
            card.addEventListener("click", () => window.location.href = "werkgelegenheid.html");
            trendingRow.appendChild(card);
        });
    } catch(e) {
        trendingRow.innerHTML = placeholder("⚠️ " + e.message);
    }
}

// ---- load market items ----
async function loadMarket() {
    try {
        const items = await api("/market");
        if (items.length === 0) {
            marketRow.innerHTML = placeholder("Nog geen producten op de markt.");
            return;
        }
        marketRow.innerHTML = "";
        items.slice(0, 8).forEach(item => {
            const card = document.createElement("div");
            card.className = "market-mini-card";
            card.innerHTML = `
                <img class="market-mini-card-img" src="${item.image_url || 'https://via.placeholder.com/220x130/f0f0f0/999?text=+'}" alt="">
                <div class="market-mini-card-body">
                    <h4>${item.name}</h4>
                    <span class="market-price">${item.price || ''}</span>
                </div>
            `;
            card.addEventListener("click", () => window.location.href = "markt.html");
            marketRow.appendChild(card);
        });
    } catch(e) {
        marketRow.innerHTML = placeholder("⚠️ " + e.message);
    }
}

// ---- boot ----
async function load() {
    await loadProfile();
    loadSaved();
    loadTrending();
    loadMarket();
}

load();

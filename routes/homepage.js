// ============================================
// homepage.js v2 — individual mode landing
// ============================================

Auth.require();

// If somehow in business mode, send to dashboard
if (Auth.isBusinessMode()) {
    window.location.href = "dashboard.html";
}

const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeSubtitle = document.getElementById("welcomeSubtitle");
const homeProfilePic = document.getElementById("homeProfilePic");
const homeProfileName = document.getElementById("homeProfileName");
const homeProfileEmail = document.getElementById("homeProfileEmail");
const completionPct = document.getElementById("completionPct");
const homeProgressFill = document.getElementById("homeProgressFill");
const statApps = document.getElementById("statApps");
const statSaved = document.getElementById("statSaved");
const statListings = document.getElementById("statListings");
const recommendedJobs = document.getElementById("recommendedJobs");
const floatProfilePic = document.getElementById("floatProfilePic"); // may be null
const floatProfileName = document.getElementById("floatProfileName"); // may be null

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) logoutBtn.addEventListener("click", () => Auth.logout());

async function load() {
    if (Auth.user) {
        welcomeTitle.textContent = `Hallo, ${Auth.user.name.split(' ')[0]}! 👋`;
        homeProfileName.textContent = Auth.user.name;
        homeProfileEmail.textContent = Auth.user.email;
        if (Auth.user.photo) {
            homeProfilePic.src = Auth.user.photo;
            if (floatProfilePic) floatProfilePic.src = Auth.user.photo;
        }
        if (floatProfileName) floatProfileName.textContent = Auth.user.name.split(' ')[0];
    }

    try {
        const comp = await api("/profile/completion");
        completionPct.textContent = comp.percentage + "%";
        homeProgressFill.style.width = comp.percentage + "%";
    } catch (err) { /* ignore */ }

    try {
        const apps = await api("/jobs/my/applications");
        statApps.textContent = apps.length;
    } catch (err) { statApps.textContent = "0"; }

    try {
        const saved = await api("/profile/saved");
        const total = (saved.jobs?.length || 0) + (saved.services?.length || 0) + (saved.market?.length || 0);
        statSaved.textContent = total;
    } catch (err) { statSaved.textContent = "0"; }

    try {
        const items = await api("/market/my/items");
        statListings.textContent = items.length;
    } catch (err) { statListings.textContent = "0"; }

    try {
        const jobs = await api("/jobs");
        recommendedJobs.innerHTML = "";
        jobs.slice(0, 4).forEach(job => {
            const div = document.createElement("div");
            div.className = "mini-job-card";
            div.innerHTML = `
                <img src="${job.image_url || 'https://via.placeholder.com/60'}">
                <div style="flex:1;">
                    <h4>${job.title || job.company}</h4>
                    <p>${job.company} ${job.district ? '· ' + job.district : ''}</p>
                    <p style="color:#34d399;font-size:0.8rem;font-weight:600;">${job.salary || ''}</p>
                </div>
            `;
            div.addEventListener("click", () => window.location.href = "werkgelegenheid.html");
            recommendedJobs.appendChild(div);
        });
        if (jobs.length === 0) {
            recommendedJobs.innerHTML = `<div class="empty-state">Geen vacatures</div>`;
        }
    } catch (err) {
        recommendedJobs.innerHTML = `<div class="empty-state">⚠️ ${err.message}</div>`;
    }
}

load();

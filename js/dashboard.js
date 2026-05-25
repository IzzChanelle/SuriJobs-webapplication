// ============================================
// dashboard.js — business mode
// ============================================

Auth.require();

// Redirect to home if not in business mode
if (!Auth.isBusinessMode()) {
    window.location.href = "index.html";
}

const statViews = document.getElementById("statViews");
const statApps = document.getElementById("statApps");
const statJobs = document.getElementById("statJobs");
const statConv = document.getElementById("statConv");
const statAccepted = document.getElementById("statAccepted");
const myJobsList = document.getElementById("myJobsList");
const applicantsHeader = document.getElementById("applicantsHeader");
const applicantsList = document.getElementById("applicantsList");
const applicantsTitle = document.getElementById("applicantsTitle");
const closeApplicantsBtn = document.getElementById("closeApplicants");
const newJobBtn = document.getElementById("newJobBtn");
const newJobModal = document.getElementById("newJobModal");
const closeNewJobModal = document.getElementById("closeNewJobModal");
const submitNewJob = document.getElementById("submitNewJob");

// Populate job-form dropdowns
document.addEventListener("DOMContentLoaded", () => {
    populateSelect(document.getElementById("jobBranche"), BRANCHES, "Branche");
    populateSelect(document.getElementById("jobDistrict"), DISTRICTS, "District");
    populateSelect(document.getElementById("jobHours"), WORK_TYPES, "Uren");
    populateSelect(document.getElementById("jobExperience"), EXPERIENCE_LEVELS, "Ervaring");

    // Greeting
    const greet = document.getElementById("dashGreeting");
    if (greet && Auth.user) greet.textContent = `Welkom, ${Auth.user.name}`;
});

async function loadStats() {
    try {
        const s = await api("/company/stats");
        statViews.textContent = s.total_views;
        statApps.textContent = s.total_applications;
        statJobs.textContent = s.active_jobs;
        statConv.textContent = s.conversion_rate + "%";
        statAccepted.textContent = `${s.accepted} geaccepteerd`;
    } catch (err) {
        console.error(err);
    }
}

async function loadMyJobs() {
    myJobsList.innerHTML = `<div class="loading">Vacatures laden</div>`;
    try {
        const jobs = await api("/jobs/my/posted");
        if (jobs.length === 0) {
            myJobsList.innerHTML = `<div class="empty-state"><div class="emoji">📭</div>Nog geen vacatures. Plaats er een!</div>`;
            return;
        }
        myJobsList.innerHTML = "";
        jobs.forEach((job, idx) => {
            const card = document.createElement("div");
            card.className = "my-job-card";
            card.style.animationDelay = `${idx * 0.05}s`;
            card.innerHTML = `
                <div class="my-job-card-top">
                    <div>
                        <h3 style="font-size:1.1rem; margin-bottom:4px;">${job.title}</h3>
                        <p style="color:var(--text-dim); font-size:0.85rem;">
                            ${job.branche || ''} ${job.district ? '· ' + job.district : ''} ${job.hours ? '· ' + job.hours : ''}
                        </p>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-secondary view-app-btn" data-id="${job.id}" data-title="${job.title}">
                            👥 ${job.application_count}
                        </button>
                        <button class="btn-danger delete-job-btn" data-id="${job.id}">🗑</button>
                    </div>
                </div>
                <div class="my-job-card-stats">
                    <div><div class="num">${job.views}</div><div class="label">weergaven</div></div>
                    <div><div class="num">${job.application_count}</div><div class="label">sollicitanten</div></div>
                    <div><div class="num">${job.salary || '—'}</div><div class="label">salaris</div></div>
                </div>
            `;
            myJobsList.appendChild(card);

            card.querySelector(".view-app-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                const btn = e.currentTarget;
                loadApplicants(btn.dataset.id, btn.dataset.title);
            });
            card.querySelector(".delete-job-btn").addEventListener("click", async (e) => {
                e.stopPropagation();
                if (!confirm("Vacature verwijderen?")) return;
                try {
                    await api(`/jobs/${e.currentTarget.dataset.id}`, { method: "DELETE" });
                    toast("Verwijderd", "success");
                    loadMyJobs();
                    loadStats();
                } catch (err) { toast(err.message, "error"); }
            });
        });
    } catch (err) {
        myJobsList.innerHTML = `<div class="empty-state">⚠️ ${err.message}</div>`;
    }
}

async function loadApplicants(jobId, jobTitle) {
    applicantsHeader.style.display = "flex";
    applicantsTitle.textContent = `Sollicitanten — ${jobTitle}`;
    applicantsList.innerHTML = `<div class="loading">Sollicitanten laden</div>`;
    applicantsHeader.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
        const apps = await api(`/jobs/${jobId}/applicants`);
        if (apps.length === 0) {
            applicantsList.innerHTML = `<div class="empty-state"><div class="emoji">📭</div>Nog geen sollicitanten</div>`;
            return;
        }
        applicantsList.innerHTML = "";
        apps.forEach((app, idx) => {
            const row = document.createElement("div");
            row.className = "applicant-row";
            row.style.animationDelay = `${idx * 0.05}s`;
            row.innerHTML = `
                <img src="${app.photo || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'}" alt="">
                <div class="applicant-info">
                    <h4>${app.name}</h4>
                    <p>${app.email} ${app.phone ? '· ' + app.phone : ''}</p>
                    <p style="font-size:0.8rem; color:var(--text-faint);">
                        ${app.job_title || ''} ${app.experience_level ? '· ' + app.experience_level : ''}
                        ${app.district ? '· ' + app.district : ''}
                    </p>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end;">
                    <span class="status-badge ${app.status}">${app.status}</span>
                    <div class="applicant-actions">
                        ${app.status !== 'accepted' ? `<button class="btn-accept" data-id="${app.application_id}" data-action="accepted">✓ Accept</button>` : ''}
                        ${app.status !== 'rejected' ? `<button class="btn-reject" data-id="${app.application_id}" data-action="rejected">✗ Reject</button>` : ''}
                    </div>
                </div>
            `;
            applicantsList.appendChild(row);

            row.querySelectorAll(".applicant-actions button").forEach(b => {
                b.addEventListener("click", async () => {
                    try {
                        await api(`/jobs/applications/${b.dataset.id}`, {
                            method: "PUT",
                            body: { status: b.dataset.action }
                        });
                        toast(b.dataset.action === "accepted" ? "Geaccepteerd ✓" : "Afgewezen", "success");
                        loadApplicants(jobId, jobTitle);
                        loadStats();
                    } catch (err) { toast(err.message, "error"); }
                });
            });
        });
    } catch (err) {
        applicantsList.innerHTML = `<div class="empty-state">⚠️ ${err.message}</div>`;
    }
}

closeApplicantsBtn.addEventListener("click", () => {
    applicantsHeader.style.display = "none";
    applicantsList.innerHTML = "";
});

// New job modal
newJobBtn.addEventListener("click", () => newJobModal.classList.add("active"));
closeNewJobModal.addEventListener("click", () => newJobModal.classList.remove("active"));
newJobModal.addEventListener("click", (e) => { if (e.target === newJobModal) newJobModal.classList.remove("active"); });

submitNewJob.addEventListener("click", async () => {
    const body = {
        title: document.getElementById("jobTitle").value.trim(),
        description: document.getElementById("jobDescription").value.trim(),
        branche: document.getElementById("jobBranche").value,
        district: document.getElementById("jobDistrict").value,
        hours: document.getElementById("jobHours").value,
        experience_level: document.getElementById("jobExperience").value,
        salary: document.getElementById("jobSalary").value.trim(),
        image_url: document.getElementById("jobImage").value.trim()
    };
    if (!body.title || !body.branche) return toast("Titel en branche verplicht", "error");

    submitNewJob.disabled = true;
    submitNewJob.textContent = "Bezig...";
    try {
        await api("/jobs", { method: "POST", body });
        toast("Vacature geplaatst!", "success");
        ["jobTitle","jobDescription","jobSalary","jobImage"].forEach(id => document.getElementById(id).value = "");
        newJobModal.classList.remove("active");
        loadMyJobs();
        loadStats();
    } catch (err) { toast(err.message, "error"); }
    finally {
        submitNewJob.disabled = false;
        submitNewJob.textContent = "Plaatsen";
    }
});

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) logoutBtn.addEventListener("click", () => Auth.logout());

loadStats();
loadMyJobs();

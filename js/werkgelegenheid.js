Auth.require();

if (Auth.isBusinessMode()) window.location.href = "dashboard.html";

const postsContainer = document.getElementById("postsContainer");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const filterBtn = document.getElementById("filterBtn");
const filterSidebar = document.getElementById("filterSidebar");
const gridViewBtn = document.getElementById("gridViewBtn");
const singleViewBtn = document.getElementById("singleViewBtn");
const refreshBtn = document.querySelector(".refresh-btn");

const postModal = document.getElementById("postModal");
const closeModal = document.getElementById("closeModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalMeta = document.getElementById("modalMeta");

let allJobs = [];
let currentJob = null;

function buildFilters() {
    const groups = filterSidebar.querySelectorAll(".filter-group");
    const filterMap = [
        { items: BRANCHES, name: "branche" },
        { items: DISTRICTS, name: "district" },
        { items: WORK_TYPES, name: "hours" },
        { items: EXPERIENCE_LEVELS, name: "experience_level" }
    ];
    groups.forEach((group, idx) => {
        if (idx === 0) return;
        const filterIdx = idx - 1;
        if (!filterMap[filterIdx]) return;
        const labelsWrap = group.querySelector(".filter-labels");
        if (!labelsWrap) return;
        filterMap[filterIdx].items.forEach(item => {
            const label = document.createElement("label");
            label.innerHTML = `<input type="checkbox" data-filter="${filterMap[filterIdx].name}" value="${item}"> ${item}`;
            labelsWrap.appendChild(label);
        });
    });

    document.querySelectorAll(".filter-sidebar input[type=checkbox]").forEach(cb => {
        cb.addEventListener("change", loadJobs);
    });
}

async function loadJobs() {
    postsContainer.innerHTML = `<div class="loading">Vacatures laden</div>`;
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.append("search", searchInput.value.trim());

    ["branche", "district", "hours", "experience_level"].forEach(name => {
        const vals = [...document.querySelectorAll(`[data-filter="${name}"]:checked`)].map(c => c.value);
        if (vals.length) params.append(name, vals.join(","));
    });

    try {
        allJobs = await api("/jobs?" + params.toString());
        renderJobs();
    } catch (err) {
        postsContainer.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div>${err.message}</div>`;
    }
}

function renderJobs() {
    postsContainer.innerHTML = "";
    if (allJobs.length === 0) {
        postsContainer.innerHTML = `<div class="empty-state"><div class="emoji">🔍</div>Geen vacatures gevonden</div>`;
        return;
    }
    allJobs.forEach((job, idx) => {
        const card = document.createElement("div");
        card.className = "job-card";
        card.style.animationDelay = `${idx * 0.05}s`;
        card.innerHTML = `
            <button class="save-btn ${job.is_saved ? 'saved' : ''}">
                ${job.is_saved ? '★ Opgeslagen' : '☆ Opslaan'}
            </button>
            <div class="job-image">
                <img src="${job.image_url || 'https://via.placeholder.com/600x300/1a1a2e/ffffff?text=SuriJobs'}" alt="">
            </div>
            <div class="job-info">
                <h2>${job.title || job.company}</h2>
                <p>${job.description || ''}</p>
                <div class="job-meta">
                    ${job.branche ? `<span class="tag blue">${job.branche}</span>` : ''}
                    ${job.district ? `<span class="tag">${job.district}</span>` : ''}
                    ${job.hours ? `<span class="tag green">${job.hours}</span>` : ''}
                    ${job.salary ? `<span class="tag red">${job.salary}</span>` : ''}
                </div>
            </div>
            <div class="job-buttons">
                <button class="apply-btn">Soliciteer</button>
                <button class="info-btn">Meer info</button>
            </div>
        `;
        postsContainer.appendChild(card);

        card.querySelector(".save-btn").addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
                const r = await api("/profile/save", { method: "POST", body: { item_type: "job", item_id: job.id } });
                const btn = e.target;
                btn.classList.toggle("saved", r.saved);
                btn.innerHTML = r.saved ? '★ Opgeslagen' : '☆ Opslaan';
                toast(r.saved ? "Opgeslagen" : "Verwijderd", "success");
            } catch (err) { toast(err.message, "error"); }
        });

        card.querySelector(".apply-btn").addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
                await api(`/jobs/${job.id}/apply`, { method: "POST", body: {} });
                toast("Sollicitatie verstuurd!", "success");
            } catch (err) { toast(err.message, "error"); }
        });

        card.querySelector(".info-btn").addEventListener("click", (e) => { e.stopPropagation(); openModal(job); });
        card.addEventListener("click", (e) => {
            if (e.target.closest(".save-btn, .apply-btn, .info-btn")) return;
            openModal(job);
        });
    });
}

function openModal(job) {
    currentJob = job;
    modalImg.src = job.image_url || "";
    modalTitle.textContent = job.title || job.company;
    modalDescription.textContent = job.description || "";
    if (modalMeta) {
        modalMeta.innerHTML = `
            <span class="tag blue">${job.company}</span>
            ${job.branche ? `<span class="tag">${job.branche}</span>` : ''}
            ${job.district ? `<span class="tag">${job.district}</span>` : ''}
            ${job.hours ? `<span class="tag green">${job.hours}</span>` : ''}
            ${job.experience_level ? `<span class="tag">${job.experience_level}</span>` : ''}
            ${job.salary ? `<span class="tag red">${job.salary}</span>` : ''}
        `;
    }
    postModal.classList.add("active");
}

searchInput.addEventListener("input", debounce(loadJobs, 400));
clearBtn.addEventListener("click", () => { searchInput.value = ""; loadJobs(); });
filterBtn.addEventListener("click", () => {
    filterSidebar.classList.toggle("active");
    filterBtn.classList.toggle("active-btn");
});
gridViewBtn.addEventListener("click", () => postsContainer.classList.add("grid-view"));
singleViewBtn.addEventListener("click", () => postsContainer.classList.remove("grid-view"));
refreshBtn.addEventListener("click", loadJobs);
closeModal.addEventListener("click", () => postModal.classList.remove("active"));
postModal.addEventListener("click", (e) => { if (e.target === postModal) postModal.classList.remove("active"); });

postModal.querySelector(".modal-buttons .apply-btn").addEventListener("click", async () => {
    if (!currentJob) return;
    try {
        await api(`/jobs/${currentJob.id}/apply`, { method: "POST", body: {} });
        toast("Sollicitatie verstuurd!", "success");
        postModal.classList.remove("active");
    } catch (err) { toast(err.message, "error"); }
});

function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

buildFilters();
loadJobs();
// ============================================
// diensten.js v2 — with add dienst support
// ============================================

Auth.require();

const postsContainer  = document.getElementById("postsContainer");
const searchInput     = document.getElementById("searchInput");
const clearBtn        = document.getElementById("clearBtn");
const filterBtn       = document.getElementById("filterBtn");
const filterSidebar   = document.getElementById("filterSidebar");
const gridViewBtn     = document.getElementById("gridViewBtn");
const singleViewBtn   = document.getElementById("singleViewBtn");
const refreshBtn      = document.querySelector(".refresh-btn");
const postModal       = document.getElementById("postModal");
const closeModal      = document.getElementById("closeModal");
const modalImg        = document.getElementById("modalImg");
const modalTitle      = document.getElementById("modalTitle");
const modalDescription= document.getElementById("modalDescription");

// Add dienst modal
const openDienstModal  = document.getElementById("openDienstModal");
const dienstModal      = document.getElementById("dienstModal");
const closeDienstModal = document.getElementById("closeDienstModal");
const submitDienst     = document.getElementById("submitDienst");

let allServices = [];
let currentService = null;

// Populate dropdowns
document.addEventListener("DOMContentLoaded", () => {
    populateSelect(document.getElementById("dienstBranche"), BRANCHES, "Selecteer branche");
    populateSelect(document.getElementById("dienstDistrict"), DISTRICTS, "Selecteer district");
    populateSelect(document.getElementById("dienstPrice"), PRICE_RANGES, "Selecteer prijsklasse");
});

function buildFilters() {
    const groups = filterSidebar.querySelectorAll(".filter-group");
    const filterMap = [
        { items: BRANCHES,     name: "branche" },
        { items: DISTRICTS,    name: "district" },
        { items: PRICE_RANGES, name: "price"    }
    ];
    groups.forEach((group, idx) => {
        if (idx === 0) return;
        const fi = idx - 1;
        if (!filterMap[fi]) return;
        const wrap = group.querySelector(".filter-labels");
        if (!wrap) return;
        filterMap[fi].items.forEach(item => {
            const label = document.createElement("label");
            label.innerHTML = `<input type="checkbox" data-filter="${filterMap[fi].name}" value="${item}"> ${item}`;
            wrap.appendChild(label);
        });
    });
    document.querySelectorAll(".filter-sidebar input[type=checkbox]").forEach(cb => cb.addEventListener("change", loadServices));
}

async function loadServices() {
    postsContainer.innerHTML = `<div class="loading">Diensten laden</div>`;
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.append("search", searchInput.value.trim());
    ["branche", "district", "price"].forEach(name => {
        const vals = [...document.querySelectorAll(`[data-filter="${name}"]:checked`)].map(c => c.value);
        if (vals.length) params.append(name, vals.join(","));
    });

    try {
        allServices = await api("/services?" + params.toString());
        renderServices();
    } catch (err) {
        postsContainer.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div>${err.message}</div>`;
    }
}

function renderServices() {
    postsContainer.innerHTML = "";
    if (allServices.length === 0) {
        postsContainer.innerHTML = `<div class="empty-state"><div class="emoji">🔍</div>Geen diensten gevonden</div>`;
        return;
    }
    allServices.forEach((svc, idx) => {
        const isOwner = Auth.user && svc.posted_by === Auth.user.id;
        const card = document.createElement("div");
        card.className = "service-card";
        card.style.animationDelay = `${idx * 0.05}s`;
        card.innerHTML = `
            <button class="save-btn ${svc.is_saved ? 'saved' : ''}">${svc.is_saved ? '★ Opgeslagen' : '☆ Opslaan'}</button>
            ${isOwner ? `<button class="btn-danger delete-dienst-btn" style="position:absolute;top:10px;left:10px;padding:4px 10px;font-size:0.75rem;">🗑</button>` : ''}
            <div class="service-left">
                <div class="profile-circle">
                    <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="">
                </div>
                <h2>${svc.name}</h2>
                <p>${svc.description || ''}</p>
                <div class="job-meta">
                    ${svc.branche   ? `<span class="tag blue">${svc.branche}</span>`   : ''}
                    ${svc.district  ? `<span class="tag">${svc.district}</span>`        : ''}
                    ${svc.price_range ? `<span class="tag green">${svc.price_range}</span>` : ''}
                </div>
                <button class="contact-btn" style="margin-top:16px;">Contact</button>
            </div>
            <div class="service-image">
                <img src="${svc.image_url || 'https://via.placeholder.com/400'}" alt="">
            </div>
        `;
        postsContainer.appendChild(card);

        card.querySelector(".save-btn").addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
                const r = await api("/profile/save", { method: "POST", body: { item_type: "service", item_id: svc.id } });
                const btn = e.target;
                btn.classList.toggle("saved", r.saved);
                btn.innerHTML = r.saved ? '★ Opgeslagen' : '☆ Opslaan';
                toast(r.saved ? "Opgeslagen" : "Verwijderd", "success");
            } catch (err) { toast(err.message, "error"); }
        });

        if (isOwner) {
            card.querySelector(".delete-dienst-btn").addEventListener("click", async (e) => {
                e.stopPropagation();
                if (!confirm("Dienst verwijderen?")) return;
                try {
                    await api(`/services/${svc.id}`, { method: "DELETE" });
                    toast("Verwijderd", "success");
                    loadServices();
                } catch(err) { toast(err.message, "error"); }
            });
        }

        card.querySelector(".contact-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            if (svc.contact) toast(`Contact: ${svc.contact}`, "info", 5000);
            else toast("Geen contact info beschikbaar", "warning");
        });

        card.addEventListener("click", (e) => {
            if (e.target.closest(".save-btn, .contact-btn, .delete-dienst-btn")) return;
            currentService = svc;
            modalImg.src = svc.image_url || "";
            modalTitle.textContent = svc.name;
            modalDescription.textContent = svc.description || "";
            postModal.classList.add("active");
        });
    });
}

// ---- Add dienst ----
openDienstModal.addEventListener("click", () => dienstModal.classList.add("active"));
closeDienstModal.addEventListener("click", () => dienstModal.classList.remove("active"));
dienstModal.addEventListener("click", (e) => { if (e.target === dienstModal) dienstModal.classList.remove("active"); });

submitDienst.addEventListener("click", async () => {
    const name        = document.getElementById("dienstName").value.trim();
    const description = document.getElementById("dienstDescription").value.trim();
    const branche     = document.getElementById("dienstBranche").value;
    const district    = document.getElementById("dienstDistrict").value;
    const price_range = document.getElementById("dienstPrice").value;
    const contact     = document.getElementById("dienstContact").value.trim();
    const image_url   = document.getElementById("dienstImage").value.trim();

    if (!name || !branche) return toast("Naam en branche zijn verplicht", "error");

    submitDienst.disabled = true;
    submitDienst.textContent = "Bezig...";
    try {
        await api("/services", {
            method: "POST",
            body: { name, description, branche, district, price_range, contact, image_url: image_url || null }
        });
        toast("Dienst geplaatst! 🎉", "success");
        ["dienstName","dienstDescription","dienstContact","dienstImage"].forEach(id => document.getElementById(id).value = "");
        document.getElementById("dienstBranche").value = "";
        document.getElementById("dienstDistrict").value = "";
        document.getElementById("dienstPrice").value = "";
        dienstModal.classList.remove("active");
        loadServices();
    } catch(err) {
        toast(err.message, "error");
    } finally {
        submitDienst.disabled = false;
        submitDienst.textContent = "Plaatsen";
    }
});

// ---- modal contact btn ----
postModal.querySelector(".contact-btn").addEventListener("click", () => {
    if (currentService && currentService.contact) toast(`Contact: ${currentService.contact}`, "info", 5000);
    else toast("Geen contact info beschikbaar", "warning");
});

// ---- events ----
searchInput.addEventListener("input", debounce(loadServices, 400));
clearBtn.addEventListener("click", () => { searchInput.value = ""; loadServices(); });
filterBtn.addEventListener("click", () => {
    filterSidebar.classList.toggle("active");
    filterBtn.classList.toggle("active-btn");
});
gridViewBtn.addEventListener("click", () => postsContainer.classList.add("grid-view"));
singleViewBtn.addEventListener("click", () => postsContainer.classList.remove("grid-view"));
if (refreshBtn) refreshBtn.addEventListener("click", loadServices);
closeModal.addEventListener("click", () => postModal.classList.remove("active"));
postModal.addEventListener("click", (e) => { if (e.target === postModal) postModal.classList.remove("active"); });

function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

buildFilters();
loadServices();

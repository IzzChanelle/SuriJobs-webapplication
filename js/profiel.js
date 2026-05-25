// ============================================
// profiel.js v2 — dropdowns, dual mode profile
// ============================================

Auth.require();

let profileData = null;
let skillsData = [];
let companyData = null;

const isBusiness = Auth.isBusinessMode();

// Populate ALL select dropdowns
document.addEventListener("DOMContentLoaded", () => {
    populateSelect(document.querySelector('[data-field="district"]'), DISTRICTS, "Selecteer district");
    populateSelect(document.querySelector('[data-field="branche"]'), BRANCHES, "Selecteer branche");
    populateSelect(document.querySelector('[data-field="work_type"]'), WORK_TYPES, "Selecteer type");
    populateSelect(document.querySelector('[data-field="experience_level"]'), EXPERIENCE_LEVELS, "Selecteer niveau");
    populateSelect(document.querySelector('[data-field="education"]'), EDUCATION_LEVELS, "Selecteer niveau");
    // company dropdowns
    populateSelect(document.querySelector('[data-company-field="branche"]'), BRANCHES, "Branche");
    populateSelect(document.querySelector('[data-company-field="district"]'), DISTRICTS, "District");
    populateSelect(document.querySelector('[data-company-field="size"]'), COMPANY_SIZES, "Grootte");
});

// Helper to show/hide company section based on mode
function toggleCompanySection() {
    const wrapper = document.getElementById('companySectionWrapper');
    if (!wrapper) return;
    if (Auth.user && Auth.user.active_mode === 'business') {
        wrapper.style.display = 'block';
    } else {
        wrapper.style.display = 'none';
    }
}

// Update role badge (shows current mode)
function updateRoleBadge() {
    const badge = document.getElementById('userRoleBadge');
    if (!badge) return;
    if (Auth.user.active_mode === 'business') {
        badge.textContent = '🏢 Bedrijfsmodus';
        badge.classList.remove('green');
        badge.classList.add('red');
    } else {
        badge.textContent = '👤 Werkzoekende';
        badge.classList.remove('red');
        badge.classList.add('green');
    }
}

async function loadProfile() {
    try {
        const data = await api("/profile");
        profileData = data.profile || {};
        skillsData = data.skills || [];

        if (data.user.photo) {
            const img = document.getElementById("profilePreview");
            if (img) img.src = data.user.photo;
        }

        document.querySelectorAll("[data-field]").forEach(input => {
            const key = input.dataset.field;
            if (key === "email") {
                input.value = data.user.email;
                input.disabled = true;
            } else if (profileData[key] !== null && profileData[key] !== undefined) {
                input.value = profileData[key];
            }
        });

        renderSkills();

        const comp = await api("/profile/completion");
        const fill = document.getElementById("progressFill");
        const text = document.getElementById("progressText");
        if (fill) fill.style.width = comp.percentage + "%";
        if (text) text.textContent = comp.percentage + "%";

        // Load company section if business mode shown
        if (document.getElementById("companySectionWrapper")) {
            try {
                companyData = await api("/company");
                if (companyData) {
                    Object.keys(companyData).forEach(key => {
                        const el = document.querySelector(`[data-company-field="${key}"]`);
                        if (el && companyData[key] !== null) el.value = companyData[key];
                    });
                    if (companyData.logo_url) {
                        const logo = document.getElementById("companyLogo");
                        if (logo) logo.src = companyData.logo_url;
                    }
                }
            } catch (e) { /* no company yet */ }
        }

        toggleCompanySection();
        updateRoleBadge();
    } catch (err) {
        toast(err.message, "error");
    }
}

// Save individual profile
const saveBtn = document.querySelector(".save-profile-btn");
saveBtn.addEventListener("click", async () => {
    const body = {};
    document.querySelectorAll("[data-field]").forEach(input => {
        if (input.dataset.field === "email") return;
        body[input.dataset.field] = input.value || null;
    });

    saveBtn.disabled = true;
    saveBtn.textContent = "Opslaan...";
    try {
        await api("/profile", { method: "PUT", body });
        toast("Profiel opgeslagen!", "success");

        const comp = await api("/profile/completion");
        document.getElementById("progressFill").style.width = comp.percentage + "%";
        document.getElementById("progressText").textContent = comp.percentage + "%";
    } catch (err) { toast(err.message, "error"); }
    finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "💾 Profiel updaten";
    }
});

// Save company profile
const saveCompanyBtn = document.getElementById("saveCompanyBtn");
if (saveCompanyBtn) {
    saveCompanyBtn.addEventListener("click", async () => {
        const body = {};
        document.querySelectorAll("[data-company-field]").forEach(input => {
            body[input.dataset.companyField] = input.value || null;
        });
        saveCompanyBtn.disabled = true;
        saveCompanyBtn.textContent = "Opslaan...";
        try {
            await api("/company", { method: "PUT", body });
            toast("Bedrijf opgeslagen!", "success");
            const u = Auth.user;
            u.has_business = true;
            Auth.user = u;
        } catch (err) { toast(err.message, "error"); }
        finally {
            saveCompanyBtn.disabled = false;
            saveCompanyBtn.textContent = "🏢 Bedrijf opslaan";
        }
    });
}

// Photo upload
const photoBtn = document.querySelector(".upload-photo-btn");
const photoInput = document.createElement("input");
photoInput.type = "file";
photoInput.accept = "image/*";
photoInput.style.display = "none";
document.body.appendChild(photoInput);
photoBtn.addEventListener("click", () => photoInput.click());
photoInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("photo", file);
    try {
        const data = await api("/profile/photo", { method: "POST", body: fd });
        document.getElementById("profilePreview").src = data.photo;
        const u = Auth.user;
        u.photo = data.photo;
        Auth.user = u;
        toast("Foto geüpload", "success");
    } catch (err) { toast(err.message, "error"); }
});

// Skills
const addSkillBtn = document.getElementById("addSkillBtn");
const skillInput = document.getElementById("skillInput");
const skillsContainer = document.getElementById("skillsContainer");

addSkillBtn.addEventListener("click", async () => {
    const value = skillInput.value.trim();
    if (!value) return;
    try {
        await api("/profile/skills", { method: "POST", body: { skill: value } });
        skillsData.push(value);
        renderSkills();
        skillInput.value = "";
        toast("Skill toegevoegd", "success");
    } catch (err) { toast(err.message, "error"); }
});
skillInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addSkillBtn.click(); });

function renderSkills() {
    skillsContainer.innerHTML = "";
    skillsData.forEach(skill => {
        const div = document.createElement("div");
        div.className = "skill-tag";
        div.innerHTML = `${skill} <button data-skill="${skill}">×</button>`;
        skillsContainer.appendChild(div);
    });
    skillsContainer.querySelectorAll("button").forEach(b => {
        b.addEventListener("click", async () => {
            const skill = b.dataset.skill;
            try {
                await api(`/profile/skills/${encodeURIComponent(skill)}`, { method: "DELETE" });
                skillsData = skillsData.filter(s => s !== skill);
                renderSkills();
            } catch (err) { toast(err.message, "error"); }
        });
    });
}

const clearBtn = document.getElementById("clearBtn");
if (clearBtn) clearBtn.addEventListener("click", () => {
    const input = document.querySelector(".search-box input");
    if (input) input.value = "";
});

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) logoutBtn.addEventListener("click", () => Auth.logout());

// Listen to storage events (if user changes mode in another tab)
window.addEventListener('storage', (e) => {
    if (e.key === 'surijobs_user') {
        toggleCompanySection();
        updateRoleBadge();
    }
});

loadProfile();
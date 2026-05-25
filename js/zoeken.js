// ============================================
// zoeken.js — people search
// ============================================

Auth.require();

const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const resultsContainer = document.getElementById("resultsContainer");
const districtFilter = document.getElementById("districtFilter");

// Populate district dropdown
DISTRICTS.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    districtFilter.appendChild(opt);
});

async function loadPeople() {
    const q = searchInput.value.trim();
    const roleRadio = document.querySelector('input[name="role"]:checked');
    const role = roleRadio ? roleRadio.value : "alle";
    const district = districtFilter.value;

    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (role !== "alle") params.append("role", role);
    if (district !== "alle") params.append("district", district);

    resultsContainer.innerHTML = `<div class="loading">Zoeken...</div>`;

    try {
        const users = await api("/users/search?" + params.toString());
        renderResults(users);
    } catch (err) {
        resultsContainer.innerHTML = `<div class="empty-state">⚠️ ${err.message}</div>`;
    }
}

function renderResults(users) {
    resultsContainer.innerHTML = "";
    if (users.length === 0) {
        resultsContainer.innerHTML = `<div class="empty-state"><div class="emoji">🔍</div>Geen gebruikers gevonden</div>`;
        return;
    }

    users.forEach(user => {
        const card = document.createElement("div");
        card.className = "job-card"; // reuse job-card style
        card.style.cursor = "pointer";
        card.innerHTML = `
            <div style="display:flex; gap:16px; padding:16px;">
                <img src="${user.photo || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'}" style="width:60px; height:60px; border-radius:50%; object-fit:cover;">
                <div style="flex:1;">
                    <h3 style="margin-bottom:4px;">${user.name}</h3>
                    <p style="color:var(--text-dim); margin-bottom:6px;">${user.job_title || 'Geen functie'}</p>
                    <div class="job-meta">
                        ${user.district ? `<span class="tag">${user.district}</span>` : ''}
                        <span class="tag ${user.active_mode === 'business' ? 'red' : 'green'}">
                            ${user.active_mode === 'business' ? '🏢 Bedrijf' : '👤 Werkzoekende'}
                        </span>
                    </div>
                </div>
                <button class="btn-primary chat-btn" data-id="${user.id}" data-name="${user.name}" style="align-self:center;">💬 Chat</button>
            </div>
        `;
        resultsContainer.appendChild(card);

        card.querySelector(".chat-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            window.location.href = `chat.html?user=${user.id}&name=${encodeURIComponent(user.name)}`;
        });
        card.addEventListener("click", () => {
            window.location.href = `chat.html?user=${user.id}&name=${encodeURIComponent(user.name)}`;
        });
    });
}

searchInput.addEventListener("input", debounce(loadPeople, 400));
clearBtn.addEventListener("click", () => { searchInput.value = ""; loadPeople(); });
districtFilter.addEventListener("change", loadPeople);
document.querySelectorAll('input[name="role"]').forEach(radio => radio.addEventListener("change", loadPeople));

function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

loadPeople();
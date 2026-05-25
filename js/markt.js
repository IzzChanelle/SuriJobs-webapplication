Auth.require();

const marketGrid = document.getElementById("marketGrid");
const marketSearch = document.getElementById("marketSearch");
const clearBtn = document.getElementById("clearBtn");
const filterBtn = document.getElementById("filterBtn");
const filterSidebar = document.getElementById("filterSidebar");
const refreshBtn = document.getElementById("refreshBtn");
const productModal = document.getElementById("productModal");
const openProductModal = document.getElementById("openProductModal");
const closeProductModal = document.getElementById("closeProductModal");
const addProductSubmit = document.getElementById("addProductSubmit");

let allItems = [];

function buildFilters() {
    const groups = filterSidebar.querySelectorAll(".filter-group");
    const filterMap = [
        { items: MARKET_CATEGORIES, name: "category" },
        { items: CONDITIONS, name: "condition" },
        { items: DISTRICTS, name: "district" }
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
    document.querySelectorAll(".filter-sidebar input[type=checkbox]").forEach(cb => cb.addEventListener("change", loadMarket));
}

populateSelect(document.getElementById("productCategory"), MARKET_CATEGORIES, "Categorie");
populateSelect(document.getElementById("productCondition"), CONDITIONS, "Conditie");
populateSelect(document.getElementById("productDistrict"), DISTRICTS, "District");

async function loadMarket() {
    marketGrid.innerHTML = `<div class="loading">Producten laden</div>`;
    const params = new URLSearchParams();
    if (marketSearch.value.trim()) params.append("search", marketSearch.value.trim());
    ["category", "condition", "district"].forEach(name => {
        const vals = [...document.querySelectorAll(`[data-filter="${name}"]:checked`)].map(c => c.value);
        if (vals.length) params.append(name, vals.join(","));
    });

    try {
        allItems = await api("/market?" + params.toString());
        renderItems();
    } catch (err) {
        marketGrid.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div>${err.message}</div>`;
    }
}

function renderItems() {
    marketGrid.innerHTML = "";
    if (allItems.length === 0) {
        marketGrid.innerHTML = `<div class="empty-state"><div class="emoji">🛍️</div>Geen producten</div>`;
        return;
    }
    allItems.forEach((item, idx) => {
        const card = document.createElement("div");
        card.className = "market-card";
        card.style.animationDelay = `${idx * 0.04}s`;
        const isOwner = Auth.user && item.user_id === Auth.user.id;
        card.innerHTML = `
            <button class="market-save ${item.is_saved ? 'saved' : ''}">${item.is_saved ? '❤️' : '🤍'}</button>
            ${isOwner ? `<button class="market-save" style="right:60px;background:rgba(231,76,60,0.6);" title="Verwijder">🗑</button>` : ''}
            <div class="market-image">
                <img src="${item.image_url || 'https://via.placeholder.com/300'}" alt="">
            </div>
            <div class="market-content">
                <div class="market-top">
                    <h2>${item.name}</h2>
                    <span>${item.price}</span>
                </div>
                <p>${item.description || ''}</p>
                <div class="job-meta">
                    ${item.category ? `<span class="tag">${item.category}</span>` : ''}
                    ${item.condition_type ? `<span class="tag green">${item.condition_type}</span>` : ''}
                    ${item.district ? `<span class="tag blue">${item.district}</span>` : ''}
                </div>
                <div class="market-user">
                    <img src="${item.user_photo || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'}">
                    <div>
                        <h4>${item.user_name}</h4>
                        <small>${timeAgo(item.created_at)}</small>
                    </div>
                </div>
            </div>
        `;
        marketGrid.appendChild(card);

        card.querySelectorAll(".market-save")[0].addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
                const r = await api("/profile/save", { method: "POST", body: { item_type: "market", item_id: item.id } });
                const btn = e.currentTarget;
                btn.classList.toggle("saved", r.saved);
                btn.innerHTML = r.saved ? '❤️' : '🤍';
                toast(r.saved ? "Opgeslagen" : "Verwijderd", "success");
            } catch (err) { toast(err.message, "error"); }
        });
        if (isOwner) {
            card.querySelectorAll(".market-save")[1].addEventListener("click", async (e) => {
                e.stopPropagation();
                if (!confirm("Verwijderen?")) return;
                try {
                    await api(`/market/${item.id}`, { method: "DELETE" });
                    toast("Verwijderd", "success");
                    loadMarket();
                } catch (err) { toast(err.message, "error"); }
            });
        }
    });
}

function timeAgo(date) {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return "Zojuist";
    if (diff < 3600) return Math.floor(diff / 60) + " min geleden";
    if (diff < 86400) return Math.floor(diff / 3600) + " uur geleden";
    return Math.floor(diff / 86400) + " dagen geleden";
}

marketSearch.addEventListener("input", debounce(loadMarket, 400));
clearBtn.addEventListener("click", () => { marketSearch.value = ""; loadMarket(); });
filterBtn.addEventListener("click", () => {
    filterSidebar.classList.toggle("active");
    filterBtn.classList.toggle("active-btn");
});
refreshBtn.addEventListener("click", loadMarket);

openProductModal.addEventListener("click", () => productModal.classList.add("active"));
closeProductModal.addEventListener("click", () => productModal.classList.remove("active"));
productModal.addEventListener("click", (e) => { if (e.target === productModal) productModal.classList.remove("active"); });

addProductSubmit.addEventListener("click", async () => {
    const name = document.getElementById("productName").value.trim();
    const price = document.getElementById("productPrice").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const category = document.getElementById("productCategory").value;
    const condition_type = document.getElementById("productCondition").value;
    const district = document.getElementById("productDistrict").value;
    const imageUrl = document.getElementById("productImage").value.trim();
    const imageFile = document.getElementById("productImageFile").files[0];

    if (!name || !price) return toast("Naam en prijs verplicht", "error");

    addProductSubmit.disabled = true;
    addProductSubmit.textContent = "Bezig...";

    try {
        let finalImage = imageUrl;
        if (imageFile) {
            const fd = new FormData();
            fd.append("image", imageFile);
            const uploadRes = await api("/upload", { method: "POST", body: fd });
            finalImage = uploadRes.url;
        }

        const body = {
            name, price, description, category, condition_type, district,
            image_url: finalImage || null
        };
        await api("/market", { method: "POST", body });
        toast("Product geplaatst!", "success");
        document.getElementById("productName").value = "";
        document.getElementById("productPrice").value = "";
        document.getElementById("productDescription").value = "";
        document.getElementById("productCategory").value = "";
        document.getElementById("productCondition").value = "";
        document.getElementById("productDistrict").value = "";
        document.getElementById("productImage").value = "";
        document.getElementById("productImageFile").value = "";
        productModal.classList.remove("active");
        loadMarket();
    } catch (err) {
        toast(err.message, "error");
    } finally {
        addProductSubmit.disabled = false;
        addProductSubmit.textContent = "Plaatsen";
    }
});

function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

buildFilters();
loadMarket();
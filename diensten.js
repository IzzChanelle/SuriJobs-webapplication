// ==========================================
// 1. FILTER SIDEBAR
// ==========================================
const filterBtn = document.getElementById("filterBtn");
const filterSidebar = document.getElementById("filterSidebar");

if (filterBtn && filterSidebar) {
    filterBtn.addEventListener("click", () => {
        filterSidebar.classList.toggle("active");
        filterBtn.classList.toggle("active-btn");
    });
}

// ==========================================
// 2. CLEAR SEARCH
// ==========================================
const clearBtn = document.getElementById("clearBtn");
const searchInput = document.getElementById("searchInput");

if (clearBtn && searchInput) {
    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
    });
}

// ==========================================
// 3. GRID / SINGLE VIEW
// ==========================================
const gridViewBtn = document.getElementById("gridViewBtn");
const singleViewBtn = document.getElementById("singleViewBtn");
const postsContainer = document.getElementById("postsContainer");

if (gridViewBtn && postsContainer) {
    gridViewBtn.addEventListener("click", () => {
        postsContainer.classList.add("grid-view");
    });
}

if (singleViewBtn && postsContainer) {
    singleViewBtn.addEventListener("click", () => {
        postsContainer.classList.remove("grid-view");
    });
}

// ==========================================
// 4. REFRESH PAGINA
// ==========================================
const refreshBtn = document.querySelector(".refresh-btn");
if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
        location.reload();
    });
}

// ==========================================
// 5. THE GREAT MODAL & BUTTONS CONTROLLER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    const postModal = document.getElementById("postModal");
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const closeModal = document.getElementById("closeModal");

    let opgeslagenDiensten = JSON.parse(localStorage.getItem("opgeslagenDiensten")) || [];

    // Bij het klikken op een kaart
    const serviceCards = document.querySelectorAll(".service-card");

    serviceCards.forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.tagName === "BUTTON") return;

            // Haal data op uit de kaart (inclusief data-phone en data-name)
            const img = card.querySelector("img") ? card.querySelector("img").src : "";
            const title = card.querySelector("h2") ? card.querySelector("h2").innerText : "Dienst";
            const desc = card.querySelector("p") ? card.querySelector("p").innerText : "";
            const phone = card.getAttribute("data-phone") || "5978689345"; // Fallback nummer

            // Sla het nummer tijdelijk op in de modal zodat de knop binnenin erbij kan
            postModal.setAttribute("data-phone", phone);

            if (modalImg) modalImg.src = img;
            if (modalTitle) modalTitle.innerText = title;
            if (modalDescription) modalDescription.innerText = desc;

            postModal.classList.add("active");
        });
    });

    // GLOBALE EVENT LISTENER VOOR KNOPPEN
    document.addEventListener("click", (e) => {
        
        // SLUITEN
        if (e.target === closeModal || e.target.classList.contains("close-modal") || e.target === postModal) {
            if (postModal) postModal.classList.remove("active");
            return;
        }

        // WHATSAPP CONTACT
        if (e.target.classList.contains("contact-btn")) {
            // Check of we in een kaart zitten of in de modal
            const card = e.target.closest(".service-card");
            const phone = card ? card.getAttribute("data-phone") : postModal.getAttribute("data-phone");
            const name = card ? card.getAttribute("data-name") : (modalTitle ? modalTitle.innerText : "Dienstverlener");

            const bericht = `Hallo ${name}, ik heb uw diensten gezien op SuriJobs!`;
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(bericht)}`, '_blank');
        }

        // OPSLAAN LOGICA
if (e.target.classList.contains("save-btn")) {
    const card = e.target.closest(".service-card");
    const title = card ? card.querySelector("h2").innerText : (modalTitle ? modalTitle.innerText : "");
    
    if (!title) return;

    // Haal huidige lijst op
    let opgeslagenDiensten = JSON.parse(localStorage.getItem("opgeslagenDiensten")) || [];

    if (!opgeslagenDiensten.includes(title)) {
        // Opslaan
        opgeslagenDiensten.push(title);
        e.target.innerText = "Opgeslagen"; // Verander tekst op de knop zelf
        e.target.style.backgroundColor = "#555555"; // Optioneel: verander kleur
    } else {
        // Verwijderen
        opgeslagenDiensten = opgeslagenDiensten.filter(item => item !== title);
        e.target.innerText = "Opslaan"; // Terug naar origineel
        e.target.style.backgroundColor = ""; 
    }
    
    // Sla op in browsergeheugen
    localStorage.setItem("opgeslagenDiensten", JSON.stringify(opgeslagenDiensten));
}
    });
});
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
    
    // Selecteer alle pop-up elementen centraal
    const postModal = document.getElementById("postModal");
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const closeModal = document.getElementById("closeModal");

    let opgeslagenDiensten = JSON.parse(localStorage.getItem("opgeslagenDiensten")) || [];

    // SELECTEER DE DIENSTENKAARTEN (Gebruik jullie eigen class '.service-card')
    const serviceCards = document.querySelectorAll(".service-card") || document.querySelectorAll(".job-card");

    serviceCards.forEach(card => {
        card.addEventListener("click", (e) => {
            // Als er op een knop op de kaart zelf wordt geklikt, open dan de popup niet
            if (e.target.tagName === "BUTTON") return;

            try {
                // Haal de gegevens op uit de specifieke kaart (volgens jouw HTML structuur)
                const imgElement = card.querySelector(".service-image img") || card.querySelector("img");
                const titleElement = card.querySelector("h2");
                const descElement = card.querySelector("p");

                const img = imgElement ? imgElement.src : "";
                const title = titleElement ? titleElement.innerText : "Freelancer";
                const description = descElement ? descElement.innerText : "";

                // Stop de data in de pop-up
                if (modalImg && img) modalImg.src = img;
                if (modalTitle) modalTitle.innerText = title;
                if (modalDescription) modalDescription.innerText = description;

                // Update de status van de Opslaan-knop BINNENIN de pop-up direct op de juiste kleur
                const popupSaveBtn = document.querySelector(".modal-content .save-btn") || document.querySelector(".modal-info .save-btn") || document.querySelector("#postModal .save-btn");
                if (popupSaveBtn) {
                    if (opgeslagenDiensten.includes(title)) {
                        popupSaveBtn.innerText = "Opgeslagen";
                        popupSaveBtn.style.backgroundColor = "#555555";
                    } else {
                        popupSaveBtn.innerText = "Opslaan";
                        popupSaveBtn.style.backgroundColor = ""; // Reset naar jullie eigen CSS-kleur
                    }
                }

                // Open de pop-up met jullie eigen CSS-class!
                if (postModal) postModal.classList.add("active");

            } catch (error) {
                console.error("Foutje bij het openen van de modal:", error);
                if (postModal) postModal.classList.add("active");
            }
        });
    });

    // GLOBALE EVENT LISTENER VOOR DE KNOPPEN BINNENIN DE POP-UP EN SLUITEN
    document.addEventListener("click", (e) => {
        
        // A. SLUITEN (Met kruisje of buiten het witte vlak klikken)
        if (e.target === closeModal || e.target.classList.contains("close-modal") || e.target.innerText === "✕" || e.target === postModal) {
            if (postModal) postModal.classList.remove("active");
            return;
        }

        // B. BINNEN DE POP-UP ACTIES
        if (postModal && postModal.classList.contains("active") && e.target.closest(".modal-content")) {
            const huidigeNaam = modalTitle ? modalTitle.innerText : "";

            // 1. WhatsApp Contact Knop
            if (e.target.classList.contains("contact-btn") || e.target.innerText === "Contact") {
                const telefoonNummer = "5978689345"; 
                const bericht = `Hallo ${huidigeNaam}, ik heb uw diensten gezien op SuriJobs en ik zou hier graag contact met u over willen opnemen!`;
                window.open(`https://wa.me/${telefoonNummer}?text=${encodeURIComponent(bericht)}`, '_blank');
            }

            // 2. LocalStorage Opslaan Knop
            if (e.target.classList.contains("save-btn") || e.target.innerText === "Opslaan" || e.target.innerText === "Opgeslagen") {
                if (!huidigeNaam) return;

                opgeslagenDiensten = JSON.parse(localStorage.getItem("opgeslagenDiensten")) || [];

                if (!opgeslagenDiensten.includes(huidigeNaam)) {
                    opgeslagenDiensten.push(huidigeNaam);
                    e.target.innerText = "Opgeslagen";
                    e.target.style.backgroundColor = "#555555";
                    alert(`De dienst van "${huidigeNaam}" is opgeslagen!`);
                } else {
                    opgeslagenDiensten = opgeslagenDiensten.filter(item => item !== huidigeNaam);
                    e.target.innerText = "Opslaan";
                    e.target.style.backgroundColor = ""; // Terug naar jullie eigen CSS-kleur
                    alert(`De dienst van "${huidigeNaam}" is verwijderd.`);
                }
                localStorage.setItem("opgeslagenDiensten", JSON.stringify(opgeslagenDiensten));
            }
        }
    });
});
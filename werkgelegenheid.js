// ================= SEARCH CLEAR =================

const clearBtn =
document.getElementById("clearBtn");

const searchInput =
document.getElementById("searchInput");

clearBtn.addEventListener("click", () => {

    searchInput.value = "";

    searchInput.focus();

});


// ================= FILTER SIDEBAR =================

const filterBtn =
document.getElementById("filterBtn");

const filterSidebar =
document.getElementById("filterSidebar");

filterBtn.addEventListener("click", () => {

    filterSidebar.classList.toggle("active");

    filterBtn.classList.toggle("active-btn");

});


// ================= GRID / SINGLE VIEW =================

const postsContainer =
document.getElementById("postsContainer");

const gridViewBtn =
document.getElementById("gridViewBtn");

const singleViewBtn =
document.getElementById("singleViewBtn");


// GRID VIEW

gridViewBtn.addEventListener("click", () => {

    postsContainer.classList.add("grid-view");

});


// SINGLE VIEW

singleViewBtn.addEventListener("click", () => {

    postsContainer.classList.remove("grid-view");

});


// ================= SAVE BUTTONS =================

const saveButtons =
document.querySelectorAll(".save-btn");

saveButtons.forEach(button => {

    button.addEventListener("click", () => {

        if(button.innerText === "Opslaan"){

            button.innerText = "Opgeslagen";

            button.style.background = "darkred";

        }

        else{

            button.innerText = "Opslaan";

            button.style.background = "#0ca043";

        }

    });

});
// ================= REFRESH POSTS =================

const refreshBtn =
document.querySelector(".refresh-btn");

refreshBtn.addEventListener("click", () => {

    // future backend refresh here

    location.reload();

});
// ================= POST MODAL =================

const postCards =
document.querySelectorAll(".job-card");

const postModal =
document.getElementById("postModal");

const closeModal =
document.getElementById("closeModal");

const modalImg =
document.getElementById("modalImg");

const modalTitle =
document.getElementById("modalTitle");

const modalDescription =
document.getElementById("modalDescription");


// OPEN MODAL

postCards.forEach(card => {

    card.addEventListener("click", () => {

        const img =
        card.querySelector(".job-image img").src;

        const title =
        card.querySelector("h2").innerText;

        const description =
        card.querySelector("p").innerText;

        modalImg.src = img;

        modalTitle.innerText = title;

        modalDescription.innerText =
        description;

        postModal.classList.add("active");

    });

});


// CLOSE MODAL

closeModal.addEventListener("click", () => {

    postModal.classList.remove("active");

});


// CLOSE OUTSIDE

postModal.addEventListener("click", (e) => {

    if(e.target === postModal){

        postModal.classList.remove("active");

    }

});


document.addEventListener("DOMContentLoaded", () => {
    
    // Selecteer de pop-up (modal) elementen
    const modal = document.getElementById("postModal");                  
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const modalImg = document.getElementById("modalImg");

    // Haal de opgeslagen vacatures op uit de ingebouwde browser-storage
    let opgeslagenVacatures = JSON.parse(localStorage.getItem("opgeslagenVacatures")) || [];

    // Zorg dat de knoppen de juiste kleur hebben direct bij het laden van de pagina
    const saveButtons = document.querySelectorAll(".save-btn");
    saveButtons.forEach(button => {
        const jobCard = button.closest(".job-card");
        if (jobCard) {
            const h2 = jobCard.querySelector("h2");
            if (h2 && opgeslagenVacatures.includes(h2.innerText)) {
                button.innerText = "Opgeslagen";
                button.style.backgroundColor = "#555555";
            }
        }
    });

    // ==========================================================
    // ÉÉN CENTRALE LUISTERAAR DIE ALLE CLASHES VOORKOMT
    // ==========================================================
    document.addEventListener("click", (e) => {
        
        // 1. KLIK OP DE "MEER INFO" KNOP
        if (e.target.classList.contains("info-btn") && e.target.closest(".job-card")) {
            const jobCard = e.target.closest(".job-card");
            const titel = jobCard.querySelector("h2").innerText;
            const beschrijving = jobCard.querySelector("p").innerText;
            const afbeeldingSrc = jobCard.querySelector(".job-image img").src;

            if (modalTitle) modalTitle.innerText = titel;
            if (modalDescription) modalDescription.innerText = beschrijving;
            if (modalImg) modalImg.src = afbeeldingSrc;

            if (modal) modal.style.display = "flex";
        }

        // 2. KLIK OP DE "OPSLAAN" KNOP
        if (e.target.classList.contains("save-btn")) {
            const jobCard = e.target.closest(".job-card");
            if (!jobCard) return;
            
            const titel = jobCard.querySelector("h2").innerText;
            opgeslagenVacatures = JSON.parse(localStorage.getItem("opgeslagenVacatures")) || [];

            if (!opgeslagenVacatures.includes(titel)) {
                // Opslaan
                opgeslagenVacatures.push(titel);
                e.target.innerText = "Opgeslagen";
                e.target.style.backgroundColor = "#555555";
                alert(`Vacature van "${titel}" is opgeslagen!`);
            } else {
                // Verwijderen
                opgeslagenVacatures = opgeslagenVacatures.filter(item => item !== titel);
                e.target.innerText = "Opslaan";
                e.target.style.backgroundColor = ""; // Reset naar standaard rood
                alert(`Vacature van "${titel}" is verwijderd.`);
            }
            localStorage.setItem("opgeslagenVacatures", JSON.stringify(opgeslagenVacatures));
        }

        // 3. KLIK OP DE "BERICHT" KNOP (IN DE POP-UP MODAL)
        if (e.target.classList.contains("info-btn") && e.target.closest(".modal-buttons")) {
            const bedrifjsNaamInModal = modalTitle ? modalTitle.innerText : "dit bedrijf";
            const telefoonNummer = "5978689345"; 
            const bericht = `Hallo ${bedrifjsNaamInModal}, ik heb uw vacature gezien op SuriJobs en ik zou hier graag meer informatie over willen ontvangen!`;
            
            const whatsappUrl = `https://wa.me/${telefoonNummer}?text=${encodeURIComponent(bericht)}`;
            window.open(whatsappUrl, '_blank');
        }

        // 4. KLIK OP DE "SOLLICITEER" KNOP (IN DE POP-UP MODAL)
        if (e.target.classList.contains("apply-btn") && e.target.closest(".modal-buttons")) {
            alert("Je sollicitatie is succesvol verzonden! Het bedrijf neemt zo snel mogelijk contact met je op via je SuriJobs profiel.");
            if (modal) modal.style.display = "none";
        }

        // 5. KLIK OP DE SLUITKNOP (✕) VAN DE POP-UP
        if (e.target.id === "closeModal") {
            if (modal) modal.style.display = "none";
        }

        // 6. KLIK BUITEN HET WITTE VLAK VAN DE POP-UP OM TE SLUITEN
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
});
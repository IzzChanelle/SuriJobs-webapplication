// ============================================
// constants.js — shared dropdown options
// ============================================

const DISTRICTS = [
    "Paramaribo", "Wanica", "Nickerie", "Commewijne",
    "Saramacca", "Marowijne", "Para", "Brokopondo",
    "Sipaliwini", "Coronie"
];

const BRANCHES = [
    "ICT", "Marketing", "Horeca", "Onderwijs",
    "Zorg", "Bouw", "Transport", "Financiën",
    "Verkoop", "Productie", "Schoonheid", "Reparatie",
    "Catering", "Beveiliging", "Overig"
];

const WORK_TYPES = ["Fulltime", "Parttime", "Stage", "Freelance", "Tijdelijk"];

const EXPERIENCE_LEVELS = ["Starter", "Junior", "Medior", "Senior", "Expert"];

const PRICE_RANGES = ["Goedkoop", "Gemiddeld", "Premium"];

const MARKET_CATEGORIES = [
    "Elektronica", "Kleding", "Meubels", "Voertuigen",
    "Sport", "Boeken", "Huishouden", "Speelgoed", "Overig"
];

const CONDITIONS = ["Nieuw", "Zo goed als nieuw", "Gebruikt", "Refurbished"];

const COMPANY_SIZES = ["1-5", "6-20", "21-50", "51-100", "100+"];

const EDUCATION_LEVELS = [
    "GLO", "VOJ", "VOS", "MBO", "HBO", "Universiteit", "Anders"
];

// Helper to populate <select> elements
function populateSelect(selectEl, options, placeholder = "Selecteer...") {
    if (!selectEl) return;
    selectEl.innerHTML = `<option value="">${placeholder}</option>`;
    options.forEach(opt => {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        selectEl.appendChild(o);
    });
}

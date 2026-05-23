document.addEventListener("DOMContentLoaded", () => {
    let gekozenRol = "";
    let ingevuldeNaam = "";

    // Functie die de balkjes de juiste kleuren geeft op basis van de huidige stap
    function updateProgressBar(step) {
        const p1 = document.getElementById("prog-1");
        const p2 = document.getElementById("prog-2");
        const p3 = document.getElementById("prog-3");

        if (!p1 || !p2 || !p3) return; // Beveiliging voor andere pagina's

        // Reset eerst alle balkjes naar grijs
        p1.style.backgroundColor = "#e0e0e0";
        p2.style.backgroundColor = "#e0e0e0";
        p3.style.backgroundColor = "#e0e0e0";

        if (step >= 1) {
            p1.style.backgroundColor = "red"; // Stap 1 = Rood
        }
        if (step >= 2) {
            p2.style.backgroundColor = "#43a046"; // Stap 2 = Groen
        }
        if (step >= 3) {
            p3.style.backgroundColor = "#43a047"; // Stap 3 = Groen
        }
    }

    // Zet de balk direct bij het laden van de pagina op Stap 1 (Rood)
    updateProgressBar(1);

    // --- ROL SELECTIE ---
    const roleButtons = document.querySelectorAll(".role-btn");
    roleButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            roleButtons.forEach(b => b.classList.remove("selected-role"));
            this.classList.add("selected-role");
            
            gekozenRol = this.innerText.trim();
            console.log("Gekozen rol opgeslagen:", gekozenRol);
            
            const dynamicFields = document.getElementById("dynamic-fields");
            if (dynamicFields) {
                if (gekozenRol === "Werkgever") {
                    dynamicFields.innerHTML = `<div class="input-group"><label>Bedrijfsnaam</label><input type="text" id="reg-name" placeholder="Naam van uw bedrijf"></div>`;
                } else {
                    dynamicFields.innerHTML = `<div class="input-group"><label>Volledige Naam</label><input type="text" id="reg-name" placeholder="Voor- en achternaam"></div>`;
                }
            }
        });
    });

    // --- AL ACCOUNT / NAAR DASHBOARD LOGICA (MET DE CORRECHTE PADEN) ---

   // --- AL ACCOUNT / NAAR DASHBOARD LOGICA ---
const alreadyAccountBtn = document.getElementById("already-have-account");

if (alreadyAccountBtn) {
    alreadyAccountBtn.addEventListener("click", (e) => {
        e.preventDefault();

        // Stap 1: Controleer of er al een rol is gekozen
        if (!gekozenRol) {
            alert("Selecteer eerst je rol (Werkgever, Dienstverlener of Werknemer) voordat je inlogt.");
            return; // De functie stopt hier, dus ze gaan nergens heen
        }

        // Stap 2: Als er wel een rol is, stuur door naar het juiste dashboard
        if (gekozenRol === "Werkgever") {
            window.location.href = '/SuriJobs/index.html';
        } 
        else if (gekozenRol === "Dienstverlener") {
            window.location.href = '/SuriJobs/indexdienstverlener.html';
        } 
        else if (gekozenRol === "Werknemer") {
            window.location.href = '/index.html';
        }
    });
}
    // Als iemand de registratie afrondt en op "Naar Dashboard" klikt (Stap 4)
    const goToDashboardBtn = document.getElementById("go-to-dashboard");
    if (goToDashboardBtn) {
        goToDashboardBtn.addEventListener("click", () => {
            console.log("Dashboard knop geklikt voor rol:", gekozenRol);

            if (gekozenRol === "Werkgever") {
                alert("Je wordt nu doorgestuurd naar het Werkgever Dashboard!");
                window.location.href = 'SuriJobs/index.html'; // In de map SuriJobs
            } 
            else if (gekozenRol === "Dienstverlener") {
                alert("Je wordt nu doorgestuurd naar het Dienstverlener Dashboard!");
                window.location.href = 'SuriJobs/indexdienstverlener.html'; // In de map SuriJobs
            } 
            else if (gekozenRol === "Werknemer") {
                alert("Je wordt nu doorgestuurd naar het Werknemer Dashboard!");
                window.location.href = 'index.html'; // STAAT BUITEN DE MAP, dus GEEN SuriJobs/ ervoor!
            } 
            else {
                alert("Selecteer alstublieft een rol op stap 1.");
            }
        });
    }

    // --- NAVIGATIE STAPPEN ---

    // Stap 1 -> Stap 2 (Wordt Rood + Geel)
    const toStep2Btn = document.getElementById("to-step-2");
    if (toStep2Btn) {
        toStep2Btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (!gekozenRol) return alert("Selecteer eerst een rol om verder te gaan.");
            
            document.getElementById("step-1-content").style.display = "none";
            document.getElementById("step-2-content").style.display = "block";
            updateProgressBar(2); 
        });
    }

    // Stap 2 -> Stap 3 (Wordt Rood + Geel + Groen)
    const createAccountBtn = document.getElementById("create-account");
    if (createAccountBtn) {
        createAccountBtn.addEventListener("click", () => {
            const nameInput = document.getElementById("reg-name");
            const emailInput = document.getElementById("reg-email");
            
            if (!nameInput || !nameInput.value || !emailInput.value) {
                return alert("Vul alstublieft alle verplichte velden in.");
            }

            ingevuldeNaam = nameInput.value;
            
            document.getElementById("step-2-content").style.display = "none";
            document.getElementById("step-3-content").style.display = "block";
            updateProgressBar(3);
        });
    }

    // Stap 3 -> Stap 4 (Succes)
    const finishStepBtn = document.getElementById("finish-step");
    if (finishStepBtn) {
        finishStepBtn.addEventListener("click", () => {
            const districtSelect = document.getElementById("district-select");
            if (!districtSelect || !districtSelect.value) return alert("Kies een district.");

            if (document.getElementById("summary-name")) document.getElementById("summary-name").innerText = ingevuldeNaam;
            if (document.getElementById("summary-email")) document.getElementById("summary-email").innerText = document.getElementById("reg-email").value;
            if (document.getElementById("summary-role")) document.getElementById("summary-role").innerText = gekozenRol;
            if (document.getElementById("summary-district")) document.getElementById("summary-district").innerText = districtSelect.options[districtSelect.selectedIndex].text;

            document.getElementById("step-3-content").style.display = "none";
            document.getElementById("step-4-content").style.display = "block";
        });
    }

    // --- TERUG LINKS ---
    const backTo1 = document.getElementById("back-to-1");
    if (backTo1) {
        backTo1.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("step-2-content").style.display = "none";
            document.getElementById("step-1-content").style.display = "block";
            updateProgressBar(1); 
        });
    }

    const backTo2 = document.getElementById("back-to-2");
    if (backTo2) {
        backTo2.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("step-3-content").style.display = "none";
            document.getElementById("step-2-content").style.display = "block";
            updateProgressBar(2); 
        });
    }

    // Wachtwoord oogje toggle
    const togglePassword = document.getElementById("toggle-password");
    if (togglePassword) {
        togglePassword.addEventListener("click", function() {
            const field = document.getElementById("password-field");
            if (!field) return;
            if (field.type === "password") {
                field.type = "text";
                this.textContent = "🙈";
            } else {
                field.type = "password";
                this.textContent = "👁️";
            }
        });
    }
});
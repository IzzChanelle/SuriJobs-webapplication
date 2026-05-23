/* ================= DARK MODE LOAD ================= */

const savedTheme = localStorage.getItem("theme");

if(savedTheme === "dark"){
    document.body.classList.add("dark-mode");
}
// ============================================================
// PROFILE PAGE JS
// ============================================================

// ================= PROFILE SAVE =================

const saveBtn = document.querySelector(".save-profile-btn");

if(localStorage.getItem("profileCreated")){
    saveBtn.textContent = "Profiel updaten";
}

saveBtn.addEventListener("click", () => {

    localStorage.setItem("profileCreated", "true");

    saveBtn.textContent = "Profiel updaten";

    updateProfilePreview();

    alert("Profiel succesvol opgeslagen!");

});

// ================= PROFILE COMPLETION =================

const profileInputs = document.querySelectorAll(
    ".profile-form input, .profile-form textarea, .profile-form select"
);

const progressFill = document.querySelector(".progress-fill");
const progressText = document.querySelector(".profile-status-text");

function updateProgress(){

    let filled = 0;

    profileInputs.forEach(input => {
        if(input.value.trim() !== ""){
            filled++;
        }
    });

    const percentage = Math.round(
        (filled / profileInputs.length) * 100
    );

    progressFill.style.width = percentage + "%";

    progressText.textContent =
        percentage + "% compleet";

}

profileInputs.forEach(input => {
    input.addEventListener("input", updateProgress);
});

// ================= PROFILE PHOTO =================

const profilePhotoInput =
    document.getElementById("profilePhotoInput");

const profilePhoto =
    document.getElementById("profilePhoto");

profilePhotoInput.addEventListener("change", e => {

    const file = e.target.files[0];

    if(file){

        const reader = new FileReader();

        reader.onload = function(event){

            profilePhoto.src = event.target.result;

            localStorage.setItem(
                "profilePhoto",
                event.target.result
            );

        };

        reader.readAsDataURL(file);

    }

});

// restore image
const savedPhoto = localStorage.getItem("profilePhoto");

if(savedPhoto){
    profilePhoto.src = savedPhoto;
}

// ================= SKILLS =================

const addSkillBtn =
    document.querySelector(".add-skill-btn");

const skillInput =
    document.getElementById("skillInput");

const skillsContainer =
    document.getElementById("skillsContainer");

let skills = [];

addSkillBtn.addEventListener("click", () => {

    const value = skillInput.value.trim();

    if(value === "") return;

    skills.push(value);

    renderSkills();

    skillInput.value = "";

});

function renderSkills(){

    skillsContainer.innerHTML = "";

    skills.forEach((skill,index) => {

        const div = document.createElement("div");

        div.classList.add("skill-tag");

        div.innerHTML = `
            ${skill}
            <button onclick="removeSkill(${index})">
                ×
            </button>
        `;

        skillsContainer.appendChild(div);

    });

}

function removeSkill(index){

    skills.splice(index,1);

    renderSkills();

}

// ================= PREVIEW CARD =================

function updateProfilePreview(){

    const firstName =
        document.getElementById("firstName").value;

    const lastName =
        document.getElementById("lastName").value;

    const jobTitle =
        document.getElementById("jobTitle").value;

    const location =
        document.getElementById("location").value;

    localStorage.setItem("previewName",
        firstName + " " + lastName
    );

    localStorage.setItem("previewJob",
        jobTitle
    );

    localStorage.setItem("previewLocation",
        location
    );

}

// ============================================================
// HOMEPAGE PREVIEW CARD
// ============================================================

const previewName =
    document.getElementById("previewName");

const previewJob =
    document.getElementById("previewJob");

const previewLocation =
    document.getElementById("previewLocation");

const previewImage =
    document.getElementById("previewImage");

if(previewName){

    previewName.textContent =
        localStorage.getItem("previewName")
        || "Jouw naam";

    previewJob.textContent =
        localStorage.getItem("previewJob")
        || "Functie";

    previewLocation.textContent =
        localStorage.getItem("previewLocation")
        || "Locatie";

    if(savedPhoto){
        previewImage.src = savedPhoto;
    }

}
document.addEventListener("DOMContentLoaded", () => {

    const darkModeBtn = document.getElementById("darkModeBtn");
    const lightModeBtn = document.getElementById("lightModeBtn");

    /* LOAD SAVED THEME */

    if(localStorage.getItem("theme") === "dark"){

        document.body.classList.add("dark-mode");

    }

    /* DARK MODE */

    if(darkModeBtn){

        darkModeBtn.addEventListener("click", () => {

            document.body.classList.add("dark-mode");

            localStorage.setItem("theme", "dark");

        });

    }

    /* LIGHT MODE */

    if(lightModeBtn){

        lightModeBtn.addEventListener("click", () => {

            document.body.classList.remove("dark-mode");

            localStorage.setItem("theme", "light");

        });

    }

});
/* ================= DARK MODE BUTTONS ================= */

const darkModeBtn = document.getElementById("darkModeBtn");
const lightModeBtn = document.getElementById("lightModeBtn");

darkModeBtn?.addEventListener("click", () => {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
});

lightModeBtn?.addEventListener("click", () => {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
});
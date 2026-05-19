const filterBtn = document.getElementById("filterBtn");
const filterSidebar = document.getElementById("filterSidebar");

filterBtn.addEventListener("click", () => {

    filterSidebar.classList.toggle("active");
    filterBtn.classList.toggle("active-btn");

});



// REFRESH BUTTON
const refreshBtn = document.getElementById("refreshBtn");

refreshBtn.addEventListener("click", () => {

    location.reload();

});



// SEARCH
const marketSearch = document.getElementById("marketSearch");
const marketCards = document.querySelectorAll(".market-card");

marketSearch.addEventListener("keyup", () => {

    const value = marketSearch.value.toLowerCase();

    marketCards.forEach(card => {

        const text = card.innerText.toLowerCase();

        if(text.includes(value)) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

});



// CLEAR SEARCH
const clearBtn = document.getElementById("clearBtn");

clearBtn.addEventListener("click", () => {

    marketSearch.value = "";

    marketCards.forEach(card => {

        card.style.display = "block";

    });

});



// SAVE BUTTON
const saveButtons = document.querySelectorAll(".market-save");

saveButtons.forEach(button => {

    button.addEventListener("click", () => {

        button.classList.toggle("saved");

        if(button.classList.contains("saved")) {

            button.innerHTML = `<i class="fa-solid fa-heart"></i>`;

        } else {

            button.innerHTML = `<i class="fa-regular fa-heart"></i>`;

        }

    });

});
const productModal = document.getElementById("productModal");
const openProductModal = document.getElementById("openProductModal");
const closeProductModal = document.getElementById("closeProductModal");
const addProductSubmit = document.getElementById("addProductSubmit");
const marketGrid = document.getElementById("marketGrid");

openProductModal.addEventListener("click", () => {
    productModal.classList.add("active");
});

closeProductModal.addEventListener("click", () => {
    productModal.classList.remove("active");
});

addProductSubmit.addEventListener("click", () => {

    const name = document.getElementById("productName").value;
    const price = document.getElementById("productPrice").value;
    const description = document.getElementById("productDescription").value;
    const imageUrl = document.getElementById("productImage").value;
const imageFile = document.getElementById("productImage").files[0];
    if(name === "" || price === "" || description === ""){
        alert("Vul alle velden in");
        return;
    }
    let finalImage = imageUrl;

if(imageFile){
    finalImage = URL.createObjectURL(imageFile);
}

if(finalImage === ""){
    finalImage = "https://via.placeholder.com/300";
}

    const newProduct = document.createElement("div");
    newProduct.classList.add("market-card");

    newProduct.innerHTML = `
        <button class="market-save">
            <i class="fa-regular fa-heart"></i>
        </button>

        <div class="market-image">
            <img src="${URL.createObjectURL(imageFile)}" alt="">
        </div>

        <div class="market-content">
            <div class="market-top">
                <h2>${name}</h2>
                <span>${price}</span>
            </div>

            <p>${description}</p>

            <div class="market-user">
                <img src="https://randomuser.me/api/portraits/women/44.jpg">
                <div>
                    <h4>Jij</h4>
                    <small>Zojuist</small>
                </div>
            </div>
        </div>
    `;

    marketGrid.prepend(newProduct);

    productModal.classList.remove("active");
});
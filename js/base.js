/**
 * @class       : base
 * @author      : stanleyarn (stanleyarn@$HOSTNAME)
 * @created     : Jeudi jan 16, 2025 17:47:32 CET
 * @description : base
 */
async function loadComponent(url, div) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error();
        }

        const data = await response.text();
        div.innerHTML = data;
    }
    catch (error) {
        console.error('Error loading component:', error)
    }
}

async function createAndAttachModal() {
    const closeModal = () => {
        document.body.style.overflow = "";
        modal.classList.remove("show");
    };
    const openModal = () => {
        document.body.style.overflow = "hidden";
        modal.classList.add("show");
        modal.focus();
    };

    const imgs = document.querySelectorAll("main img");

    let modal = document.getElementById("modal");
    if (!modal) {
        modal = document.createElement("div");
        await loadComponent("./components/modal.html", modal);

        modal.setAttribute("id", "modal");
        modal.setAttribute("tabindex", "-1");

        modal.addEventListener("keydown", (event) => { 
            if (event.key === "Escape") {
                closeModal();
            }
        });
        modal.addEventListener("click", (event) => { 
            if (event.target != modal.querySelector("img")) {
                closeModal();
            }
        });

        const closeBtn = modal.querySelector("span");
        closeBtn.addEventListener("click", closeModal);

        document.body.appendChild(modal);
    }

    const content = modal.querySelector("img");
    const caption = modal.querySelector("p");

    for (const img of imgs) {
        img.addEventListener("click", () => {
            content.src = img.src;
            caption.innerHTML = img.getAttribute("alt");
            openModal();
        });
    }
}

window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    loadComponent('./components/footer.html', document.querySelector("footer"));

    const retBtn = document.getElementById("return-button");
    if (retBtn) {
        retBtn.addEventListener("click", (event) => {
            event.preventDefault();
            window.history.back();
        })
    }
});

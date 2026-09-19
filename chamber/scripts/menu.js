document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const primaryNav = document.getElementById("primary-nav");

    if (menuToggle && primaryNav) {
        menuToggle.addEventListener("click", () => {
            primaryNav.classList.toggle("open");
            const isOpen = primaryNav.classList.contains("open");
            
            // Actualiza el icono y la accesibilidad
            menuToggle.textContent = isOpen ? "✕" : "☰";
            menuToggle.setAttribute("aria-expanded", isOpen);
        });
    }
});
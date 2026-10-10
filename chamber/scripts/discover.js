import { discoverItems } from '../data/discover.mjs';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.discover-grid');
    if (container) {
        container.innerHTML = discoverItems.map((item, index) => `
            <section class="card-${index + 1}">
                <h2>${item.name}</h2>
                <figure>
                    <img src="${item.photo}" alt="${item.name}" loading="lazy" width="300" height="200">
                </figure>
                <address>${item.address}</address>
                <p>${item.description}</p>
                <button type="button">Learn More</button>
            </section>
        `).join('');
    }

    const visitorMessageDiv = document.querySelector('#visitor-message');
    if (visitorMessageDiv) {
        const lastVisit = localStorage.getItem('lastVisit-ls');
        const currentTime = Date.now();
        let message = "";

        if (!lastVisit) {
            message = "Welcome! Let us know if you have any questions.";
        } else {
            const daysDifference = Math.floor((currentTime - parseInt(lastVisit)) / (1000 * 60 * 60 * 24));
            
            if (daysDifference < 1) {
                message = "Back so soon! Awesome!";
            } else if (daysDifference === 1) {
                message = "You last visited 1 day ago.";
            } else {
                message = `You last visited ${daysDifference} days ago.`;
            }
        }
        
        visitorMessageDiv.textContent = message;
        localStorage.setItem('lastVisit-ls', currentTime);
    }
});
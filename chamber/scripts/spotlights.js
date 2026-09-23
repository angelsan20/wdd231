const membersUrl = 'data/members.json';
const spotlightsGrid = document.getElementById('spotlights-grid');

async function getSpotlightMembers() {
    try {
        const response = await fetch(membersUrl);
        if (response.ok) {
            const data = await response.json();
            
            const qualifiedMembers = data.members.filter(member => {
                const level = member.membershipLevel.toLowerCase();
                return level === 'gold' || level === 'silver';
            });

            const randomSpotlights = getRandomMembers(qualifiedMembers, 3);

            displaySpotlights(randomSpotlights);
        } else {
            throw Error(await response.text());
        }
    } catch (error) {
        console.error('Error fetching members data for spotlights:', error);
        spotlightsGrid.innerHTML = '<p>Unable to load company spotlights at this time.</p>';
    }
}

function getRandomMembers(membersArray, count) {
    const shuffled = [...membersArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function displaySpotlights(spotlights) {
    spotlightsGrid.innerHTML = '';

    spotlights.forEach(member => {
        const card = document.createElement('article');
        card.className = 'card spotlight-card';
        const levelLower = member.membershipLevel.toLowerCase();

        card.innerHTML = `
            <div class="spotlight-header">
                <h3>${member.name}</h3>
                <span class="badge ${levelLower}">
                    <img src="images/${levelLower}-badge.png" alt="${member.membershipLevel} Icon" class="medal-icon" width="16" height="16">
                    ${member.membershipLevel} Member
                </span>
            </div>
            <img src="${member.image}" alt="${member.name} Logo" loading="lazy" width="120" height="80">
            <p class="spotlight-phone"><strong>Phone:</strong> ${member.phone}</p>
            <p class="spotlight-address"><strong>Address:</strong> ${member.address}</p>
            <a href="${member.website}" target="_blank" rel="noopener" class="spotlight-link">Visit Website</a>
        `;

        spotlightsGrid.appendChild(card);
    });
}

getSpotlightMembers();
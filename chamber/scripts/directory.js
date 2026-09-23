const membersUrl = 'data/members.json';
const membersContainer = document.getElementById('members-container');

async function getMembers() {
    try {
        const response = await fetch(membersUrl);
        if (response.ok) {
            const data = await response.json();
            displayMembers(data.members);
        } else {
            throw Error(await response.text());
        }
    } catch (error) {
        console.error('Error loading directory members:', error);
        membersContainer.innerHTML = '<p>Error loading directory entries.</p>';
    }
}

function displayMembers(members) {
    membersContainer.innerHTML = '';

    members.forEach(member => {
        const card = document.createElement('section');
        card.className = 'member-card';
        const levelLower = member.membershipLevel.toLowerCase();

        card.innerHTML = `
            <img src="${member.image}" alt="${member.name} Logo" loading="lazy" width="100" height="70">
            <h3>${member.name}</h3>
            <p class="membership-tag ${levelLower}">${member.membershipLevel} Member</p>
            <p>${member.address}</p>
            <p>${member.phone}</p>
            <a href="${member.website}" target="_blank" rel="noopener">Website</a>
        `;

        membersContainer.appendChild(card);
    });
}

getMembers();
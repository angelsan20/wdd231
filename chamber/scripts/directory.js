document.addEventListener("DOMContentLoaded", () => {
    const membersContainer = document.getElementById("members-container");
    const gridBtn = document.getElementById("grid-view");
    const listBtn = document.getElementById("list-view");

    async function fetchMembers() {
        try {
            const response = await fetch("data/members.json");
            if (!response.ok) throw new Error("Error retrieving members");
            const data = await response.json();
            displayMembers(data);
        } catch (error) {
            console.error("Error loading information:", error);
            if (membersContainer) {
                membersContainer.innerHTML = "<p>Error loading the member directory.</p>";
            }
        }
    }

    function displayMembers(members) {
        if (!membersContainer) return;
        
        membersContainer.innerHTML = "";
        members.forEach(member => {
            const card = document.createElement("section");
            card.className = "member-card";

            card.innerHTML = `
                <img src="images/${member.image}" alt="Logo de ${member.name}" loading="lazy">
                <h3 class="member-name">${member.name}</h3>
                <p class="member-address">${member.address}</p>
                <p class="member-phone">${member.phone}</p>
                <p class="member-url"><a href="${member.website}" target="_blank" rel="noopener">${member.website}</a></p>
            `;
            membersContainer.appendChild(card);
        });
    }

    if (gridBtn && listBtn && membersContainer) {
        gridBtn.addEventListener("click", () => {
            membersContainer.className = "grid-view";
            gridBtn.classList.add("active");
            listBtn.classList.remove("active");
        });

        listBtn.addEventListener("click", () => {
            membersContainer.className = "list-view";
            listBtn.classList.add("active");
            gridBtn.classList.remove("active");
        });
    }

    fetchMembers();
});
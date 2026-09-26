/**
 * Campus Event Management - Events Listing Logic
 * Renders live events from MySQL database
 */
let currentCategory = "All";

function displayEvents(eventData) {
    const eventList = document.getElementById("eventList");
    const countEl = document.getElementById("eventsCount");

    if (!eventList) return;

    if (countEl) {
        countEl.textContent = `Showing ${eventData.length} of ${CAMPUS_EVENTS.length} campus events from database`;
    }

    if (eventData.length === 0) {
        eventList.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                <div class="empty-state-icon" style="font-size: 40px; margin-bottom: 12px;">🔍</div>
                <h3>No Matching Events in Database</h3>
                <p>No events currently match your selected filter or search criteria.</p>
            </div>
        `;
        return;
    }

    eventList.innerHTML = "";

    eventData.forEach((event) => {
        const isRegistered = isEventRegistered(event.id);
        const seatsLeft = isRegistered ? event.seats - 1 : event.seats;

        let catClass = "cat-technical";
        if (event.category === "Workshop") catClass = "cat-workshop";
        if (event.category === "Seminar") catClass = "cat-seminar";
        if (event.category && event.category.includes("Security")) catClass = "cat-cyber-security";

        eventList.innerHTML += `
            <div class="event-card">
                <div>
                    <div class="event-card-header">
                        <span class="event-category ${catClass}">${event.category || "General"}</span>
                        ${isRegistered ? '<span class="registered-chip">✓ Registered</span>' : ''}
                    </div>

                    <h3>${event.name}</h3>

                    <div class="event-meta">
                        <p>📅 <strong>${event.date}</strong></p>
                        <p>⏰ ${event.time}</p>
                        <p>📍 ${event.venue}</p>
                        <p>👥 <strong>${seatsLeft}</strong> / ${event.totalSeats || event.capacity} seats available</p>
                        ${event.organizer ? `<p>🏛️ Organized by: <strong>${event.organizer}</strong></p>` : ''}
                    </div>
                </div>

                <div class="event-card-actions">
                    <button class="btn-primary" onclick="openEvent(${event.id})">
                        View Details →
                    </button>
                    ${isRegistered ? `
                        <button class="btn-danger" onclick="toggleQuickRegister(${event.id})">
                            Cancel
                        </button>
                    ` : `
                        <button class="btn-secondary" onclick="toggleQuickRegister(${event.id})">
                            + Register
                        </button>
                    `}
                </div>
            </div>
        `;
    });
}

function searchEvents() {
    const search = document.getElementById("searchBox").value.toLowerCase().trim();

    let filtered = CAMPUS_EVENTS.filter((event) => {
        const matchesCategory = currentCategory === "All" || event.category === currentCategory;
        const matchesSearch =
            (event.name && event.name.toLowerCase().includes(search)) ||
            (event.category && event.category.toLowerCase().includes(search)) ||
            (event.venue && event.venue.toLowerCase().includes(search)) ||
            (event.organizer && event.organizer.toLowerCase().includes(search)) ||
            (event.description && event.description.toLowerCase().includes(search));

        return matchesCategory && matchesSearch;
    });

    displayEvents(filtered);
}

function filterCategory(category, buttonElement) {
    currentCategory = category;

    // Update active class on chips
    document.querySelectorAll(".filter-chip").forEach((btn) => {
        btn.classList.remove("active");
    });
    if (buttonElement) {
        buttonElement.classList.add("active");
    }

    searchEvents();
}

function toggleQuickRegister(id) {
    if (isEventRegistered(id)) {
        cancelEventRegistration(id);
    } else {
        registerForEvent(id);
    }
    searchEvents();
}

function openEvent(id) {
    viewEventDetails(id);
}

document.addEventListener("DOMContentLoaded", async function () {
    const events = await loadLiveCampusEvents();
    displayEvents(events);
});
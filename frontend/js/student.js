/**
 * Campus Event Management - Student Dashboard Logic
 * Displays live database statistics and events
 */
document.addEventListener("DOMContentLoaded", async function () {
    // Load live events from database
    const events = await loadLiveCampusEvents();

    // Update dynamic statistics
    const regList = getRegisteredEventIds();
    const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");

    const totalEl = document.getElementById("statTotalEvents");
    const regEl = document.getElementById("statRegisteredEvents");
    const upcomingEl = document.getElementById("statUpcomingEvents");
    const feedEl = document.getElementById("statFeedbacks");

    if (totalEl) totalEl.textContent = events.length;
    if (regEl) regEl.textContent = regList.length;
    if (upcomingEl) upcomingEl.textContent = events.length;
    if (feedEl) feedEl.textContent = feedbacks.length;

    // Render dashboard upcoming event cards
    const dashContainer = document.getElementById("dashboardEvents");
    if (dashContainer) {
        dashContainer.innerHTML = "";

        if (events.length === 0) {
            dashContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--text-muted);">
                    <p>No campus events currently scheduled in database.</p>
                </div>
            `;
            return;
        }

        const featured = events.slice(0, 3);

        featured.forEach((event) => {
            const isReg = isEventRegistered(event.id);

            let catClass = "cat-technical";
            if (event.category === "Workshop") catClass = "cat-workshop";
            if (event.category === "Seminar") catClass = "cat-seminar";
            if (event.category && event.category.includes("Security")) catClass = "cat-cyber-security";

            dashContainer.innerHTML += `
                <div class="event-card">
                    <div>
                        <div class="event-card-header">
                            <span class="event-category ${catClass}">${event.category || "General"}</span>
                            ${isReg ? '<span class="registered-chip">✓ Registered</span>' : ''}
                        </div>

                        <h3>${event.name}</h3>

                        <div class="event-meta">
                            <p>📅 ${event.date}</p>
                            <p>⏰ ${event.time}</p>
                            <p>📍 ${event.venue}</p>
                        </div>
                    </div>

                    <div class="event-card-actions">
                        <button class="btn-primary" onclick="viewEvent(${event.id})">
                            View Details →
                        </button>
                    </div>
                </div>
            `;
        });
    }
});

function viewEvent(eventId) {
    viewEventDetails(eventId);
}
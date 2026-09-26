/**
 * Campus Event Management - Organizer Portal Data & Helpers
 * Connects directly to live MySQL backend database
 */
const ORGANIZER_API = "http://localhost:5000/api/organizer";
const BACKEND_BASE = "http://localhost:5000/api";

let cachedOrganizerEvents = [];

/**
 * Fetch organizer events from MySQL database
 */
async function loadOrganizerEventsFromDB() {
    const token = localStorage.getItem("token");
    try {
        if (token) {
            const res = await fetch(`${ORGANIZER_API}/events`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                cachedOrganizerEvents = data.data.map(e => ({
                    id: e.event_id,
                    name: e.event_name,
                    category: e.category,
                    date: e.event_date ? new Date(e.event_date).toISOString().split("T")[0] : "",
                    dateDisplay: e.event_date ? new Date(e.event_date).toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' }) : "",
                    time: `${e.start_time || '10:00 AM'} - ${e.end_time || '04:00 PM'}`,
                    venue: e.venue,
                    capacity: e.capacity || 100,
                    registrations: 0,
                    status: e.status ? e.status.charAt(0).toUpperCase() + e.status.slice(1).toLowerCase() : "Pending",
                    description: e.description
                }));
                return cachedOrganizerEvents;
            }
        }
    } catch(err) {
        console.error("Failed to load organizer events:", err);
    }

    // Fallback to public events from database
    try {
        const res2 = await fetch(`${BACKEND_BASE}/events`);
        const data2 = await res2.json();
        if (data2.success && Array.isArray(data2.data)) {
            cachedOrganizerEvents = data2.data.map(e => ({
                id: e.id,
                name: e.name,
                category: e.category,
                date: e.event_date ? new Date(e.event_date).toISOString().split("T")[0] : "",
                dateDisplay: e.date,
                time: e.time,
                venue: e.venue,
                capacity: e.totalSeats || 100,
                registrations: 0,
                status: e.status ? e.status.charAt(0).toUpperCase() + e.status.slice(1).toLowerCase() : "Approved",
                description: e.description
            }));
            return cachedOrganizerEvents;
        }
    } catch (e) {
        console.error("Fallback load failed:", e);
    }

    return cachedOrganizerEvents;
}

function getOrganizerEvents() {
    return cachedOrganizerEvents;
}

function getOrganizerEventById(id) {
    const list = getOrganizerEvents();
    return list.find((e) => e.id === Number(id)) || list[0];
}

async function saveOrganizerEvent(eventData) {
    const token = localStorage.getItem("token");
    const isEdit = Boolean(eventData.isEdit && eventData.id);
    const url = isEdit ? `${ORGANIZER_API}/events/${eventData.id}` : `${ORGANIZER_API}/events`;
    const method = isEdit ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                event_name: eventData.name,
                category: eventData.category,
                event_date: eventData.date,
                start_time: eventData.time ? eventData.time.split(" - ")[0] : "10:00:00",
                end_time: eventData.time && eventData.time.includes(" - ") ? eventData.time.split(" - ")[1] : "16:00:00",
                venue: eventData.venue,
                capacity: eventData.capacity,
                description: eventData.description
            })
        });
        const data = await res.json();
        return data.success;
    } catch(err) {
        console.error("Save event failed:", err);
        return false;
    }
}

async function deleteOrganizerEvent(id) {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${ORGANIZER_API}/events/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        return data.success;
    } catch (e) {
        console.error("Delete event failed:", e);
        return false;
    }
}

function createEvent() {
    localStorage.removeItem("editEvent");
    window.location.href = "create-event.html";
}

function editEvent(id) {
    localStorage.setItem("editEvent", id);
    window.location.href = "create-event.html";
}

function viewEvent(id) {
    localStorage.setItem("organizerEvent", id);
    window.location.href = "event-details.html";
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("organizerLoggedIn");
    window.location.href = "../login.html";
}
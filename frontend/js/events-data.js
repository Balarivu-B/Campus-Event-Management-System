/**
 * Campus Event Management - Central Event Database & Storage Helpers
 * Loads live data from MySQL backend database
 */
const BACKEND_API = "http://localhost:5000/api";

let CAMPUS_EVENTS = [];

/**
 * Fetch live events from MySQL database
 */
async function loadLiveCampusEvents() {
    try {
        const response = await fetch(`${BACKEND_API}/events`);
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
            CAMPUS_EVENTS = json.data;
            return CAMPUS_EVENTS;
        }
    } catch (error) {
        console.error("Failed to load events from database:", error);
    }
    return CAMPUS_EVENTS;
}

// Get user registered event IDs from localStorage (or empty if none)
function getRegisteredEventIds() {
    try {
        const stored = localStorage.getItem("registeredEvents");
        if (stored) {
            return JSON.parse(stored).map(Number);
        }
        return [];
    } catch (e) {
        return [];
    }
}

function isEventRegistered(id) {
    const list = getRegisteredEventIds();
    return list.includes(Number(id));
}

function registerForEvent(id) {
    const numericId = Number(id);
    const list = getRegisteredEventIds();
    if (!list.includes(numericId)) {
        list.push(numericId);
        localStorage.setItem("registeredEvents", JSON.stringify(list));
        return true;
    }
    return false;
}

function cancelEventRegistration(id) {
    const numericId = Number(id);
    let list = getRegisteredEventIds();
    list = list.filter((item) => item !== numericId);
    localStorage.setItem("registeredEvents", JSON.stringify(list));
    return true;
}

function getEventById(id) {
    const numericId = Number(id);
    return CAMPUS_EVENTS.find((e) => e.id === numericId) || null;
}

function viewEventDetails(id) {
    localStorage.setItem("selectedEvent", id);
    window.location.href = "event-details.html";
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("studentLoggedIn");
    localStorage.removeItem("facultyLoggedIn");
    localStorage.removeItem("organizerLoggedIn");
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "../login.html";
}

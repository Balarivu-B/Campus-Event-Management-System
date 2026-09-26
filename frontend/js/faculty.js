/**
 * Campus Event Management - Faculty Portal Data & Logic
 * Connects to live MySQL database
 */
const FACULTY_API = "http://localhost:5000/api/faculty";
const BACKEND_URL = "http://localhost:5000/api";

let cachedFacultyRequests = [];

async function loadFacultyRequestsFromDB() {
    const token = localStorage.getItem("token");
    try {
        if (token) {
            const res = await fetch(`${FACULTY_API}/event-requests`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                cachedFacultyRequests = data.data.map(req => ({
                    id: req.event_id,
                    name: req.event_name,
                    organizer: req.organization_name || "Campus Organizer",
                    department: req.institution || "Engineering",
                    date: req.event_date ? new Date(req.event_date).toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' }) : "",
                    time: `${req.start_time || '10:00 AM'} - ${req.end_time || '04:00 PM'}`,
                    venue: req.venue,
                    participants: req.capacity || 50,
                    type: req.category || "General",
                    description: req.description,
                    status: "Pending"
                }));
                return cachedFacultyRequests;
            }
        }
    } catch (e) {
        console.error("Error loading faculty requests:", e);
    }

    cachedFacultyRequests = [];
    return cachedFacultyRequests;
}

function getFacultyRequests() {
    return cachedFacultyRequests;
}

function getFacultyRequestById(id) {
    const list = getFacultyRequests();
    return list.find((req) => req.id === Number(id)) || null;
}

async function approveFacultyEvent(id) {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${FACULTY_API}/events/${id}/approve`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        return data.success;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function rejectFacultyEvent(id, reason) {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${FACULTY_API}/events/${id}/reject`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ reason })
        });
        const data = await res.json();
        return data.success;
    } catch (e) {
        console.error(e);
        return false;
    }
}

function viewRequest(id) {
    localStorage.setItem("facultySelectedRequest", id);
    window.location.href = "event-details.html";
}

function reviewEvent(id) {
    viewRequest(id);
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("facultyLoggedIn");
    window.location.href = "../login.html";
}
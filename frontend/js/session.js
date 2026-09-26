/**
 * Campus Event Management - Central User Session & UI Sync Helper
 * Populates user name, avatar, and profile fields dynamically from logged-in database user
 */
function getLoggedInUser() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function syncUserInterface() {
    const user = getLoggedInUser();
    if (!user) return;

    const initial = (user.name || "U").trim().charAt(0).toUpperCase();

    // Student UI elements
    document.querySelectorAll(".student-avatar").forEach(el => {
        el.textContent = initial;
    });
    document.querySelectorAll(".student-info span").forEach(el => {
        el.textContent = user.name || "Student";
    });

    // Faculty UI elements
    document.querySelectorAll(".faculty-avatar").forEach(el => {
        el.textContent = initial;
    });
    document.querySelectorAll(".faculty-info span").forEach(el => {
        el.textContent = user.name || "Faculty Coordinator";
    });

    // Organizer UI elements
    document.querySelectorAll(".organizer-avatar").forEach(el => {
        el.textContent = initial;
    });
    document.querySelectorAll(".organizer-info span").forEach(el => {
        el.textContent = user.name || "Event Organizer";
    });

    // Admin UI elements
    document.querySelectorAll(".admin-name").forEach(el => {
        el.textContent = user.name || "System Admin";
    });
    const adminNameEl = document.getElementById("adminProfName");
    if (adminNameEl && user.name) adminNameEl.textContent = user.name;
    const adminEmailEl = document.getElementById("adminProfEmail");
    if (adminEmailEl && user.email) adminEmailEl.textContent = user.email;
    const adminRoleEl = document.getElementById("adminProfRole");
    if (adminRoleEl && user.role) adminRoleEl.textContent = user.role === 'ADMIN' ? 'Super Administrator' : user.role;

    // Topbar welcome messages
    const topbarP = document.querySelector(".topbar-left p");
    if (topbarP && topbarP.textContent.includes("Welcome back")) {
        const roleDesc = user.role === "STUDENT" ? "Here is your campus schedule" :
                         user.role === "FACULTY" ? "Review proposals and official campus authorizations" :
                         user.role === "ORGANIZER" ? "Manage your club proposals and attendee rosters" :
                         "Platform oversight and system administration";
        topbarP.textContent = `Welcome back, ${user.name} 👋 ${roleDesc}`;
    }
}

// Global Logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("studentLoggedIn");
    localStorage.removeItem("facultyLoggedIn");
    localStorage.removeItem("organizerLoggedIn");
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("registeredEvents");
    window.location.href = "../login.html";
}

document.addEventListener("DOMContentLoaded", syncUserInterface);

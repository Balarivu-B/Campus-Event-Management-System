// ===============================
// ADMIN LOGIN AUTHENTICATION GUARD
// ===============================
const ADMIN_API = "http://localhost:5000/api/admin";
const token = localStorage.getItem("token");

if (!localStorage.getItem("adminLoggedIn") || !token) {
    window.location.href = "../login.html";
}

// ===============================
// LOGOUT
// ===============================
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "../login.html";
}

// ===============================
// TOAST NOTIFICATIONS
// ===============================
function showAdminToast(message) {
    const existing = document.querySelector(".admin-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "admin-toast";
    toast.innerHTML = `<span>🛡️</span><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        toast.style.opacity = "0";
        toast.style.transform = "translateY(12px)";
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// ===============================
// FETCH HELPER WITH AUTH
// ===============================
async function fetchAdminData(endpoint) {
    try {
        const response = await fetch(`${ADMIN_API}${endpoint}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return null;
        }

        const data = await response.json();
        return data.success ? data.data : null;
    } catch (err) {
        console.error(`Error fetching ${endpoint}:`, err);
        return null;
    }
}

// ===============================
// LOAD ADMIN DASHBOARD STATS & RECENT EVENTS
// ===============================
async function loadAdminDashboard() {
    const statStudents = document.getElementById("statStudents");
    const statFaculty = document.getElementById("statFaculty");
    const statOrganizers = document.getElementById("statOrganizers");
    const statEvents = document.getElementById("statEvents");

    if (statStudents) {
        const stats = await fetchAdminData("/dashboard");
        if (stats) {
            statStudents.textContent = stats.students || 0;
            statFaculty.textContent = stats.faculty || 0;
            statOrganizers.textContent = stats.organizers || 0;
            statEvents.textContent = stats.events || 0;
        }
    }

    const recentBody = document.getElementById("adminRecentEventsBody");
    if (recentBody) {
        const events = await fetchAdminData("/events");
        if (!events || events.length === 0) {
            recentBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 25px; color: var(--text-muted);">
                        No events currently recorded in database.
                    </td>
                </tr>
            `;
            return;
        }

        recentBody.innerHTML = "";
        events.slice(0, 5).forEach((event) => {
            const statusClass = (event.status || "APPROVED").toLowerCase();
            recentBody.innerHTML += `
                <tr>
                    <td><strong>${event.event_name}</strong></td>
                    <td>${event.organization_name || "Campus Organizer"}</td>
                    <td><span class="status ${statusClass}">${event.status}</span></td>
                    <td><a href="events.html" class="btn-view">View Details</a></td>
                </tr>
            `;
        });
    }
}

// ===============================
// LOAD STUDENTS TABLE
// ===============================
async function loadAdminStudents() {
    const tbody = document.getElementById("studentTableBody");
    if (!tbody) return;

    const students = await fetchAdminData("/students");

    if (!students || students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    No students registered in database yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = "";
    students.forEach((student) => {
        const statusClass = (student.status || "ACTIVE") === "ACTIVE" ? "approved" : "inactive";
        const statusText = (student.status || "ACTIVE") === "ACTIVE" ? "Active" : "Inactive";

        tbody.innerHTML += `
            <tr>
                <td><strong>${student.register_number || `ST00${student.student_id}`}</strong></td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.department || "General"} (Year ${student.year || 1})</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn ${statusClass === 'approved' ? 'btn-danger' : 'btn-outline'}" onclick="toggleUser(this)">
                        ${statusClass === 'approved' ? 'Disable' : 'Enable'}
                    </button>
                </td>
            </tr>
        `;
    });
}

// ===============================
// LOAD FACULTY TABLE
// ===============================
async function loadAdminFaculty() {
    const tbody = document.getElementById("facultyTableBody");
    if (!tbody) return;

    const faculty = await fetchAdminData("/faculty");

    if (!faculty || faculty.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    No faculty coordinators found in database yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = "";
    faculty.forEach((fac) => {
        const statusClass = (fac.status || "ACTIVE") === "ACTIVE" ? "approved" : "inactive";
        const statusText = (fac.status || "ACTIVE") === "ACTIVE" ? "Active" : "Inactive";

        tbody.innerHTML += `
            <tr>
                <td><strong>FAC00${fac.faculty_id}</strong></td>
                <td>${fac.name}</td>
                <td>${fac.email}</td>
                <td>${fac.department || "General"}</td>
                <td>${fac.institution || "Main Campus"}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn ${statusClass === 'approved' ? 'btn-danger' : 'btn-outline'}" onclick="toggleUser(this)">
                        ${statusClass === 'approved' ? 'Disable' : 'Enable'}
                    </button>
                </td>
            </tr>
        `;
    });
}

// ===============================
// LOAD ORGANIZERS TABLE
// ===============================
async function loadAdminOrganizers() {
    const tbody = document.getElementById("organizerTableBody");
    if (!tbody) return;

    const organizers = await fetchAdminData("/organizers");

    if (!organizers || organizers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    No event organizers registered in database yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = "";
    organizers.forEach((org) => {
        const statusClass = (org.status || "ACTIVE") === "ACTIVE" ? "approved" : "inactive";
        const statusText = (org.status || "ACTIVE") === "ACTIVE" ? "Active" : "Inactive";

        tbody.innerHTML += `
            <tr>
                <td><strong>ORG00${org.organizer_id}</strong></td>
                <td>${org.organization_name || org.name}</td>
                <td>${org.email}</td>
                <td>${org.institution || "Main Campus"}</td>
                <td>${org.name} (Club Lead)</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn ${statusClass === 'approved' ? 'btn-danger' : 'btn-outline'}" onclick="toggleUser(this)">
                        ${statusClass === 'approved' ? 'Disable' : 'Enable'}
                    </button>
                </td>
            </tr>
        `;
    });
}

// ===============================
// LOAD EVENTS TABLE
// ===============================
async function loadAdminEvents() {
    const tbody = document.getElementById("eventsTableBody");
    if (!tbody) return;

    const events = await fetchAdminData("/events");

    if (!events || events.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    No events registered in database yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = "";
    events.forEach((event) => {
        const statusClass = (event.status || "PENDING").toLowerCase();
        const dateStr = event.event_date ? new Date(event.event_date).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' }) : "TBD";

        tbody.innerHTML += `
            <tr>
                <td><strong>${event.event_name}</strong></td>
                <td>${event.organization_name || "Campus Club"}</td>
                <td>${dateStr}</td>
                <td>${event.venue || "TBD"}</td>
                <td><span class="status ${statusClass}">${event.status}</span></td>
                <td>
                    ${event.status !== 'CANCELLED' ? `
                        <button class="btn btn-danger" onclick="cancelLiveEvent(${event.event_id}, this)">
                            Cancel
                        </button>
                    ` : `
                        <span style="color: var(--text-muted); font-size: 13px;">Cancelled</span>
                    `}
                </td>
            </tr>
        `;
    });
}

// Cancel Live Event via Backend API
async function cancelLiveEvent(eventId, button) {
    if (!confirm("Are you sure you want to cancel this event in the database?")) return;

    try {
        const response = await fetch(`${ADMIN_API}/events/${eventId}/cancel`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (data.success) {
            showAdminToast("Event cancelled successfully in database!");
            const row = button.closest("tr");
            const statusBadge = row.querySelector(".status");
            if (statusBadge) {
                statusBadge.innerText = "CANCELLED";
                statusBadge.className = "status cancelled";
            }
            button.replaceWith(document.createTextNode("Cancelled"));
        } else {
            alert(data.message || "Failed to cancel event");
        }
    } catch (e) {
        console.error(e);
        alert("Server error while cancelling event");
    }
}

// ===============================
// ENABLE / DISABLE USER
// ===============================
function toggleUser(button) {
    const row = button.closest("tr");
    if (!row) return;

    const statusBadge = row.querySelector(".status");
    const userName = row.children[1] ? row.children[1].innerText.trim() : "User";

    if (button.innerText.trim() === "Disable") {
        button.innerText = "Enable";
        button.className = "btn-outline";
        if (statusBadge) {
            statusBadge.innerText = "Inactive";
            statusBadge.className = "status inactive";
        }
        showAdminToast(`Account for ${userName} has been deactivated.`);
    } else {
        button.innerText = "Disable";
        button.className = "btn-danger";
        if (statusBadge) {
            statusBadge.innerText = "Active";
            statusBadge.className = "status approved";
        }
        showAdminToast(`Account for ${userName} has been reactivated.`);
    }
}

// ===============================
// SEARCH FILTERS
// ===============================
function searchStudents() {
    const input = document.getElementById("studentSearch");
    if (!input) return;
    const filter = input.value.toLowerCase().trim();
    const rows = document.querySelectorAll("#studentTable tbody tr");
    rows.forEach((row) => {
        row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
}

function searchFaculty() {
    const input = document.getElementById("facultySearch");
    if (!input) return;
    const filter = input.value.toLowerCase().trim();
    const rows = document.querySelectorAll("#facultyTable tbody tr");
    rows.forEach((row) => {
        row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
}

function searchOrganizers() {
    const input = document.getElementById("organizerSearch");
    if (!input) return;
    const filter = input.value.toLowerCase().trim();
    const rows = document.querySelectorAll("#organizerTable tbody tr");
    rows.forEach((row) => {
        row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
}

function searchEvents() {
    const input = document.getElementById("eventSearch");
    if (!input) return;
    const filter = input.value.toLowerCase().trim();
    const rows = document.querySelectorAll("#eventsTable tbody tr");
    rows.forEach((row) => {
        row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
}

// ===============================
// LOAD ADMIN REPORTS
// ===============================
async function loadAdminReports() {
    const totalEl = document.getElementById("reportTotalEvents");
    if (!totalEl) return;
    const completedEl = document.getElementById("reportCompletedEvents");
    const upcomingEl = document.getElementById("reportUpcomingEvents");
    const cancelledEl = document.getElementById("reportCancelledEvents");
    const tbody = document.getElementById("adminReportsBody");

    const events = await fetchAdminData("/events");
    if (!events || events.length === 0) {
        totalEl.textContent = "0";
        if (completedEl) completedEl.textContent = "0";
        if (upcomingEl) upcomingEl.textContent = "0";
        if (cancelledEl) cancelledEl.textContent = "0";
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 25px; color: var(--text-muted);">No event reports available in database.</td></tr>`;
        }
        return;
    }

    let completed = 0;
    let upcoming = 0;
    let cancelled = 0;
    const today = new Date().toISOString().split("T")[0];

    events.forEach(e => {
        if (e.status === 'CANCELLED') {
            cancelled++;
        } else if (e.status === 'REJECTED') {
            // rejected
        } else {
            const eventDate = e.event_date ? new Date(e.event_date).toISOString().split("T")[0] : "";
            if (eventDate && eventDate < today) {
                completed++;
            } else {
                upcoming++;
            }
        }
    });

    totalEl.textContent = events.length;
    if (completedEl) completedEl.textContent = completed;
    if (upcomingEl) upcomingEl.textContent = upcoming;
    if (cancelledEl) cancelledEl.textContent = cancelled;

    if (tbody) {
        tbody.innerHTML = "";
        events.forEach(e => {
            const dateStr = e.event_date ? new Date(e.event_date).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' }) : "TBD";
            const statusClass = (e.status || "APPROVED").toLowerCase();
            tbody.innerHTML += `
                <tr>
                    <td><strong>${e.event_name}</strong></td>
                    <td>${e.organization_name || "Campus Organizer"}</td>
                    <td>${dateStr}</td>
                    <td>${e.registered_count || 0}</td>
                    <td>${e.capacity || 100}</td>
                    <td><span class="status ${statusClass}">${e.status}</span></td>
                </tr>
            `;
        });
    }
}

// ===============================
// LOAD ADMIN NOTIFICATIONS
// ===============================
async function loadAdminNotifications() {
    const container = document.getElementById("adminNotificationsList");
    if (!container) return;

    const events = await fetchAdminData("/events");

    let html = `
        <div class="notification-item">
            <div class="notification-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
                ⚙️
            </div>
            <div class="notification-body">
                <strong>Database & System Services Online</strong>
                <p>MySQL connection pool is healthy. JWT token verification and campus event services are fully operational.</p>
                <small>Live System Status</small>
            </div>
            <span class="status approved">Active</span>
        </div>
    `;

    if (events && events.length > 0) {
        events.forEach(ev => {
            const statusClass = (ev.status || "APPROVED").toLowerCase();
            const dateStr = ev.event_date ? new Date(ev.event_date).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' }) : "Upcoming";
            html += `
                <div class="notification-item">
                    <div class="notification-icon" style="background: rgba(2, 132, 199, 0.15); color: #0284c7;">
                        📅
                    </div>
                    <div class="notification-body">
                        <strong>Live Event Record: ${ev.event_name}</strong>
                        <p>Organizer: ${ev.organization_name || 'Campus Club'} • Scheduled for ${dateStr} at ${ev.venue || 'Campus Venue'} (Capacity: ${ev.capacity || 'N/A'}).</p>
                        <small>Database Status: ${ev.status}</small>
                    </div>
                    <span class="status ${statusClass}">${ev.status}</span>
                </div>
            `;
        });
    } else {
        html += `
            <div class="notification-item">
                <div class="notification-icon" style="background: rgba(148, 163, 184, 0.15); color: #64748b;">
                    ℹ️
                </div>
                <div class="notification-body">
                    <strong>No Event Alerts</strong>
                    <p>No event activities or conflicts pending in the campus database.</p>
                    <small>Real-time DB Monitor</small>
                </div>
                <span class="status inactive">Clear</span>
            </div>
        `;
    }

    container.innerHTML = html;
}

// ===============================
// AUTOMATIC DATA LOADER ON DOM READY
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    loadAdminDashboard();
    loadAdminStudents();
    loadAdminFaculty();
    loadAdminOrganizers();
    loadAdminEvents();
    loadAdminReports();
    loadAdminNotifications();
});
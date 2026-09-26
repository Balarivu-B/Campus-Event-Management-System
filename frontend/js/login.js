/**
 * Campus Event Management - Authentication Controller
 * Real Backend API Integration with MySQL Database
 */
const API_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const togglePasswordBtn = document.getElementById("togglePassword");
    const message = document.getElementById("loginMessage");
    const submitBtn = loginForm ? loginForm.querySelector("button[type='submit']") : null;

    // Toggle Password Visibility
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener("click", function () {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePasswordBtn.textContent = "🙈";
            } else {
                passwordInput.type = "password";
                togglePasswordBtn.textContent = "👁️";
            }
        });
    }

    // Handle Form Submit
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;

            if (!email || !password) {
                message.textContent = "Please enter both email and password.";
                message.style.color = "#dc2626";
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = "<span>Signing in...</span>";
            }

            message.textContent = "Verifying credentials...";
            message.style.color = "#0284c7";

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    message.textContent = data.message || "Invalid email or password.";
                    message.style.color = "#dc2626";
                    return;
                }

                // Clean existing session keys
                localStorage.removeItem("studentLoggedIn");
                localStorage.removeItem("facultyLoggedIn");
                localStorage.removeItem("organizerLoggedIn");
                localStorage.removeItem("adminLoggedIn");

                // Store JWT token and user info
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                const userRole = data.user && data.user.role ? data.user.role.toUpperCase() : "";

                message.style.color = "#16a34a";

                if (userRole === "STUDENT") {
                    localStorage.setItem("studentLoggedIn", "true");
                    message.textContent = "✓ Login successful! Redirecting to student dashboard...";
                    setTimeout(() => {
                        window.location.href = "student/dashboard.html";
                    }, 600);
                } else if (userRole === "FACULTY") {
                    localStorage.setItem("facultyLoggedIn", "true");
                    message.textContent = "✓ Login successful! Redirecting to faculty portal...";
                    setTimeout(() => {
                        window.location.href = "faculty/dashboard.html";
                    }, 600);
                } else if (userRole === "ORGANIZER") {
                    localStorage.setItem("organizerLoggedIn", "true");
                    message.textContent = "✓ Login successful! Redirecting to organizer portal...";
                    setTimeout(() => {
                        window.location.href = "organizer/dashboard.html";
                    }, 600);
                } else if (userRole === "ADMIN") {
                    localStorage.setItem("adminLoggedIn", "true");
                    message.textContent = "✓ Administrator verified! Redirecting to admin dashboard...";
                    setTimeout(() => {
                        window.location.href = "admin/dashboard.html";
                    }, 600);
                } else {
                    message.textContent = "✓ Login successful! Redirecting...";
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 600);
                }

            } catch (error) {
                console.error("Login request error:", error);
                message.textContent = "✕ Cannot connect to server. Ensure the backend is running.";
                message.style.color = "#dc2626";
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = "<span>Sign In to Dashboard</span> →";
                }
            }
        });
    }
});
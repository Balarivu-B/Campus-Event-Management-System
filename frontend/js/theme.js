/**
 * Campus Event Management - Theme Controller
 * Handles Light/Dark mode toggling and persistence
 */
(function () {
    function getStoredTheme() {
        const stored = localStorage.getItem("campusevent_theme");
        if (stored) return stored;
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    const currentTheme = getStoredTheme();
    document.documentElement.setAttribute("data-theme", currentTheme);

    window.toggleTheme = function () {
        const current = document.documentElement.getAttribute("data-theme") || "light";
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("campusevent_theme", next);
        updateAllThemeButtons(next);
    };

    function updateAllThemeButtons(theme) {
        const buttons = document.querySelectorAll(".theme-toggle, #themeToggle");
        buttons.forEach((btn) => {
            const isCompact = btn.classList.contains("compact-theme-btn");
            if (theme === "dark") {
                btn.innerHTML = isCompact
                    ? "☀️"
                    : `<span class="theme-icon">☀️</span> <span class="theme-label">Light Mode</span>`;
                btn.setAttribute("title", "Switch to Light Mode");
                btn.setAttribute("aria-label", "Switch to Light Mode");
            } else {
                btn.innerHTML = isCompact
                    ? "🌙"
                    : `<span class="theme-icon">🌙</span> <span class="theme-label">Dark Mode</span>`;
                btn.setAttribute("title", "Switch to Dark Mode");
                btn.setAttribute("aria-label", "Switch to Dark Mode");
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        const theme = document.documentElement.getAttribute("data-theme") || "light";
        updateAllThemeButtons(theme);

        document.querySelectorAll(".theme-toggle, #themeToggle").forEach((btn) => {
            btn.onclick = window.toggleTheme;
        });
    });
})();

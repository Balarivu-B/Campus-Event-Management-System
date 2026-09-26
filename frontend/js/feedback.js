/**
 * Campus Event Management - Feedback Logic
 */
document.addEventListener("DOMContentLoaded", function () {
    const feedbackForm = document.getElementById("feedbackForm");
    const eventSelect = document.getElementById("event");
    const feedbackList = document.getElementById("feedbackList");
    const feedbackCount = document.getElementById("feedbackCount");
    const message = document.getElementById("feedbackMessage");

    // Populate event options dynamically
    if (eventSelect) {
        eventSelect.innerHTML = "";
        CAMPUS_EVENTS.forEach((e) => {
            const opt = document.createElement("option");
            opt.value = e.name;
            opt.textContent = `${e.name} (${e.category})`;
            eventSelect.appendChild(opt);
        });

        // Check if event name was passed in URL query param
        const urlParams = new URLSearchParams(window.location.search);
        const preselectedEvent = urlParams.get("event");
        if (preselectedEvent) {
            for (let i = 0; i < eventSelect.options.length; i++) {
                if (eventSelect.options[i].value.toLowerCase().includes(preselectedEvent.toLowerCase())) {
                    eventSelect.selectedIndex = i;
                    break;
                }
            }
        }
    }

    // Get feedback array from localStorage
    function getStoredFeedbacks() {
        try {
            const data = localStorage.getItem("feedbacks");
            if (data) return JSON.parse(data);
            // Default sample feedback
            const initial = [
                {
                    event: "Web Development Workshop",
                    rating: "5",
                    comments: "Fantastic hands-on masterclass! The live coding examples and modern CSS tips were super practical.",
                    date: "22 Sep 2026"
                }
            ];
            localStorage.setItem("feedbacks", JSON.stringify(initial));
            return initial;
        } catch (e) {
            return [];
        }
    }

    function renderFeedbacks() {
        if (!feedbackList) return;
        const list = getStoredFeedbacks();

        if (feedbackCount) {
            feedbackCount.textContent = `${list.length} Submitted`;
        }

        if (list.length === 0) {
            feedbackList.innerHTML = `
                <div class="empty-state" style="padding: 30px 10px;">
                    <p style="color: var(--text-muted); font-size: 13px;">No feedback submitted yet. Be the first to review an event!</p>
                </div>
            `;
            return;
        }

        feedbackList.innerHTML = "";

        list.slice().reverse().forEach((item) => {
            const stars = "⭐".repeat(Number(item.rating) || 5);
            feedbackList.innerHTML += `
                <div style="background: var(--bg-card-subtle); padding: 16px 18px; border-radius: 14px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <strong style="font-size: 14px; color: var(--text-primary);">${item.event}</strong>
                        <span style="font-size: 12px; color: var(--text-muted);">${item.date || "Recent"}</span>
                    </div>
                    <div style="font-size: 13px; margin-bottom: 8px;">${stars}</div>
                    <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
                        "${item.comments}"
                    </p>
                </div>
            `;
        });
    }

    renderFeedbacks();

    // Form submit listener
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const eventName = document.getElementById("event").value;
            const rating = document.getElementById("rating").value;
            const comments = document.getElementById("comments").value.trim();

            const newFeedback = {
                event: eventName,
                rating: rating,
                comments: comments,
                date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            };

            const allFeedbacks = getStoredFeedbacks();
            allFeedbacks.push(newFeedback);
            localStorage.setItem("feedbacks", JSON.stringify(allFeedbacks));

            message.textContent = "✅ Feedback submitted successfully! Thank you for your review.";
            message.style.color = "#16a34a";

            feedbackForm.reset();
            renderFeedbacks();

            setTimeout(() => {
                message.textContent = "";
            }, 4000);
        });
    }
});
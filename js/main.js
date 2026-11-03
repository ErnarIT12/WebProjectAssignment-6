"use strict";

// Color palettes for the Background button.
const backgroundThemes = [
    { name: "Forest", background: "#111715", surface: "#19221b", raised: "#253127" },
    { name: "Graphite", background: "#17191c", surface: "#202429", raised: "#2c3238" },
    { name: "Midnight", background: "#111c24", surface: "#192831", raised: "#253842" },
];

// Each click moves to the next palette by changing the CSS variables and inline styles.
function initializeBackgroundButton() {
    const button = document.querySelector("#change-background");
    if (!button) return;

    let themeIndex = 0;
    button.addEventListener("click", () => {
        themeIndex = (themeIndex + 1) % backgroundThemes.length;
        const theme = backgroundThemes[themeIndex];
        const root = document.documentElement;
        root.style.setProperty("--paper", theme.background);
        root.style.setProperty("--surface", theme.surface);
        root.style.setProperty("--surface-raised", theme.raised);
        document.body.style.backgroundColor = theme.background;
        // Bootstrap needs the navbar color as "r, g, b", so the hex value is converted.
        document.querySelector(".navbar")?.style.setProperty(
            "--bs-dark-rgb",
            theme.background
                .match(/[a-f\d]{2}/gi)
                .map((value) => parseInt(value, 16))
                .join(", "),
        );
        document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute("content", theme.background);
        button.textContent = `Background: ${theme.name}`;
        document.querySelector("#background-status").textContent =
            `${theme.name} background selected.`;
    });
}

// Shows the visitor's local date and time and updates it every second.
function initializeClock() {
    const clock = document.querySelector("#current-datetime");
    if (!clock) return;

    const dateFormat = new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    const timeFormat = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
    });

    function updateClock() {
        const now = new Date();
        clock.dateTime = now.toISOString();
        clock.textContent = `${dateFormat.format(now)}, ${timeFormat.format(now)}`;
    }

    updateClock();
    window.setInterval(updateClock, 1000);
}

// FAQ: each question button opens or closes its answer panel.
function initializeAccordion() {
    document.querySelectorAll(".faq-question").forEach((button) => {
        const panel = document.getElementById(button.getAttribute("aria-controls"));
        button.addEventListener("click", () => {
            const expanded = button.getAttribute("aria-expanded") !== "true";
            button.setAttribute("aria-expanded", String(expanded));
            panel.setAttribute("aria-hidden", String(!expanded));
            // An inert panel stays out of the keyboard order while it is closed.
            panel.inert = !expanded;
            panel.classList.toggle("is-open", expanded);
        });
    });
}

// Returns the error message for a field, or an empty string when it is valid.
function getFieldError(field, form) {
    const value = field.value.trim();
    const label = field.dataset.label || "This field";

    if (field.type === "radio") {
        return form.querySelector(`input[name="${field.name}"]:checked`)
            ? ""
            : "Choose your experience level.";
    }
    if (field.required && !value) return `${label} is required.`;
    if (field.maxLength >= 0 && field.value.length > field.maxLength) {
        return `${label} must be ${field.maxLength} characters or fewer.`;
    }
    if (field.type === "email" && value) {
        const localPart = value.split("@")[0];
        const invalidDots =
            localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..");
        const invalidFormat =
            field.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (invalidFormat || invalidDots) {
            return "Enter a valid email, for example name@example.com.";
        }
    }
    if (field.name === "password" && field.value.length < 8) {
        return "Use at least 8 characters for your password.";
    }
    if (field.name === "confirmPassword" && field.value !== form.elements.password.value) {
        return "Passwords must match.";
    }
    return "";
}

// Shows or clears a field's error message and updates its invalid state.
function showFieldError(field, message) {
    const errorId = field.type === "radio" ? "experience-error" : `${field.id}-error`;
    const error = document.getElementById(errorId);
    if (error) error.textContent = message;
    field.classList.toggle("is-invalid", Boolean(message));
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
}

// Validates the Contact form on submit. After that, errors update while the user types.
// The multi-step form has its own logic in advanced.js.
function initializeValidation() {
    document.querySelectorAll("form[data-validate]:not([data-multistep])").forEach((form) => {
        const fields = [
            ...form.querySelectorAll("input[required], select[required], textarea[required]"),
        ];
        const status = form.querySelector(".form-status");
        let submitted = false;

        function validateField(field) {
            const message = getFieldError(field, form);
            showFieldError(field, message);
            return !message;
        }

        form.addEventListener("submit", (event) => {
            submitted = true;
            const results = fields.map(validateField);
            if (results.includes(false)) {
                // Cancelling the event also tells the spinner in script.js not to start.
                event.preventDefault();
                status.textContent = "Please correct the highlighted fields.";
                fields[results.indexOf(false)].focus();
                return;
            }

            status.textContent = "Your email app will open to send the message.";
        });

        form.addEventListener("input", (event) => {
            if (!submitted) return;
            if (fields.includes(event.target)) validateField(event.target);
            status.textContent = "";
        });

        form.addEventListener("change", (event) => {
            if (submitted && event.target.type === "radio") {
                const radio = fields.find((field) => field.type === "radio");
                if (radio) validateField(radio);
                status.textContent = "";
            }
        });

        form.addEventListener("reset", () => {
            submitted = false;
            fields.forEach((field) => showFieldError(field, ""));
            status.textContent = "";
        });
    });
}

// Opens and closes the Join GYMZONE popup, then returns focus to the button that opened it.
function initializeProfileDialog() {
    const dialog = document.querySelector("#profile-dialog");
    if (!dialog) return;
    let opener;

    document.querySelectorAll("[data-open-profile]").forEach((button) => {
        button.addEventListener("click", () => {
            opener = button;
            dialog.showModal();
            document.body.classList.add("dialog-is-open");
        });
    });

    dialog.querySelector("[data-close-profile]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
        // A click on the backdrop targets the dialog itself, so close only if it landed outside the box.
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        const outside =
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;
        if (outside) dialog.close();
    });
    dialog.addEventListener("close", () => {
        document.body.classList.remove("dialog-is-open");
        dialog.querySelector("form").reset();
        opener?.focus();
    });
}

initializeBackgroundButton();
initializeClock();
initializeAccordion();
initializeValidation();
initializeProfileDialog();

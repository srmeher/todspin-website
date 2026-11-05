
function initializeThemes() {
    const root = document.documentElement;
    const themeButtons = document.querySelectorAll("[data-theme-option]");

    if (!themeButtons.length) return;

    const validThemes = ["neon", "cyber", "sunset", "light"];
    const storageKey = "tods-theme";

    function applyTheme(theme, save = true) {
        if (!validThemes.includes(theme)) {
            theme = "neon";
        }

        root.dataset.theme = theme;

        themeButtons.forEach((button) => {
            const selected =
                button.getAttribute("data-theme-option") === theme;

            button.setAttribute("aria-pressed", String(selected));
        });

        const themeColor = theme === "light" ? "#F5F5FA" : {
            neon: "#0B0B12",
            cyber: "#091525",
            sunset: "#1B1018",
        }[theme];

        const themeColorMeta = document.querySelector(
            'meta[name="theme-color"]'
        );

        if (themeColorMeta) {
            themeColorMeta.setAttribute("content", themeColor);
        }

        if (save) {
            try {
                localStorage.setItem(storageKey, theme);
            } catch {
                // Theme switching still works if storage is unavailable.
            }
        }
    }

    let savedTheme = "neon";

    try {
        const storedTheme = localStorage.getItem(storageKey);

        if (storedTheme && validThemes.includes(storedTheme)) {
            savedTheme = storedTheme;
        }
    } catch {
        // Use the default theme if browser storage is unavailable.
    }

    applyTheme(savedTheme, false);

    themeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            applyTheme(button.getAttribute("data-theme-option"));
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeThemes, {
        once: true,
    });
} else {
    initializeThemes();
}

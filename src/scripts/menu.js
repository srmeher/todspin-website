
function initializeMenus() {
    const header = document.querySelector(".site-header");

    if (!header || header.dataset.menusInitialized === "true") {
        return;
    }

    header.dataset.menusInitialized = "true";

    const triggers = [...header.querySelectorAll("[data-menu-trigger]")];
    const themeToggle = header.querySelector("[data-theme-toggle]");
    const themePanel = header.querySelector("#theme-panel");

    function closeThemePanel() {
        if (!themeToggle || !themePanel) return;

        themeToggle.setAttribute("aria-expanded", "false");
        themePanel.hidden = true;
    }

    function closeMenus() {
        triggers.forEach((trigger) => {
            const menuId = trigger.getAttribute("aria-controls");
            const menu = document.getElementById(menuId);

            trigger.setAttribute("aria-expanded", "false");

            if (menu) menu.hidden = true;
        });

        closeThemePanel();
    }

    triggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const menuId = trigger.getAttribute("aria-controls");
            const menu = document.getElementById(menuId);

            if (!menu) return;

            const willOpen =
                trigger.getAttribute("aria-expanded") !== "true";

            closeMenus();

            if (willOpen) {
                menu.hidden = false;
                trigger.setAttribute("aria-expanded", "true");
            }
        });
    });

    themeToggle?.addEventListener("click", () => {
        if (!themePanel) return;

        const willOpen =
            themeToggle.getAttribute("aria-expanded") !== "true";

        themeToggle.setAttribute("aria-expanded", String(willOpen));
        themePanel.hidden = !willOpen;
    });

    document.addEventListener("click", (event) => {
        if (!header.contains(event.target)) {
            closeMenus();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            const activeElement = document.activeElement;
            const openTrigger = triggers.find(
                (trigger) =>
                    trigger.getAttribute("aria-expanded") === "true"
            );

            closeMenus();

            if (openTrigger) openTrigger.focus();
            else if (activeElement instanceof HTMLElement) {
                activeElement.blur();
            }
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMenus, {
        once: true,
    });
} else {
    initializeMenus();
}

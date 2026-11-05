const CONTROL_TITLES = {
    theme: "Theme",
    board: "Board",
    bottle: "Bottle",
    volume: "Volume",
    music: "Music",
    settings: "Settings",
};

function initializeGameControlPanel() {
    const panel = document.querySelector("[data-game-control-panel]");

    if (!panel || panel.dataset.initialized === "true") {
        return;
    }

    panel.dataset.initialized = "true";

    const title = panel.querySelector(".game-control-panel__title");
    const sections = [
        ...panel.querySelectorAll("[data-panel-section]"),
    ];

    const closeButtons = [
        ...panel.querySelectorAll("[data-panel-close]"),
    ];

    let lastFocusedElement = null;

    function showSection(control) {
        sections.forEach((section) => {
            section.hidden =
                section.dataset.panelSection !== control;
        });

        if (title) {
            title.textContent =
                CONTROL_TITLES[control] || "Game";
        }
    }

    function open(control) {
        lastFocusedElement = document.activeElement;

        showSection(control);

        panel.hidden = false;
        panel.setAttribute("aria-hidden", "false");

        document.documentElement.classList.add(
            "game-control-panel-open"
        );

        const closeButton = panel.querySelector(
            ".game-control-panel__close"
        );

        closeButton?.focus();
    }

    function close() {
        panel.hidden = true;
        panel.setAttribute("aria-hidden", "true");

        document.documentElement.classList.remove(
            "game-control-panel-open"
        );

        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }

        lastFocusedElement = null;
    }

    document.addEventListener("click", (event) => {
        const target = event.target;

        if (!(target instanceof Element)) {
            return;
        }

        const control = target.closest("[data-game-control]");

        if (control) {
            const controlType =
                control.getAttribute("data-game-control");

            if (controlType) {
                open(controlType);
            }

            return;
        }
    });

    closeButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            close();
        });
    });

    const backdrop = panel.querySelector(
        ".game-control-panel__backdrop"
    );

    backdrop?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        close();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !panel.hidden) {
            close();
        }
    });

    const optionCards = panel.querySelectorAll(
        "[data-option-type]"
    );

    optionCards.forEach((card) => {
        card.addEventListener("click", () => {
            if (card.classList.contains("is-locked")) {
                return;
            }

            const type = card.getAttribute("data-option-type");

            const cardsOfSameType = panel.querySelectorAll(
                `[data-option-type="${type}"]`
            );

            cardsOfSameType.forEach((item) => {
                item.classList.remove("is-selected");
                item.setAttribute("aria-pressed", "false");
            });

            card.classList.add("is-selected");
            card.setAttribute("aria-pressed", "true");

            /*
             * Actual Theme / Board / Bottle changes
             * will be connected here in later steps.
             */
        });
    });

    const volumeSlider = panel.querySelector(
        "[data-volume-slider]"
    );

    const volumeValue = panel.querySelector(
        "[data-volume-value]"
    );

    volumeSlider?.addEventListener("input", () => {
        if (!volumeSlider || !volumeValue) return;

        volumeValue.textContent =
            `${volumeSlider.value}%`;
    });

    const muteButton = panel.querySelector(
        "[data-volume-mute]"
    );

    muteButton?.addEventListener("click", () => {
        if (!volumeSlider || !volumeValue) return;

        const isMuted =
            volumeSlider.value === "0";

        volumeSlider.value = isMuted ? "70" : "0";
        volumeValue.textContent =
            `${volumeSlider.value}%`;

        muteButton.querySelector("span").textContent =
            isMuted ? "Mute" : "Unmute";
    });

    const musicToggle = panel.querySelector(
        "[data-music-toggle]"
    );

    musicToggle?.addEventListener("click", () => {
        const enabled =
            musicToggle.getAttribute("aria-pressed") === "true";

        musicToggle.setAttribute(
            "aria-pressed",
            String(!enabled)
        );

        musicToggle.textContent =
            enabled ? "OFF" : "ON";

        musicToggle.classList.toggle(
            "is-on",
            !enabled
        );
    });
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeGameControlPanel,
        { once: true }
    );
} else {
    initializeGameControlPanel();
}
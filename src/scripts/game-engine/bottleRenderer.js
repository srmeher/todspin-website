import { CONFIG } from "./config.js";

export class BottleRenderer {
    constructor(container) {
        this.container = container;
        this.bottle = null;

        this.transform = {
            x: 0,
            y: 0,
            angle: CONFIG.BOTTLE.INITIAL_ANGLE,
            width: 0,
            height: 0,
            length: 0,
            radius: 0
        };

        this.preventNativeDrag = this.preventNativeDrag.bind(this);
    }

    create() {
        if (this.bottle) return;

        const bottle = document.createElement("img");

        bottle.className = CONFIG.CSS.BOTTLE;
        bottle.src = CONFIG.BOTTLE.IMAGE;
        bottle.alt = "";
        bottle.draggable = false;
        bottle.decoding = "async";
        bottle.style.willChange = "transform";
        bottle.style.backfaceVisibility = "hidden";

        bottle.addEventListener(
            "dragstart",
            this.preventNativeDrag
        );

        this.container.appendChild(bottle);

        this.bottle = bottle;

        this.render();
    }

    preventNativeDrag(event) {
        event.preventDefault();
    }

    setAngle(angle) {
        if (!Number.isFinite(angle)) return;

        this.transform.angle = angle;
        this.render();
    }

    getAngle() {
        return this.transform.angle;
    }

    updateSize(boardDiameter, maxHeight = Infinity) {
        if (
            !this.bottle ||
            !Number.isFinite(boardDiameter) ||
            boardDiameter <= 0
        ) {
            return;
        }

        const aspectRatio = 1000 / 252;

        // Keep the bottle proportional to the board.
        let width = boardDiameter * CONFIG.BOTTLE.SCALE;

        // Prevent the bottle from becoming too tall.
        if (Number.isFinite(maxHeight) && maxHeight > 0) {
            width = Math.min(width, maxHeight / aspectRatio);
        }

        const height = width * aspectRatio;

        this.bottle.style.width = `${width}px`;
        this.bottle.style.height = `${height}px`;

        // Collision dimensions, matching the original engine design.
        this.transform.width = width * 0.94;
        this.transform.height = height * 0.98;
        this.transform.length = this.transform.height;
        this.transform.radius = this.transform.width / 2;
    }

    /*
     * localX/localY:
     * Position inside the bottle's containing element.
     *
     * clientX/clientY:
     * Position relative to the browser viewport.
     *
     * The collider uses client coordinates, while CSS positioning
     * uses local coordinates.
     */
    setCenter(
        localX,
        localY,
        clientX = localX,
        clientY = localY
    ) {
        this.transform.x = clientX;
        this.transform.y = clientY;

        if (!this.bottle) return;

        this.bottle.style.left = `${localX}px`;
        this.bottle.style.top = `${localY}px`;
    }

render() {
    if (!this.bottle) return;

    this.bottle.style.transform =
        `translate3d(-50%, -50%, 0) rotate(${this.transform.angle}deg)`;
}

    getTransform() {
        return { ...this.transform };
    }

    getClientTransform() {
        if (!this.bottle) return null;

        const rect = this.bottle.getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: this.transform.width,
            height: this.transform.height,
            length: rect.height,
            radius: this.transform.radius,
            angle: this.transform.angle
        };
    }

    destroy() {
        if (!this.bottle) return;

        this.bottle.removeEventListener(
            "dragstart",
            this.preventNativeDrag
        );

        this.bottle.remove();

        this.bottle = null;
    }
}
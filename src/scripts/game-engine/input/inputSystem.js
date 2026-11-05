export class InputSystem {
    constructor() {
        this.enabled = true;

        this.pointer = {
            x: 0,
            y: 0,
            isDown: false
        };

        this.center = {
            x: 0,
            y: 0
        };

        this.canDrag = null;

        this.element = null;
        this.attached = false;

        this.onDragStart = null;
        this.onDragMove = null;
        this.onDragEnd = null;
    }

    attach(element) {
        if (!element) {
            throw new Error("InputSystem requires an element.");
        }

        if (this.attached && this.element === element) {
            return;
        }

        this.detach();

        this.element = element;

        element.addEventListener("pointerdown", this.onPointerDown);

        window.addEventListener("pointermove", this.onPointerMove);
        window.addEventListener("pointerup", this.onPointerUp);
        window.addEventListener("pointercancel", this.onPointerUp);

        this.attached = true;
    }

    setCenter(x, y) {
        this.center.x = x;
        this.center.y = y;
    }

    getPointerAngle() {
        const dx = this.pointer.x - this.center.x;
        const dy = this.pointer.y - this.center.y;

        let degrees = Math.atan2(dy, dx) * 180 / Math.PI + 90;

        if (degrees < 0) {
            degrees += 360;
        }

        return degrees;
    }

    onPointerDown = (event) => {
        if (!this.enabled || !this.element) return;

        // Ignore secondary mouse buttons.
        if (event.button !== undefined && event.button !== 0) return;

        this.pointer.x = event.clientX;
        this.pointer.y = event.clientY;

        if (
            this.canDrag &&
            !this.canDrag(event.clientX, event.clientY)
        ) {
            return;
        }

        event.preventDefault();

        this.pointer.isDown = true;

        this.onDragStart?.();
    };

    onPointerMove = (event) => {
        if (!this.enabled || !this.pointer.isDown) return;

        this.pointer.x = event.clientX;
        this.pointer.y = event.clientY;

        event.preventDefault();

        this.onDragMove?.(this.getPointerAngle());
    };

    onPointerUp = () => {
        if (!this.pointer.isDown) return;

        this.pointer.isDown = false;

        this.onDragEnd?.();
    };

    update() {
        // Reserved for future input updates.
    }

    detach() {
        if (this.element) {
            this.element.removeEventListener(
                "pointerdown",
                this.onPointerDown
            );
        }

        window.removeEventListener("pointermove", this.onPointerMove);
        window.removeEventListener("pointerup", this.onPointerUp);
        window.removeEventListener("pointercancel", this.onPointerUp);

        this.pointer.isDown = false;
        this.element = null;
        this.attached = false;
    }

    destroy() {
        this.detach();

        this.canDrag = null;
        this.onDragStart = null;
        this.onDragMove = null;
        this.onDragEnd = null;
    }
}
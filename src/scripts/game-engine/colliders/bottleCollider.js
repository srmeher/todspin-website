
export class BottleCollider {
    constructor() {
        this.center = { x: 0, y: 0 };
        this.width = 0;
        this.height = 0;
        this.angle = 0;
    }

    setTransform(transform) {
        if (!transform) return;

        this.center.x = Number.isFinite(transform.x)
            ? transform.x
            : 0;

        this.center.y = Number.isFinite(transform.y)
            ? transform.y
            : 0;

        this.width = Number.isFinite(transform.width)
            ? Math.max(0, transform.width)
            : 0;

        this.height = Number.isFinite(transform.height)
            ? Math.max(0, transform.height)
            : 0;

        this.angle = Number.isFinite(transform.angle)
            ? transform.angle
            : 0;
    }

    hitTest(x, y) {
        if (
            !Number.isFinite(x) ||
            !Number.isFinite(y) ||
            this.width <= 0 ||
            this.height <= 0
        ) {
            return false;
        }

        const dx = x - this.center.x;
        const dy = y - this.center.y;

        const radians = -this.angle * Math.PI / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        return (
            Math.abs(localX) <= this.width / 2 &&
            Math.abs(localY) <= this.height / 2
        );
    }
}

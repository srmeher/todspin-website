import { MotionTracker } from "../physics/motionTracker.js";

export class DragController {
    constructor({ input, collider, physics }) {
        if (!input || !collider || !physics) {
            throw new Error(
                "DragController requires input, collider, and physics."
            );
        }

        this.input = input;
        this.collider = collider;
        this.physics = physics;

        this.dragging = false;
        this.started = false;
        this.onActivity = null;

        this.motionTracker = new MotionTracker();
        this.dragOffset = 0;

        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragMove = this.handleDragMove.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
    }

    start() {
        if (this.started) return;

        this.input.canDrag = (x, y) => {
            return this.collider.hitTest(x, y);
        };

        this.input.onDragStart = this.handleDragStart;
        this.input.onDragMove = this.handleDragMove;
        this.input.onDragEnd = this.handleDragEnd;

        this.started = true;
    }

    handleDragStart() {
        const pointerAngle = this.input.getPointerAngle();

        this.dragging = true;

        // Stop any existing spin before dragging.
        this.physics.stop();

        // Begin recording pointer movement.
        this.motionTracker.reset();
        this.motionTracker.addSample(pointerAngle);

        // Preserve the bottle's current angle when dragging begins.
        this.dragOffset = pointerAngle - this.physics.getAngle();

        this.onActivity?.();
    }

    handleDragMove(pointerAngle) {
        if (!this.dragging) return;

        const targetAngle = pointerAngle - this.dragOffset;

        // Rotate the bottle to follow the pointer.
        this.physics.setAngle(targetAngle);

        // Record movement so the release can produce a natural spin.
        this.motionTracker.addSample(pointerAngle);

        this.onActivity?.();
    }

    handleDragEnd() {
        if (!this.dragging) return;

        this.dragging = false;

        const angularVelocity =
            this.motionTracker.getAngularVelocity();

        // Release the bottle with the calculated angular velocity.
        this.physics.spin(angularVelocity);

        this.motionTracker.reset();

        this.onActivity?.();
    }

    destroy() {
        if (this.input.onDragStart === this.handleDragStart) {
            this.input.onDragStart = null;
        }

        if (this.input.onDragMove === this.handleDragMove) {
            this.input.onDragMove = null;
        }

        if (this.input.onDragEnd === this.handleDragEnd) {
            this.input.onDragEnd = null;
        }

        this.input.canDrag = null;

        this.dragging = false;
        this.started = false;
        this.motionTracker.reset();

        this.onActivity = null;
    }
}
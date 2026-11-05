
import { CONFIG } from "./game-engine/config.js";
import { BottleRenderer } from "./game-engine/bottleRenderer.js";
import { InputSystem } from "./game-engine/input/inputSystem.js";
import { BottleCollider } from "./game-engine/colliders/bottleCollider.js";
import { SpinPhysics } from "./game-engine/physics/spinPhysics.js";
import { DragController } from "./game-engine/interaction/dragController.js";

const ACTIVE_DEMOS = new WeakMap();

export function initHomepageSpinDemo(root) {
    if (!root) {
        throw new Error("Homepage spin demo requires a root element.");
    }

    // Prevent duplicate initialization on the same element.
    ACTIVE_DEMOS.get(root)?.destroy();

    const board = root.querySelector("[data-spin-board]");
    const bottleLayer = root.querySelector("[data-spin-bottle-layer]");

    if (!board || !bottleLayer) {
        throw new Error(
            "Spin demo requires [data-spin-board] and " +
            "[data-spin-bottle-layer] elements."
        );
    }

    let destroyed = false;
    let animationFrame = 0;
    let lastFrameTime = 0;
    let resizeObserver = null;

    const renderer = new BottleRenderer(bottleLayer);
    const input = new InputSystem();
    const collider = new BottleCollider();
    const physics = new SpinPhysics();

    physics.setObject({ inertia: 1 });

    renderer.create();

    const dragController = new DragController({
        input,
        collider,
        physics
    });

    dragController.start();
    input.attach(root);

    function syncGeometry() {
        if (destroyed) return;

        const rootRect = root.getBoundingClientRect();

        if (rootRect.width <= 0 || rootRect.height <= 0) return;

        const boardRect = board.getBoundingClientRect();

        const centerX = boardRect.left + boardRect.width / 2;
        const centerY = boardRect.top + boardRect.height / 2;

        // Pointer angles use viewport coordinates.
        input.setCenter(centerX, centerY);

        // Bottle CSS positioning uses its containing element's coordinates.
        const layerRect = bottleLayer.getBoundingClientRect();

        renderer.setCenter(
            centerX - layerRect.left,
            centerY - layerRect.top,
            centerX,
            centerY
        );

        // Limit the bottle's height to keep it within the demo area.
        const isDesktop = window.matchMedia("(min-width: 768px)").matches;

        const availableHeight = Math.max(
            1,
            rootRect.height * (isDesktop ? 0.82 : 0.96)
        );

        renderer.updateSize(
            Math.min(boardRect.width, boardRect.height),
            availableHeight
        );

        collider.setTransform(renderer.getTransform());
    }

    function animate(timestamp) {
        animationFrame = 0;

        if (destroyed) return;

        const deltaTime = lastFrameTime
            ? Math.min(
                (timestamp - lastFrameTime) / 1000,
                CONFIG.PHYSICS.MAX_DELTA_TIME
            )
            : 0;

        lastFrameTime = timestamp;

        physics.update(deltaTime);

        renderer.setAngle(physics.getAngle());
        collider.setTransform(renderer.getTransform());

        // Continue only while the bottle is moving or being dragged.
        if (physics.running || dragController.dragging) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            lastFrameTime = 0;
        }
    }

    function destroy() {
        if (destroyed) return;

        destroyed = true;

        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = 0;
        }

        resizeObserver?.disconnect();
        resizeObserver = null;

        window.removeEventListener("scroll", syncGeometry);

        input.destroy();
        dragController.destroy();
        renderer.destroy();

        if (ACTIVE_DEMOS.get(root) === demo) {
            ACTIVE_DEMOS.delete(root);
        }
    }

    const demo = { destroy };

    ACTIVE_DEMOS.set(root, demo);

    if ("ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(syncGeometry);
        resizeObserver.observe(root);
        resizeObserver.observe(board);
        resizeObserver.observe(bottleLayer);
    } else {
        window.addEventListener("resize", syncGeometry);
    }

    // Recalculate bottle and collider positions when the page scrolls.
    window.addEventListener("scroll", syncGeometry, { passive: true });

    // Keep the fallback resize listener removable as well.
    if (!resizeObserver) {
        demo.removeResizeListener = () => {
            window.removeEventListener("resize", syncGeometry);
        };
    }

    const originalDestroy = demo.destroy;

    demo.destroy = () => {
        demo.removeResizeListener?.();
        originalDestroy();
    };

    syncGeometry();

    dragController.onActivity = () => {
        if (!destroyed && !animationFrame) {
            animationFrame = requestAnimationFrame(animate);
        }
    };

    return demo;
}

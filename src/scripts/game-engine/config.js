export const CONFIG = {
    GAME_NAME: "TruthOrDareSpin",
    VERSION: {
        MAJOR: 1,
        MINOR: 0,
        PATCH: 0
    },

    DEBUG: false,

    BOTTLE: {
        SCALE: 0.35,
        INITIAL_ANGLE: 0,
        SHADOW_BLUR: 12,
        IMAGE: "/game-assets/svg/defaultbottle.svg"
    },

    PHYSICS: {
        MAX_ANGULAR_SPEED: 1600,
        MIN_ANGULAR_SPEED: 25,
        SUSPENSE_START_SPEED: 220,
        FINAL_CRAWL_SPEED: 7,
        SUSPENSE_DURATION: 4.0,
        FINAL_CRAWL_DURATION: 1.8,
        POINTER_HISTORY: 8,
        STOP_EPSILON: 0.8,
        MAX_DELTA_TIME: 0.05
    },

    WOBBLE: {
        ENABLED: true,
        AMPLITUDE: 2,
        DURATION: 450,
        OSCILLATIONS: 3
    },

    CSS: {
        BOTTLE: "tods-bottle"
    }
};
/**
 * ==========================================================
 * TruthOrDareSpin
 * Spin Physics Engine
 * ----------------------------------------------------------
 * Responsible ONLY for:
 * • Angular motion
 * • Smooth deceleration
 * • Suspense slowdown
 * • Final crawl
 * • Time integration
 * ==========================================================
 */

import { CONFIG } from "../config.js";


export class SpinPhysics {

    constructor() {

        /*
        ------------------------------------------------------
        Current rotation
        ------------------------------------------------------
        */

        this.angle =
            CONFIG.BOTTLE.INITIAL_ANGLE;


        /*
        ------------------------------------------------------
        Current angular velocity
        ------------------------------------------------------
        */

        this.angularVelocity = 0;


        /*
        ------------------------------------------------------
        Spin state
        ------------------------------------------------------
        */

        this.running = false;


        /*
        ------------------------------------------------------
        Physics object
        ------------------------------------------------------
        */

        this.object = null;


        /*
        ------------------------------------------------------
        Deceleration phases
        ------------------------------------------------------

        idle
        fast
        suspense
        crawl
        ------------------------------------------------------
        */

        this.phase = "idle";


        /*
        ------------------------------------------------------
        Suspense timer
        ------------------------------------------------------
        */

        this.phaseElapsed = 0;


        /*
        ------------------------------------------------------
        Starting speed of current phase
        ------------------------------------------------------
        */

        this.phaseStartSpeed = 0;


        /*
        ------------------------------------------------------
        Direction
        ------------------------------------------------------
        */

        this.direction = 1;

    }


    /* ======================================================
       Set Object
    ====================================================== */

    setObject(object) {

        this.object = object;

    }


    /* ======================================================
       Set Angle
    ====================================================== */

    setAngle(angle) {

        this.angle = angle % 360;

        if (this.angle < 0) {

            this.angle += 360;

        }

    }


    /* ======================================================
       Get Angle
    ====================================================== */

    getAngle() {

        return this.angle;

    }


    /* ======================================================
       Start Spin
    ====================================================== */

    spin(speed) {

        const maxSpeed =
            CONFIG.PHYSICS.MAX_ANGULAR_SPEED;

        const minSpeed =
            CONFIG.PHYSICS.MIN_ANGULAR_SPEED;


        /*
        ------------------------------------------------------
        Clamp incoming speed
        ------------------------------------------------------
        */

        const clampedSpeed =

            Math.max(

                -maxSpeed,

                Math.min(

                    maxSpeed,

                    speed

                )

            );


        /*
        ------------------------------------------------------
        Object inertia
        ------------------------------------------------------
        */

        const inertia =
            this.object?.inertia ?? 1;


        this.angularVelocity =
            clampedSpeed / inertia;


        /*
        ------------------------------------------------------
        Ignore extremely weak flick
        ------------------------------------------------------
        */

        if (

            Math.abs(
                this.angularVelocity
            ) < minSpeed

        ) {

            this.angularVelocity = 0;

            this.running = false;

            this.phase = "idle";

            return;

        }


        /*
        ------------------------------------------------------
        Direction
        ------------------------------------------------------
        */

        this.direction =

            this.angularVelocity >= 0
                ? 1
                : -1;


        /*
        ------------------------------------------------------
        Start in FAST phase
        ------------------------------------------------------
        */

        this.phase = "fast";

        this.phaseElapsed = 0;

        this.phaseStartSpeed =

            Math.abs(
                this.angularVelocity
            );


        this.running = true;

    }


    /* ======================================================
       Stop
    ====================================================== */

    stop() {

        this.angularVelocity = 0;

        this.running = false;

        this.phase = "idle";

        this.phaseElapsed = 0;

        this.phaseStartSpeed = 0;

    }


    /* ======================================================
       Ease Out
       ------------------------------------------------------
       Smooth deceleration curve.

       Starts with stronger movement and gradually
       becomes slower.
       ====================================================== */

    easeOutCubic(t) {

        t = Math.max(

            0,

            Math.min(
                1,
                t
            )

        );

        return 1 -
            Math.pow(
                1 - t,
                3
            );

    }


    /* ======================================================
       Begin Suspense
       ====================================================== */

    beginSuspense() {

        this.phase = "suspense";

        this.phaseElapsed = 0;

        this.phaseStartSpeed =

            Math.abs(
                this.angularVelocity
            );

    }


    /* ======================================================
       Begin Final Crawl
       ====================================================== */

    beginCrawl() {

        this.phase = "crawl";

        this.phaseElapsed = 0;

        this.phaseStartSpeed =

            Math.abs(
                this.angularVelocity
            );

    }


    /* ======================================================
       Update
    ====================================================== */

    update(deltaTime) {

        if (!this.running) {

            return;

        }


        /*
        ------------------------------------------------------
        Protect against unusually large frame gaps
        ------------------------------------------------------
        */

        deltaTime = Math.min(

            deltaTime,

            CONFIG.PHYSICS.MAX_DELTA_TIME

        );


        /*
        ======================================================
        FAST PHASE
        ======================================================
        */

        if (

            this.phase === "fast"

        ) {

            const speed =

                Math.abs(
                    this.angularVelocity
                );


            const suspenseStart =

                CONFIG.PHYSICS
                    .SUSPENSE_START_SPEED;


            /*
            --------------------------------------------------
            Smoothly decelerate toward suspense speed
            --------------------------------------------------
            */

            const deceleration =

                500 *
                deltaTime;


            if (

                speed > suspenseStart

            ) {

                const newSpeed =

                    Math.max(

                        suspenseStart,

                        speed -
                        deceleration

                    );


                this.angularVelocity =

                    this.direction *
                    newSpeed;

            }


            /*
            --------------------------------------------------
            Enter suspense phase
            --------------------------------------------------
            */

            if (

                Math.abs(
                    this.angularVelocity
                )

                <=

                suspenseStart

            ) {

                this.beginSuspense();

            }

        }


        /*
        ======================================================
        SUSPENSE PHASE
        ======================================================
        */

        else if (

            this.phase === "suspense"

        ) {

            this.phaseElapsed +=
                deltaTime;


            const duration =

                CONFIG.PHYSICS
                    .SUSPENSE_DURATION;


            const progress =

                Math.min(

                    this.phaseElapsed /
                    duration,

                    1

                );


            /*
            --------------------------------------------------
            Smooth easing
            --------------------------------------------------
            */

            const eased =

                this.easeOutCubic(
                    progress
                );


            const startSpeed =

                this.phaseStartSpeed;


            const crawlSpeed =

                CONFIG.PHYSICS
                    .FINAL_CRAWL_SPEED;


            /*
            --------------------------------------------------
            Gradually reduce speed
            --------------------------------------------------
            */

            const speed =

                startSpeed -

                (

                    startSpeed -
                    crawlSpeed

                ) *

                eased;


            this.angularVelocity =

                this.direction *
                Math.max(

                    crawlSpeed,

                    speed

                );


            /*
            --------------------------------------------------
            Suspense phase finished
            --------------------------------------------------
            */

            if (

                progress >= 1

            ) {

                this.beginCrawl();

            }

        }


        /*
        ======================================================
        CRAWL PHASE
        ======================================================
        */

        else if (

            this.phase === "crawl"

        ) {

            this.phaseElapsed +=
                deltaTime;


            const duration =

                CONFIG.PHYSICS
                    .FINAL_CRAWL_DURATION;


            const progress =

                Math.min(

                    this.phaseElapsed /
                    duration,

                    1

                );


            /*
            --------------------------------------------------
            Smoothly reduce final movement toward zero
            --------------------------------------------------
            */

            const eased =

                this.easeOutCubic(
                    progress
                );


            const startSpeed =

                this.phaseStartSpeed;


            const finalSpeed =

                CONFIG.PHYSICS
                    .FINAL_CRAWL_SPEED;


            const speed =

                finalSpeed *

                (

                    1 -
                    eased

                );


            this.angularVelocity =

                this.direction *
                Math.max(

                    0,

                    speed

                );


            /*
            --------------------------------------------------
            Final stop
            --------------------------------------------------
            */

            if (

                progress >= 1

            ) {

                this.stop();

                return;

            }

        }


        /*
        ======================================================
        ROTATION
        ======================================================
        */

        this.angle +=

            this.angularVelocity *
            deltaTime;


        /*
        ------------------------------------------------------
        Keep angle normalized
        ------------------------------------------------------
        */

        this.angle %= 360;

        if (

            this.angle < 0

        ) {

            this.angle += 360;

        }

    }

}
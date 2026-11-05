/**
 * ==========================================================
 * TruthOrDareSpin
 * Motion Tracker
 * ----------------------------------------------------------
 * Stores recent angular movement
 * and estimates angular velocity.
 * ==========================================================
 */

export class MotionTracker {

    constructor(maxSamples = 8) {

        this.maxSamples = maxSamples;

        this.samples = [];

    }

    /* ------- Add reset -------- */
    reset() {

        this.samples.length = 0;

    }

    /* ------- Add sample -------- */
    addSample(angle) {

        const sample = {

            angle,

            time: performance.now()

        };

        this.samples.push(sample);

        if (

            this.samples.length >

            this.maxSamples

        ) {

            this.samples.shift();

        }

    }

    /* ------- velocity calculation -------- */
    /* ------- Add getAngularVelocity -------- */
    getAngularVelocity() {

        if (

            this.samples.length < 2

        ) {

            return 0;

        }

        let totalWeight = 0;

        let weightedVelocity = 0;

        for (

            let i = 1;

            i < this.samples.length;

            i++

        ) {

            const previous =

                this.samples[i - 1];

            const current =

                this.samples[i];

            let deltaAngle =

                current.angle -

                previous.angle;

            if (deltaAngle > 180) {

                deltaAngle -= 360;

            }

            if (deltaAngle < -180) {

                deltaAngle += 360;

            }

            const deltaTime =

                (current.time -

                previous.time) / 1000;

            if (deltaTime <= 0) {

                continue;

            }

            const velocity =

                deltaAngle /

                deltaTime;

            const weight = i * i;

            weightedVelocity +=

                velocity * weight;

            totalWeight += weight;

        }

        if (totalWeight === 0) {

            return 0;

        }

        return weightedVelocity /

            totalWeight;

    }

}
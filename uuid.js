export default Uuid;

class Uuid {

    #uuid;
    #creationTime;

    constructor() {
        if (this.constructor === Uuid) {
            throw new Error("Uuid cannot be instantiated directly");
        }
        this.generate();
    }

    generate() {

        if (this.#uuid !== undefined) {
            throw new Error("Uuid has already been generated");
        }

        if (crypto === null || crypto === undefined) {
            throw new Error("crypto API is not available");
        }

        // Get the current timestamp in milliseconds
        this.#creationTime = Date.now();

        // Generate a UUID using the crypto API
        try {
            this.#uuid = crypto.randomUUID();
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('not supported')) {
                throw new Error("Your browser does not support the crypto API, which is required for this game. Consider using a modern browser.")
            } else {
                console.error("Uuid generation failed", error);
                throw error;
            }
        }
        return this.#uuid;
    }

    // Get uuid
    get uuid() {
        if (this.#uuid === undefined) {
            throw new Error("Uuid has not been generated yet");
        }
        return this.#uuid;
    }

    // Get creationTime
    get creationTime() {
        if (this.#creationTime === undefined) {
            throw new Error("Uuid has not been generated yet");
        }
        return this.#creationTime;
    }
}

console.log(`uuid.js loaded.`)


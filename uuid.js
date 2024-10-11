export default Uuid;

class Uuid {

    #uuid;
    #creationTime;

    constructor() { this.generate() }

    generate() {

        // Get the current timestamp in milliseconds
        this.#creationTime = Date.now();

        // Generate a UUID using the crypto API
        this.#uuid = crypto.randomUUID();
        return this.#uuid;
    }

    // Get uuid
    get uuid() {
        return this.#uuid;
    }

    // Get creationTime
    get creationTime() {
        return this.#creationTime;
    }
}

console.log(`uuid.js loaded.`)

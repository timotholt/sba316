//====================================================================
// cryptoRandom()
//
// Generates a number betwee 0 and 1 using the cryptographic API.
// Will crash if crypto API doesn't exist.
//====================================================================

function cryptoRandom() {
    const randomValues = new Uint32Array(1);
    window.crypto.getRandomValues(randomValues);
    return randomValues[0] / 0xffffffff;
}

//====================================================================
// Generate a random number
//
// The first time we call it, we figure out whether to use the
// crypto API or math.random
//====================================================================

function randomFloat() {

    // If we haven't figured out which random function to use
    if (!randomNumber.randomFunction) {

        // Figure it out
        randomNumber.randomFunction =
            (typeof window.crypto !== 'undefined' && window.crypto.getRandomValues) ? cryptoRandom : Math.random;
    }

    // Return a random number
    return randomNumber.randomFunction();
}

//====================================================================
// Generate a random integer between min and max
//====================================================================

function randomIntBetween(min, max) {
    const range = max - min + 1;
    return Math.floor(randomFloat() * range) + min;
}


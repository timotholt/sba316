//==================================================================
// Generate a fake UUID
//
// Numbers are totally unique unless generated within 1ms of
// each other.
//
// If IDs are generated more than 1 millisecond apart, they are
// 100% unique.
//
// If two IDs are generated at shorter intervals, and assuming that
// the random method is truly random, this would generate IDs that
// are 99.99999999999999% likely to be globally unique (collision
// in 1 of 10^15).
//
// Returns a string
//==================================================================

function generateUniqueUUID() {

    // Get the current timestamp in milliseconds
    const timestamp = Date.now();

    // Get the user agent
    const userAgent = navigator.userAgent;

    // Get the screen resolution
    const screenResolution = `${screen.width}x${screen.height}`;

    // Get the browser language
    const language = navigator.language;

    // Get the timezone offset
    const timezoneOffset = new Date().getTimezoneOffset();

    // Generate a random number using crypto.getRandomValues
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const randomComponent = Array.from(randomBytes).map(byte => byte.toString(16).padStart(2, '0')).join('');

    // Combine the components into a string and hash it
    const fingerprint = `${timestamp}-${userAgent}-${screenResolution}-${language}-${timezoneOffset}-${randomComponent}`;
    const hash = crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprint))
        .then(hashBytes => {
        const hashString = Array.from(new Uint8Array(hashBytes)).map(byte => byte.toString(16).padStart(2, '0')).join('');
        return hashString;
        })
        .catch(error => {
        console.error("Error generating UUID:", error);
        return null; // Return null or a default value in case of error
        });

    // Return the hashed fingerprint as the UUID
    return hash;
}

console.log(`uuid.js loaded.`)

//===============================================================
// Distance between two points
//===============================================================

function distanceBetween(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    return Math.abs(Math.sqrt(deltaX * deltaX + deltaY * deltaY));
}

// Generate a random number between 0 and max-1
function randomInt(max) {
    return Math.floor(Math.random() * max); 
}

// Return a number between (min) and (max) inclusive
// (4,10) = 4,5,6,7,8,9,10
// (20,21) = 20,21
function randomIntBetween(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max) + 1;
    return Math.floor(Math.random() * (max - min)) + min
}

// Display loading message
console.log(`mathhelpers.js loaded.`)

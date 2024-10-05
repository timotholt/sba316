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

// Return a number between (min) and (max)
function randomIntBetween(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)    
    return Math.floor(Math.random() * (max - min)) + min
}

// Display loading message
console.log(`mathhelpers.js loaded.`)

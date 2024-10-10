//===============================================================
// rolLDiceString(diceExpression)
//
// Evaluates a simple dice expression (no operators or math functions)
//
// Returns: a *string* representing the number rolled
//
// These dice strings work:
//
// "34" returns "34"
// "-7" returns "-7"
// "1d4" returns "1" or "2" or "3" or "4"
// "1d6" returns "1" .. "6"
// "2d4" returns "2" .. "8"
// "3d6" returns "3" .. "18"
// "1d100" returns "1" .. "100"
//
// Expressions are NOT supported. These dice strings are invalid:
//
// 1d4+2
// 1d2+1d2
//
// Note1: that dice doesn't have to have any particular number of sides
//
// "1d17" -- Not a real die in real life, but it works
//
// Note2: This calls randomFloat() to generate the dice rolls, which
// is part of random.js
//===============================================================

function rollDiceString(s) {

    // If the string is empty or null, return 0
    if (s == null || s === undefined || s === "")
        throw new Error("rollDiceString() was passed a null or undefined string.");

    // Remove all whitespace
    s = s.trim();

    // If the string is just a number, return it
    if (/^-?\d+$/.test(s)) {
        return s;
    }

    // Split the dice string into the number of dice and the number of sides
    const parts = s.split('d');
    if (parts.length !== 2) {
        throw new Error(`Invalid dice string: ${s}`);
    }
    const numDice = Number(parts[0]);
    const numSides = Number(parts[1]);

    // Check for NaN
    if (isNaN(numDice) || isNaN(numSides)) {
        throw new Error(`Invalid dice string: ${s}`);
    }

    // Roll the dice
    let total = 0;
    for (let i = 0; i < numDice; i++) {
        total += Math.floor(randomFloat() * numSides) + 1;
    }

    // Convert the total back to a string for eval()
    return total.toString();
}

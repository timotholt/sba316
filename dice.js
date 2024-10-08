
//===============================================================
// Take a string such as:
//
// "1d6 + 2"
// "2 d 8+3"
//
// "2d4 + 2d8"
// "d4 + d6"
// "100"
//
// And returns the appropriate result.
//
// Note: Uses randomFloat() function from random.js
//=================================================================

function rollDice(diceString) {

    // Remove all whitespace from the string
    const s = str.replace(/\s/g, '');

    // Split the string into roll strings,  using either whitespace or '+' as delimiters
    const rollStrings = s.split(/\s|\+/);

    // Calculate the result for each roll and sum them
    let result = 0;
    for (const rollString of rollStrings) {
        const [numDice, diceSize, modifier] = rollString.split(/d|\+/);
        const diceCount = parseInt(numDice);
        const diceSides = parseInt(diceSize);
        const mod = parseInt(modifier);

        // Roll the dice
        for (let i = 0; i < diceCount; i++) {
        result += Math.floor(randomFloat() * diceSides) + 1;
        }

        // Apply the modifier
        result += mod;
    }

    // Ensure the result is non-negative
    return Math.max(0, result);
}

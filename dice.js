
//===============================================================
// Take a string such as:
//
// "1d6+2"
// "2d8+3"
// "100"
//
// And returns the appropriate result
//=================================================================

function rollDice(diceString) {

    // Split the string into its components
    const [numDice, diceSize, modifier] = diceString.split(/d|\+/);

    // Parse the components into numbers
    const diceCount = parseInt(numDice);
    const diceSides = parseInt(diceSize);
    const mod = parseInt(modifier);

    // Roll the dice
    let result = 0;
    for (let i = 0; i < diceCount; i++) {
      result += Math.floor(randomFloat() * diceSides) + 1;
    }

    // Apply the modifier
    result += mod;

    // Ensure the result is non-negative
    return Math.max(0, result);
}


//===============================================================
// rollDice(diceExpression)
//
// This function can handle elaborate math expressions such as:
// 1d4
// 2d6+6
// 2d4 + 2d8 - 1
// 100 - 2 * (d4 + d6) + 1
// (d4 + d6 + d8) * 2
//
// And returns the appropriate result.
//
// Note: Uses randomFloat() function from random.js
//=================================================================

function rollDice(diceExpression) {

    // If the string is empty, return 0
    if (!diceExpression || diceExpression === "") {
        return 0;
    }

    // Remove all whitespace from the string using trim()
    diceExpression = diceExpression.trim();

    function evaluateDiceSubexpression(diceExpression) {
        const [numDice, numSides] = diceExpression.split('d').map(Number);
        if (isNaN(numDice) || isNaN(numSides)) {
            throw new Error(`Invalid dice expression: ${diceExpression}`);
        }
        let total = 0;

        for (let i = 0; i < numDice; i++) {
            total += Math.floor(randomFloat() * numSides) + 1;
        }

        // Convert the total back to a string for eval()
        return total.toString();
    }

    try {
        // Replace all dice roll sub-expressions (2d6) with the actual value
        diceExpression = diceExpression.replace(/(\d+d\d+)/g, evaluateDiceSubexpression)
    } catch (error) {
        console.error(`Error evaluating dice expression: ${diceExpression}`);
        console.error(error);
        return 0;
    }

    // Evaluate the math expression
    let result;
    try {
        result = eval(diceExpression);
    } catch (error) {
        console.error(`Error evaluating expression: ${diceExpression}`);
        console.error(error);
        return 0;
    }

    // Ensure the result is a number
    if (typeof result !== 'number') {
        throw new Error(`Invalid result: ${result}`);
    }
    return result;
}


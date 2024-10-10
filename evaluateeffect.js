
// These are examples of status effects
const typicalStatusEffects = [
    { name: "blind", startMessage: "the world turns black", endMessage: "you can see again", effect1: "entity.sightRange=0", duration: "1d4" },
    { name: "confused", startMessage: "you are confused", endMessage: "you regain your senses", effect1: "entity.randomMovement=1", duration: "1d4" },
    { name: "frozen", startMessage: "you feel frozen", endMessage: "you can move again", effect1: "entity.actionPoints-=1d4", duration: "1d4" },
    { name: "petrified", startMessage: "you are petrified", endMessage: "you can move again", effect1: "entity.actonPoints=0", effect2: "acAdjustment=+10", duration: "1d4" },
    { name: "paralyzed", startMessage: "you are paralyzed", endMessage: "you can move again", effect1: "entity.actionPoints=0", duration: "1d4" },
    { name: "poisoned", startMessage: "you are poisoned", endMessage: "you can move again", effect1: "entityh.deathTimer-=1", duration: "1d8" },
    { name: "sleeping", startMessage: "you fall asleep", endMessage: "you can wake up again", effect1: "entity.actionPoints=0", duration: "1d4" },
    { name: "stunned", startMessage: "you are stunned", endMessage: "you can move again", effect1: "entity.actionPoints=0;", effect2: "acAdjustment=10",duration: "1d4" },
    { name: "burning", startMessage: "you catch on fire", endMessage: "the fire goes out", effect1: "entit.stat.hp-=1d4", duration: "1d4" },
    { name: "regeneration", startMessage: "you start healing", endMessage: "you stop healing", effect1: "entit.stat.hp+=1d2", duration: "1d4" }
];

//===============================================================
// rolLDiceString(diceExpression)
//
// Evaluates a simple dice expression (no operators or math
// Returns: a string representing the number rolled
//
// These dice strings work:
//
// "34"
// "-7"
// "1d4"
// "1d6"
// "2d4"
// "3d6"
// "1d100"
// "1d17" -- dice doesn't have to have any particular number of sides
//
// These dice strings are NOT SUPPORTED:
//
// 1d4+2
// 1d2+1d2
//
// Note that it uses randomFloat() to generate the dice rolls, which
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

//===============================================================
// evaluateEffect(effectExpression)
//
// Evaluates the given effect expression as Javascript, enhanced
// with dice roll sub-expressions and returns the result.
//
// Because it invokes the eval() function, care must be taken not
// to evaluate arbitrary Javascript.
//
// Example:
//
// Long sword does hit point damage - 1d8 + strength bonus
//   "hpDamage=1d8+stat.strengthBonus()"
//
// Increase maxHp by 1d8
//  "entity.stat.maxHp += 1d8"
//
// XP gain 3d10 * 100
//   "entity.gainXp(3d10*100)"
//
// Recover 20% of maxHp
//   "entity.currentHp += entity.maxHp * 0.2"
//
// Temporarily add +2 to strength
//   "entity.stat.currentStrength += 2"
//
// Stunned for 1-2 turns (creatures gain 1 action point per turn)
//   "entity.actionPoints -= 1d2"
//
// Blind
//  "entity.currentSightRange = 0"
//
// Make a dex check or take 1d6 hit point damage
//  "if (1d20 > entity.stat.dex) { entity.currehtHp -= 1d6 }"
//
// Explosion
//  {
//     let list = getEntitiesInRange(3, TYPE_CREATURE);
//     for (let i = 0; i < list.length; i++) { list[i].currentHp -= "1d6"}
//  }
//
// And returns the appropriate result.
//
// Note: Uses randomFloat() function from random.js
//=================================================================

function evaluateEffectExpression(effectExpression) {

    // If the string is empty, return 0
    if (!effectExpression || effectExpression === "") {
        return 0;
    }

    // Display the expression string passed in
    console.log(`In: evaluateEffectExpression(${effectExpression})`);    

    // Remove all whitespace from the string using trim()
    effectExpression = effectExpression.trim();

    try {
        // Replace all dice roll sub-expressions (such as 2d6) with the actual value
        effectExpression = effectExpression.replace(/(\d+)d(\d+)/g, rollDiceString)
    } catch (error) {
        console.error(`Error evaluating effect expression: ${effectExpression}`);
        console.error(error);
        return 0;
    }

    let result;
    try {
        // Evaluate the expression as if it was a normal JS expression
        result = eval(effectExpression);
    } catch (error) {
        console.error(`Error evaluating effectexpression: ${effectExpression}`);
        console.error(error);
        return 0;
    }

    // Display the result string and return it
    console.log(`evaluateEffectExpression(${effectExpression}) returned: ${result}`);    
    return result;
}

//==================================================================
// Verify that the effect is valid
//==================================================================

function isValidEffect(effect) {

    // Get the name of the function that called this function
    let callingFunc = isValidEffect.caller?.name || "unknown";

    // Check for null or undefined status effect properties
    const requiredProperties = ["name", "startMessage", "endMessage", "duration"];
    if (requiredProperties.some(property => effect?.[property] === null || effect?.[property] === undefined)) {
        console.log(`${callingFunc} was passed a null or undefined status effect property.`);
        return false;
    }

    // If status effect isn't a valid object
    if (typeof effect !== "object" || effect === null) {
        console.log(`${callingFunc} was passed a effect that isn't a object.`);
        return false;
    }

    // Check for other bugs
    if (effect.name === "" || effect.startMessage === "" || effect.endMessage === "" || effect.duration === "") {
        console.log(`${callingFunc} was passed a status effect with empty string properties.`);
        return false;
    }

    if (typeof effect.duration !== "string" || ! effect.duration.match(/^\d+d\d+$/)) {
        console.log(`${callingFunc} was passed a status effect with an invalid duration.`);
        return false;
    }

    return true;
}

//==================================================================
// attachStatusEffectToEntity()
//
// Add status effect to entity, taking the duration into account.
//==================================================================

function attachStatusEffectToEntity(entity, statusEffect) {

    // Check for null or undefined arguments
    if (entity === null || entity === undefined || statusEffect === null || statusEffect === undefined) {
        console.log("attachStatusEffectToEntity() was passed a null or undefined entity or status effect.");
        return;
    }

    // Check for valid status effect
    if (!isValidEffect(statusEffect)) {
        console.log("attachStatusEffectToEntity() was passed an invalid status effect.");
        return;
    }

    // if the entity doesn't have status effects, create an empty array
    if (entity.statusEffects === null || entity.statusEffects === undefined)
        entity.statusEffects = [];

    // Find the index of the status effect
    let n = entity.statusEffects.length;

    // Deep copy object and add it to the entity
    entity.statusEffects.push(JSON.parse(JSON.stringify(statusEffect)));

    // If the status effect is a string
    switch(typeof statusEffect.duration) {

        // It should only be a string, but this makes the code more robust
        case 'number':
            entity.statusEffects[n].duration = Number(statusEffect.duration);
            message(entity.statusEffects[n].startMessage);
            break;

        // Duration should be a hardcoded string or dice roll
        case 'string':
            // Calculate the actual duration of the status effect instead of copying the string
            entity.statusEffects[n].duration = Number(rollDice(statusEffect.duration));
            message(entity.statusEffects[n].startMessage);
            break;

        default:
            console.log(`Invalid status effect duration: ${statusEffect.duration}`);
            break;
    }
}

//==================================================================
// applySingleEffect()
//
// This can be a effect that is part of entity or attached
// to another object (such as a sword, ring of fire, etc).
//
// This is the primary mechanism for applying damage to characters,
// including weapons, wands, rings, swords, etc.
//==================================================================

function applySingleEffect(entity, effect) {

    // Check if the entity exists
    if (entity === null || entity === undefined) {
        console.log("applySingleStatusEffect() was passed a null or undefined entity.");
        return;
    }

    // Check for valid effect
    if (!isValidEffect(effect)) {
        console.log("applySingleStatusEffectToEntity() was passed an invalid effect.");
        return;
    }
    

    // Loop through all keys of type effectN and apply the effect
    for (let key in effect) {

        // Find any keys that start with the name 'effect'
        if (key.startsWith("effect")) {

            // Get the value of the effect
            let value = effect[key];

            // Check if value is null or undefined
            if (value === null || value === undefined) {
                console.log("applySingleStatusEffect() value is null or undefined.");
                continue;
            }
            console.log(value);

            // Find the key it will affect in the value
            let effectKey = Object.keys(value)[0];
            let effect = value[effectKey];

            // Check if effectKey is null or undefined
            if (effectKey === null || effectKey === undefined) {
                console.log("Invalid effect key: " + effectKey);
                continue;
            }

            // Check if effectKey is a string
            if (typeof effectKey !== 'string') {
                console.log("Invalid effect key: " + effectKey);
                continue;
            }

            // Check if effectKey exists in entity
            if (entity[effectKey] === null || entity[effectKey] === undefined) {
                console.log("Effect key does not exist in entity: " + effectKey);
                continue;
            }

            //==============================================================
            // Effect string format:
            //   [n%][key][operator][dicestring]
            //   - n: optional percentage (0-100) indicating chance of effect occurring
            //   - key: entity key to be modified
            //   - operator: one of +=, -=, or =, indicating operation to perform on key
            //   - dicestring: string to be passed to dice function for random value generation
            //
            // Example: 20%:stats.str+=1d6
            //          50%:hp-=2d4
            //          stats.dex+=1d8
            //          100%:ac-=1
            //          25%:stats.str=3d6+2
            //          stats.int+=1
            //          90%:spd-=1d2
            //==============================================================

            // Check if the effect is a string
            if (typeof effect !== 'string') {
                console.log(`Invalid effect: ${effect}`);
                continue;
            }

            // Parse the effect string, remove the whitespace
            const match = effect.match(/(\d+%:?)?(.+?)([+=-])(.*)/).trim();

            if (match) {
                const percentage = (match[1] ? parseInt(match[1]) : 100); // default to 100% if not specified
                const key = match[2];
                const operator = match[3];
                const diceroll = match[4];

                console.log(percentage, key, operator, diceroll);

                // Check if percentage is from 1-99
                if (percentage < 1 || percentage > 99) {

                    // Roll the dice
                    let roll = rollDice("1d100");

                    // Check if the roll is greater than the percentage
                    if (roll > Number(percentage))
                        continue;
                }

                // Check if operator is valid (+=, -=, or =)
                if (operator === "-=") {
                    entity[key] -= Number(rollDice(diceroll));
                }
                else if (operator === "+=") {
                    entity[key] += Number(rollDice(diceroll));
                }
                else if (operator === "=") {
                    entity[key] = Number(rollDice(diceroll));
                }
                else {
                    console.log(`Invalid operator: ${operator} in ${effect}`);
                }
            }
        }
    }
}
//==================================================================
// detachStatusEffectByName()
//
//
// Remove status effect of type from entity
//==================================================================
function detachStatusEffectByName(entity, name) {

    // Check if the entity exists
    if (entity === null || entity === undefined) {
        console.log("detachStatusEffectByType() was passed a null or undefined entity.");
        return;
    }

    // Check for null or undefined name
    if (name === null || name === undefined || name === '') {
        console.log("detachStatusEffectByType() was passed a null or undefined status type.");
        return;
    }

    // Check for null or undefined statusEffects in entity
    if (entity.statusEffects === null || entity.statusEffects === undefined) {
        console.log("detachStatusEffectByType() entity.statusEffects is null or undefined.");
        return;
    }

    // Check if the entity has the status effect
    if (!entity.statusEffects.some(effect => effect.name === name)) {
        console.log(`Entity does not have status effect: ${name}`);
        return;
    }

    // Remove it
    entity.statusEffects = entity.statusEffects.filter(effect => effect.name !== name);
}

//==================================================================
// processStatusEffects()
//
// Apply all status effects that have afflicted this entity. This
// function should be called every turn.
//==================================================================

function processStatusEffects(entity) {

    //TODO: Implement the specific logic to apply the effect based on the effect.name

    // Check if the entity exists
    if (entity === null || entity === undefined) {
        console.log("Invalid entity passed to processStatusEffects()");
        return;
    }

    // Check if the entity has status effects
    if (entity.statusEffects === null || entity.statusEffects === undefined) {
        console.log("Entity passed to processStatusEffects() has no status effects.");
        return;
    }

    // Loop through all the status effects afflicted on the player
    for (let i = 0; i < entity.statusEffects.length; i++) {

        // Check if the status effect is valid
        if (entity.statusEffects[i] === null || entity.statusEffects[i] === undefined) {
            console.log(`processStatusEffects() received a null or undefined status effect at index ${i}.`);
            continue;
        }

        // Apply the effect to the character
        applySingleStatusEffect(entity, entity.statusEffects[i]);

        // Decrease the duration
        entity.statusEffects[i].duration--;

        // Remove the effect if the duration is 0
        if (entity.statusEffects[i].duration === 0) {

            // Count the number of other status effects with the same name
            let count = 0;

            // Go through the entity's status effects . . .
            for (let j = 0; j < entity.statusEffects.length; j++) {

                // We have more than one effect of the same name
                if (entity.statusEffects[j] !== null && entity.statusEffects[j].name === entity.statusEffects[i].name && i !== j)
                    count++;
            }

            // If this is the last effect that of the same name that is ending, send message to the player
            if (count === 1)
                message(entity.statusEffects[i].endMessage)

            // Remove the effect
            entity.statusEffects.splice(i, 1);

             // Adjust the index to account for the removed element
            i--;
        }
    }
}


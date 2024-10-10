
// These are examples of status effects
const typicalStatusEffects = [
    { name: "blind", startMessage: "the world turns black", applyMessage: "", endMessage: "you can see again", effect: "entity.sightRange=0", duration: "1d4" },
    { name: "confused", startMessage: "you are confused", applyMessage: "", endMessage: "you regain your senses", effect: "entity.randomMovement=1", duration: "1d4" },
    { name: "frozen", startMessage: "you feel frozen", applyMessage: "", endMessage: "you can move again", effect: "entity.actionPoints-=1d4", duration: "1d4" },
    { name: "petrified", startMessage: "you are petrified", applyMessage: "", endMessage: "you can move again", effect: "entity.actonPoints=0;acAdjustment=+10", duration: "1d4" },
    { name: "paralyzed", startMessage: "you are paralyzed", applyMessage: "", endMessage: "you can move again", effect: "entity.actionPoints=0", duration: "1d4" },
    { name: "poisoned", startMessage: "you are poisoned", applyMessage: "", endMessage: "you can move again", effect: "entity.deathTimer-=1", duration: "1d8" },
    { name: "sleeping", startMessage: "you fall asleep", applyMessage: "", endMessage: "you can wake up again", effect: "entity.actionPoints=0", duration: "1d4" },
    { name: "stunned", startMessage: "you are stunned", applyMessage: "", endMessage: "you can move again", effect: "entity.actionPoints=0;acAdjustment=10",duration: "1d4" },
    { name: "burning", startMessage: "you catch on fire", applyMessage: "", endMessage: "the fire goes out", effect: "entit.stat.hp-=1d4", duration: "1d4" },
    { name: "regeneration", startMessage: "you start healing", applyMessage: "", endMessage: "you stop healing", effect: "entit.stat.hp+=1d2", duration: "1d4" }
];


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
// 20% chance of changing the target to to a giant
// "if (1d100 > 20) { copyEntityTemplate("giant", target) }"
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
// isValidEffect(effect)
//
// Returns true if the effect is valid, false otherwise.
//
// Effects are an object with the following properties:
//
// name:             string - The name of the effect
// startMessage:     string - The message to display when the effect starts
// applyMessage:     string - The message to display everytime the effect is applied
// endMessage:       string - The message to display when the effect ends
// duration:         string/number - The duration of the effect
// effectExpression: string - The effect as a Javascript string
//==================================================================

// TODO: In actual practice, this might be too restrictive.  Maybe no applyMessage?

function isValidEffect(effect) {

    // Get the name of the function that called this function
    let callingFunc = isValidEffect.caller?.name || "unknown";

    // Check if the effect is null or undefined
    if (effect === null || effect === undefined) {
        console.log(`${callingFunc} was passed a null or undefined effect.`);
        return false;
    }
    

    // Check if the effect is an object
    if (typeof effect !== "object") {
        console.log(`${callingFunc} was passed a effect that isn't a object.`);
        return false;
    }

    // List of required properties effect object must have
    const requiredProperties = ["name", "startMessage", "applyMessage", "endMessage", "duration", "effectExpression"];

    // Loop through all the required properties
    for (let rp of requiredProperties) {

        // Check for null or undefined status or blank sub-properties
        if (effect[rp] === null || effect[rp] === undefined || effect[rp] === "") {
            console.log(`${callingFunc} passed a null or undefined status effect property or an empty string.`);
            return false;
        }

        // Durations can be a number or a string
        if (rp === "duration") {
            if (typeof effect[rp] != "string" && typeof effect[rp] != "number")
                console.log(`${callingFunc} passed a status effect property that isn't a number or string.`);
                return false;
        }

        // Everything else must be a string
        else if (typeof effect[rp] != "string") {
            console.log(`${callingFunc} passed a status effect property that isn't a string.`);
            return false;
        }
    }

    return true;
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

    // If the effect is an array, loop through it
    if (Array.isArray(effect)) {

        // Loop through the effect array
        for (let i = 0; i < effect.length; i++) {
            applySingleEffect(entity, effect[i]);
        }
        return;
    }

    else {
        // Apply the effect!
        result = evaluateEffectExpression(effect);
        console.log(`${entity.name} ${effect.applyMessage}`);
    }
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

        // Duration should be a string containing a hardcoded Javascript expression for dice rolls 
        case 'string':

            // Calculate the actual duration of the status effect instead of copying the string
            let result = parseInt(evaluateEffectExpression(statusEffect.duration));

            // If the parsed string is anything but a number, flag it as an error
            if (typeof result !== 'number') {
                console.log(`Invalid status effect duration: ${statusEffect.duration}`);
                return;
            }

            // Save the duration
            entity.statusEffects[n].duration = evaluateEffectExpression(statusEffect.duration);
            message(entity.statusEffects[n].startMessage);
            break;

        // It should only be a string, but we'll allow numbers as this makes the code more robust
        case 'number':
            entity.statusEffects[n].duration = Number(statusEffect.duration);
            message(entity.statusEffects[n].startMessage);
            break;

        default:
            console.log(`Invalid status effect duration: ${statusEffect.duration}`);
            break;
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


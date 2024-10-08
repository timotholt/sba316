// These are examples of status effects
const typicalStatusEffects = [
    { name: "blind", startMessage: "the world turns black", endMessage: "you can see again", effect1: "sightRange=0", duration: "1d4" },
    { name: "confused", startMessage: "you are confused", endMessage: "you regain your senses", effect1: "randmoMovement=1", duration: "1d4" },
    { name: "frozen", startMessage: "you feel frozen", endMessage: "you can move again", effect1: "actionPoints=0", duration: "1d4" },
    { name: "petrified", startMessage: "you are petrified", endMessage: "you can move again", effect1: "actonPoints=0", effect2: "acAdjustment=10", duration: "1d4" },
    { name: "paralyzed", startMessage: "you are paralyzed", endMessage: "you can move again", effect1: "actionPoints=0", duration: "1d4" },
    { name: "poisoned", startMessage: "you are poisoned", endMessage: "you can move again", effect1: "deathTimer--", duration: "1d4" },
    { name: "sleeping", startMessage: "you fall asleep", endMessage: "you can wake up again", effect1: "actionPoints=0", duration: "1d4" },
    { name: "stunned", startMessage: "you are stunned", endMessage: "you can move again", effect1: "actionPoints=0", effect2: "acAdjustment=10",duration: "1d4" },
    { name: "burning", startMessage: "you catch on fire", endMessage: "the fire goes out", effect1: "stat.hp-=1d4", duration: "1d4" },
    { name: "regeneration", startMessage: "you start healing", endMessage: "you stop healing", effect1: "stat.hp+=1d2", duration: "1d4" }
];

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

    // Check for null or undefined status effect properties
    if (statusEffect.name === null || statusEffect.name === undefined ||
        statusEffect.startMessage === null || statusEffect.startMessage === undefined ||
        statusEffect.endMessage === null || statusEffect.endMessage === undefined ||
        statusEffect.duration === null || statusEffect.duration === undefined) {
        console.log("attachStatusEffectToEntity() was passed a null or undefined status effect property.");
        return;
    }

    // If status effect isn't a valid object
    if (typeof statusEffect !== "object") {
        console.log("Status effect is not an object: " + statusEffect);
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
// applySingleStatusEffect()
//
// This can be a status effect that is part of entity or attached
// to another object (such as a ring of fire, etc)
//==================================================================

function applySingleStatusEffect(entity, statusEffect) {

    // Check if the entity exists
    if (entity === null || entity === undefined) {
        console.log("applySingleStatusEffect() was passed a null or undefined entity.");
        return;
    }

    // Check for null or undefined effect
    if (statusEffect === null || statusEffect === undefined || typeof statusEffect !== 'object') {
        console.log("applySingleStatusEffect() was passed a null or undefined status type or non-object.");
        return;
    }

    // Check for null or undefined statusEffects in entity
    if (entity.statusEffects === null || entity.statusEffects === undefined) {
        console.log("applySingleStatusEffect() entity.statusEffects is null or undefined.");
        return;
    }
    debugger;

    // Loop through all keys of type effectN and apply the effect
    for (let key in statusEffect) {

        // Find any keys that start with the name 'effect'
        if (key.startsWith("effect")) {

            // Get the value of the effect
            let value = statusEffect[key];

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

    // Check for null or undefined status effect
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

console.log(`hello world from sba316`);

// Get current window shape
const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;

// Create audio object for the main music played in the game
// const rescueMusic = new Audio(`./rescue.mp3`);
const rescueMusic = new Audio(`./topguntheme.mp3`);
const rescueVolume = 0.8;
rescueMusic.volume = rescueVolume;

// Create audio object for the victory music
const victoryMusic = new Audio(`./ff14-fanfare.mp3`);
const victoryVolume = 1.0;
victoryMusic.volume = victoryVolume;
let musicStarted = false;

//================================================
// Tom Cruise's cues
//================================================

// const cueManOverboard = new Audio(`./startrescue.mp3`);
const cueManOverboard = new Audio(``);
const cueManSpotted   = new Audio(`./manspotted.mp3`);
const cueManLost      = new Audio(`./crashsitelost.mp3`);
const cueManRescued   = new Audio(`./gooserescued.mp3`);
const cueMovingAway   = new Audio(`./farsonar.mp3`);
const cueMovingCloser = new Audio(`./closesonar.mp3`);

// force window to be a certain size
const gameHeight = 10;
const gameWidth = 40;

// # of entities (monsters / treasure) is based upon window size
const entityList = [];
let numEntities = (gameHeight * gameWidth) / 10;

// Current dungeon level
let dungeonLevel = 1;

// window.resizeTo(gameWidth, gameHeight);

// Map and map symbols
// const terrainMap = [gameWidth];
// const wave = `\u{A540}`;                    // Turbulent water
// const island = `\u{1FAA8}`;                 // Land / rocks
// const plane = `\u{2708}`;                   // Crash site
// const numIslands = 7;
// const numWaves = 10;

// To draw the ship and swimmer
// const man = `\u{1f3ca}`;                    // Man
// const ship = `\u{1F6A2}`;                   // The ship you drive around
// const swimmer = plane + man;                // Crash site
// const ring = `\u{1F6DF}`;                   // The life preserver
// const rescued = ship + ring + swimmer;      // Combination of all 3

// Random number
const randomInt = (max) => Math.floor(Math.random() * max); 
const randY = () => randomInt(gameHeight);
const randX = () => randomInt(gameWidth);

//===============================================================
// compareObjects()
//
// take 2 objects and make sure they have the same key/value pairs
//===============================================================

function compareObjects(o1, o2) {
    for(var p in o1){
        if(o1.hasOwnProperty(p)){
            if(o1[p] !== o2[p]){
                // debugger;
                return false;
            }
        }
    }
    for(var p in o2){
        if(o2.hasOwnProperty(p)){
            if(o1[p] !== o2[p]){
                // debugger;
                return false;
            }
        }
    }
    return true;
}

//===============================================================
// switchBuffer()
//
// To make updating the screen easier and not keep track of old
// positions, etc., we use double buffering.
//===============================================================

const hoverStyles = [
    "canMoveTo",
    "monsterInRange",
    "monsterOutOfRange",
    "treasure"
];

let onScreenBuffer = 0;
let offScreenBuffer = 1;

//Debug
// offScreenBuffer = 0;

function switchBuffer(buffer = -1) {

    switch (buffer) {

        // If not specified, switch to the other buffer
        case -1:
            if (buffer == -1) {
                let t = onScreenBuffer;
                onScreenBuffer = offScreenBuffer;
                offScreenBuffer = t;
            }
            break;

        // Switch to buffer 0
        case 0:
            onScreenBuffer = 0;
            offScreenBuffer = 1;
            break;

        // Switch to buffer 1
        case 1:
            onScreenBuffer = 1;
            offScreenBuffer = 0;
            break;
    }

    // Show the onScreen buffer
    let div = document.getElementById("buffer" + onScreenBuffer);
    div.style.display = "inline";

    // Hide the offscreen buffer
    div = document.getElementById("buffer" + offScreenBuffer);
    div.style.display = "none";

    // Erase the text of the offscreen and hover buffer
    for (let row = 0; row < gameHeight; row++)
        for (let col = 0; col < gameWidth; col++) {
            changeHTMLCellText(offScreenBuffer, row, col, '');

            // Remove all existing CSS hover styles
            for (let n = 0; n < hoverStyles.length; n++)
                removeCssStyleFromCell(offScreenBuffer, row, col, hoverStyles[n]);                
    }
}

//===============================================================
// calcCellId(buffer, y, x)
//
// returns: b###-r###-c### which we use as a name for a div.id
//
// for example:
//
// calcCellAddress(0, 8, 22)
//
// returns `b0-r8-c22`
//
// which we use as the <div id="b0-r8-c22" when we create a new
// <div> to represent a square on the map
//===============================================================

function calcCellId(buffer, row, col) {
    return (`b${buffer}-r${row}-c${col}`);
}

//===============================================================
// getDivByCellAddress(buffer, y, x)
//
// Given a address(buffer, y,x), get the appropriate div with the id
//
// for example:
//
// getDivByCellAddress(0, 2, 3)
//
// returns <div id='b0-r2-c3'>
//===============================================================

function getDivByCellAddress(buffer, row, col) {
    return (document.getElementById(calcCellId(buffer, row, col)));
}

//===============================================================
// changeHTMLCellText(buffer, row, col, text)
//
// Given an address(buffer, row, col), change the text of the div with the id
//===============================================================

function changeHTMLCellText(buffer, row, col, text) {
    getDivByCellAddress(buffer, row, col).innerHTML = text;
}

//===============================================================
// Add style of the div with the specified b/r/c
//===============================================================

function addCssStyleToCell(buffer, row, col, style) {
    let cell = getDivByCellAddress(buffer, row, col);
    cell.classList.add(style);
}

//===============================================================
// Remove style of the div with the specified b/r/c
//===============================================================

function removeCssStyleFromCell(buffer, row, col, style) {
    let cell = getDivByCellAddress(buffer, row, col);
    cell.classList.remove(style);
}

//===============================================================
// Game function: return a game entity from the virtual map
//===============================================================

function getEntityAtCell(row, col) {

    // Big mess!
    // if ((typeof row === 'string') || (typeof col === 'string'))
    //     debugger;

    for (let i = 0; i < entityList.length; i++)
        if ((Number(entityList[i].X) === Number(col)) && (Number(entityList[i].Y) === Number(row)))
            return (entityList[i]);
    return false;
}

// Remove the specified entity
// called when we pickup treasure or kill a monster

function destroyEntity(entity) {

    debugger;

    // Go through the list
    for (let i = 0; i < entityList.length; i++)
        if (entityList[i] === entity);
            entityList.splice(i,1);   
}

//===============================================================
// Game function: move an entity to the specified location
//===============================================================

function moveEntity(entity, Y, X) {

    console.log(`moving ${entity.name} from (${entity.Y},${entity.X}) to (${Y},${X})`);
    console.log(`lastXY = ${entity.lastX},${entity.lastY}`);

    // Erase old postion in the map
    // terrainMap[entity.Y][entity.X] = blank;

    // Move to new position in the map
    // terrainMap[Y][X] = entity;

    // Update entity location
    entity.lastX = entity.X;
    entity.lastY = entity.Y;
    entity.X = X;
    entity.Y = Y;
}

//===============================================================
// Distance between two points
//===============================================================

function distanceBetween(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    return Math.abs(Math.sqrt(deltaX * deltaX + deltaY * deltaY));
}

//===============================================================
// DrawEntityAbsolutely()
//
// Draw game entity regardless of player visibility distance
//===============================================================

function drawEntityAbsolutely(entity) {

    // console.log(`Drawing entity ${entity.name} at ${entity.Y} ${entity.X}`);
    changeHTMLCellText(offScreenBuffer, entity.Y, entity.X, entity.icon);
}

//===========================
//
// Level up
//===========================

const p = 0;


const xpChart = [
    1,      // level 1
    2,      // level 2
    3,      // level 3
    5,      // level 4
    7,      // level 5
    9,      // level 6
    12,     // level 7
    15,     // level 8
    18,     // level 9
    21,     // level 10
    99999999999,        // level 11+
];

// This is an empty spot on the board.  Empty spots 
const blank = {
    type: 'blank',
    name: 'blank',
    icon: '.',
    // entityVisible: false
}; // empty spot

const entityTemplates = [

    // Fighter
    {
        playerCharacter: false,
        characterClass: `human`,
        subClass: `fighter`,
        name: `fighter`,
        icon: `F`,

        startLevel: 1,
        currentLevel: 1,
        maxLevel: 10,

        startXp: 0,
        currentXp: 0,

        startHp: 10,
        currentHp: 10,
        maxHp: 10,
        maxHpPerLevel: 10,
        
        startSightRange: 2.24,
        currentSightRange: 2.24,
        maxSightRange: 100,
        
        attackType: `sword`,
        attackMessage: `swings a sword`,
        attackRange: 1.42,
        attackDamage: 10,

        startSkillPoints: 10,
        currentSkillPoints: 10,
        skillPointsPerLevel: 1,

        // Runtime stuff
        // entityVisible: false,

        // Gold
        gold: 0,
        goldMultiplier: 10,

        // Where entity is on the map
        X: -1,
        Y: -1,
        // lastSeenX: -1,
        // lastSeenY: -1,    
        lastX: -1,
        lastY: -1
    },
    
    // Wizard
    {
        playerCharacter: false,
        characterClass: `human`,
        subClass: `wizard`,
        name: `wizard`,
        icon: `w`,

        startLevel: 1,
        currentLevel: 1,
        maxLevel: 10,

        startXp: 0,
        currentXp: 0,

        startHp: 6,
        currentHp: 6,
        maxHp: 6,
        maxHpPerLevel: 6,
        
        startSightRange: 3,
        currentSightRange: 3,
        maxSightRange: 100,
        
        attackType: `magic missile`,
        attackMessage: `casts magic missiles`,
        attackRange: 3,
        attackDamage: 5,

        startSkillPoints: 10,
        currentSkillPoints: 10,
        skillPointsPerLevel: 1,

        // Runtime stuff
        // entityVisible: false,

        // Gold
        gold: 0,
        goldMultiplier: 10,

        // Where entity is on the map
        X: -1,
        Y: -1,
        // lastSeenX: -1,
        // lastSeenY: -1,    
        lastX: -1,
        lastY: -1
    },

    // Monster
    {
        playerCharacter: false,
        characterClass: `monster`,
        subClass: `goblin`,
        name: `goblin`,
        icon: `g`,

        startLevel: 1,
        currentLevel: 1,
        maxLevel: 10,

        startXp: 0,
        currentXp: 0,

        startHp: 10,
        currentHp: 10,
        maxHp: 10,
        maxHpPerLevel: 10,
        
        startSightRange: 3,
        currentSightRange: 3,
        maxSightRange: 100,
        
        attackType: `club`,
        attackMessage: `swings his club`,
        attackRange: 1.5,
        attackDamage: 5,

        startSkillPoints: 10,
        currentSkillPoints: 10,
        skillPointsPerLevel: 1,

        // Runtime stuff
        // entityVisible: false,

        // Gold
        gold: 0,
        goldMultiplier: 10,

        // Where entity is on the map
        X: -1,
        Y: -1,
        // lastSeenX: -1,
        // lastSeenY: -1,    
        lastX: -1,
        lastY: -1
    },

    // Treasure chest
    {
        playerCharacter: false,
        characterClass: `chest`,
        subClass: `treasure chest`,
        name: `treasure chest`,
        icon: `[$]`,

        startLevel: 1,
        currentLevel: 1,
        maxLevel: 10,

        startXp: 0,
        currentXp: 0,

        startHp: 10,
        currentHp: 5,
        maxHp: 5,
        maxHpPerLevel: 5,
        
        startSightRange: 3,
        currentSightRange: 3,
        maxSightRange: 100,
        
        attackType: `none`,
        attackMessage: `ERROR BAD ATTACK MESSAGE`,
        attackRange: 0,
        attackDamage: 0,

        startSkillPoints: 10,
        currentSkillPoints: 10,
        skillPointsPerLevel: 1,

        // Runtime stuff
        // entityVisible: false,

        // Gold
        gold: 0,
        goldMultiplier: 10,

        // Where entity is on the map
        X: -1,
        Y: -1,
        // lastSeenX: -1,
        // lastSeenY: -1,    
        lastX: -1,
        lastY: -1
    },

    // Gold
    {
        playerCharacter: false,
        characterClass: `gold`,
        subClass: `gold`,
        name: `gold`,
        icon: `$`,

        startLevel: 1,
        currentLevel: 1,
        maxLevel: 10,

        startXp: 0,
        currentXp: 0,

        startHp: 10,
        currentHp: 10,
        maxHp: 10000,
        maxHpPerLevel: 10,
        
        startSightRange: 3,
        currentSightRange: 3,
        maxSightRange: 100,
        
        attackType: `none`,
        attackMessage: `ERROR BAD ATTACK MESSAGE`,
        attackRange: 0,
        attackDamage: 0,

        startSkillPoints: 10,
        currentSkillPoints: 10,
        skillPointsPerLevel: 1,

        // Runtime stuff
        // entityVisible: false,

        // Gold
        gold: 0,
        goldMultiplier: 10,

        // Where entity is on the map
        X: -1,
        Y: -1,
        // lastSeenX: -1,
        // lastSeenY: -1,    
        lastX: -1,
        lastY: -1
    },

    // Portal down
    {
        playerCharacter: false,
        characterClass: `stairs`,
        subClass: `down`,
        name: `stairs down`,
        icon: `>`,

        startLevel: 1,
        currentLevel: 1,
        maxLevel: 10,

        startXp: 0,
        currentXp: 0,

        startHp: 10,
        currentHp: 10,
        maxHp: 10000,
        maxHpPerLevel: 10,
        
        startSightRange: 3,
        currentSightRange: 3,
        maxSightRange: 100,
        
        attackType: `none`,
        attackMessage: `ERROR BAD ATTACK MESSAGE`,
        attackRange: 0,
        attackDamage: 0,

        startSkillPoints: 10,
        currentSkillPoints: 10,
        skillPointsPerLevel: 1,

        // Runtime stuff
        // entityVisible: false,

        // Gold
        gold: 0,
        goldMultiplier: 0,

        // Where entity is on the map
        X: -1,
        Y: -1,
        // lastSeenX: -1,
        // lastSeenY: -1,    
        lastX: -1,
        lastY: -1
    }
];

//=======================================================
// make a new character from character class
//=======================================================

function newCharacter(character, characterClass) {

    // Search through all entity types
    for (let i = 0; i < entityTemplates.length; i++) {

        // If we found the correct class
        if (characterClass === entityTemplates.name)

        // Copy character from template
            character = entity;
    }
}

//=======================================================
// Entity gains level
//=======================================================

function entityGainsLevel(entity) {

    // Entity gains a level
    entity.level++;

    // Gain skill points to spend
    entity.currentSkillPoints += entity.skillPointsPerLevel;
    console.log(`${entity.name} reaches level ${entity.level} and gains ${entity.skillPointsPerLevel} skill points.`);
}

//=======================================================
//=======================================================

function xpToNextLevel(xp) {
    let i = 0;
    for (; xp >= xpChart[i]; i++)
        ;
    return xpChart[i];
}

//=======================================================
// Entity gains XP, check for level up
//=======================================================

function entityGainsXp(entity, xp) {

    // entity earns XP
    entity.xp += xp;

    // Calculate new level
    let newLevel = calcLevelFromXp(entity);
    
    // for every level gained, level it up!
    while (newLevel > entity.level) {

        // Gain a level
        gainLevel(entity);
    }
}

//=======================================================
// Calculate level from xp
//=======================================================

function calcLevelFromXp(entity) {
    for (let level = 1; entity.xp >= xpChart[level-1]; level++) {
    }
    return (level);
}

//=======================================================
// Entity attacks entity
//=======================================================

function entityAttacksEntity(attacker, defender) {

    // Make sure distance is in range
    if (distanceBetweenEntities(attacker, defender))

        // Subtract attacker's damage from hit points
        defender.hp -= attacker.attackDamage;

        // Let player know who attacks who
        console.log(`${attacker.name} ${attacker.attackMethod} ${defender.name}`);

        // Check for death
        if (defender.hp <= 0) {

            // Defender has died. Attacker gains XP from defeated entity
            let xpGained = defender.xpValue;
            gainXp(attacker, xpGained);

            console.log(`${defender.name} has ${defender.deathMessage} ${attacker.name}. ${attacker.name} gained ${xpGained}`); 

            // Defender icon changes to corpse %
            defender.entityType = 'corpse';
            defender.icon = `%`;
            defender.name = `corpse of ` + defender.name;
        }
}

//=======================================================
// DrawEntityFromPlayerPov
//=======================================================

// Draw the entity on the board, taking distance from the player into account
function drawEntityFromPlayerPov(entity) {

    // console.log(`drawing ${entity} = ${entity.name} at ${entity.Y},${entity.X}`);

    // if entity is invalid, skip it {
    if ((!entity) || (entity.X < 0) || (entity.Y < 0) || (!entity.icon)) {
        console.log(`Bad entity passed to drawEntityFromPlayerPov`);
        return;
    }

    let sr = playerCharacter().currentSightRange;
    let pc = playerCharacter();
    let d  = distanceBetweenEntities(pc, entity);

    // If the entity is in sight range of the player
    if (d <= sr) {

        // // if the entity was visible the last time we drew him, leave him there 
        // if (entity.entityVisible) {
        //     return;
        // }
        // Entity just became visible

        // changeHTMLCellText(offScreenBuffer, entity.Y, entity.X, terrainMap[entity.Y][entity.X].icon);
        changeHTMLCellText(offScreenBuffer, entity.Y, entity.X, entity.icon);

        if (musicStarted) {
            // Play man spotted
            // cueManSpotted.currentTime = 0;
            // cueManSpotted.play();                    
        }
    }

    // Otherwise player is too far away to see the entity
    else {
        changeHTMLCellText(offScreenBuffer, entity.Y, entity.X, " " // blank.icon
            );

            // console.log(`blank @ (y=${entity.Y}, x=${entity.X})`);
        // if (musicStarted) {
        //     // Play man spotted
        //     cueManLost.currentTime = 0;
        //     cueManLost.play();
        // }
    }
}

// Draw the entire game board
function drawBoard() {

    // Draw the game map
    for (let row = 0; row < gameHeight; row++)
        for (let col = 0; col < gameWidth; col++) {
            let e = getEntityAtCell(row, col);

            // If there is no entity there, draw a blank spot
            if (e === false) {
                blank.X = col;
                blank.Y = row;
                drawEntityFromPlayerPov(blank);
            }
        }

    // Draw all entities on the board
    drawAllEntities();

    // Update status area
    let statusArea = document.getElementById(`statusArea`);
    statusArea.innerHTML = `${playerCharacter().name}, a ${playerCharacter().characterClass} ${playerCharacter().subClass}. Level: ${playerCharacter().currentLevel}, HP: ${playerCharacter().currentHp}/${playerCharacter().maxHp}, Gold ${playerCharacter().gold}`;
}

// Redraw the screen
function drawAllEntities() {

    // Draw all entities other than the player
    for (let i = 1; i < entityList.length; i++) {
        // console.log(`drawing entity[${i}] = ${entityList[i].name}`)
        drawEntityFromPlayerPov(entityList[i]);
    }

    // Draw the player
    drawEntityAbsolutely(playerCharacter());
}

// math functions
function distanceBetween(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    return Math.abs(Math.sqrt(deltaX * deltaX + deltaY * deltaY));
}

// Distance between entities
function distanceBetweenEntities(entity1, entity2) {
    const deltaX = entity2.X - entity1.X;
    const deltaY = entity2.Y - entity1.Y;
    return Math.abs(Math.sqrt(deltaX * deltaX + deltaY * deltaY));
}

//=========================================================================
// updatePossibleTileActions()
//
// whent he player moves, we update the 'on hover' of all objects on the
// map.
//
// green = player can mvoe there
// orange = monster out of range of player's weapon
// red = monster in range of player's weapon
// yellow = treasure in range of player
// 
// Iterate over a collection of elements to acomplish some task (5%)
//=========================================================================

function updatePossibleTileActions() {

    // Iterate over each cell on the game map
    for (let y = 0; y < gameHeight; y++) {
        for (let x = 0; x < gameWidth; x++) {

            // If the square is within site range
            if (distanceBetween(x, y, playerCharacter().X, playerCharacter().Y) <= playerCharacter().currentSightRange) {
                // make the background lighter
                addCssStyleToCell(offScreenBuffer, y, x, "light");
            }
            else
            {
                removeCssStyleFromCell(offScreenBuffer, y, x, "light");
            }

            // If we are the same location as the player, skip it
            if (y === playerCharacter().Y && x === playerCharacter().X)
                continue; 

            // If square(x,y) is visible to the player
            if (distanceBetween(x, y, playerCharacter().X, playerCharacter().Y) <= playerCharacter().currentSightRange) {

                // See if there is an entity at that cell
                let e = getEntityAtCell(y, x);

                // If there is an entity at that square
                if (e) {
                    // Figure out what kind of entity is in that square
                    switch (e.characterClass) {

                        // Some kind of monster
                        case 'monster':
                        case 'human':

                            // if in range of weapon
                            if (distanceBetween(x, y, playerCharacter().X, playerCharacter().Y) <= playerCharacter().attackRange)
                                // we can attack it
                                addCssStyleToCell(offScreenBuffer, y, x, "monsterInRange");
                            else
                                // not in range, we can't attack
                                addCssStyleToCell(offScreenBuffer, y, x, "monsterOutOfRange");
                            break;

                        // Some kind of treasure
                        case 'chest':
                        case 'gold':
                        case 'corpose':
                            // gold is here
                            addCssStyleToCell(offScreenBuffer, y, x, "treasure");
                            break;

                        // empty spot
                        default:
                    }
                }
                else {
                    // If we can walk there... (one square away), add the canMoveTo style
                    if (distanceBetween(x, y, playerCharacter().X, playerCharacter().Y) < 1.42)
                        addCssStyleToCell(offScreenBuffer, y, x, "canMoveTo");
                }
            }
        }
    }
}

//=================================================
// About Click Handler
//=================================================

function aboutClickHandler(event) {

    // We handle all click events in this application
    event.stopPropagation();

    // Log the event we got clicked on
    // console.log(`Event target ID = ${event.target.id}`);

    // If event was the titleBar ...
    if (event.target.id === 'titleBar')

        // Popup about box
        window.alert(
            `Ascii Dungeon v0.01\n\n` +
            `An unfinished game.\n`
        );
} 

//=================================================
// Main Event handler
//=================================================

// Global so the other game loop can read it
let clickX = -1;
let clickY = -1;
let clickB = -1;

function mainClickHandler(event) {

    // We handle all click events in this application
    event.stopPropagation();

    // Log the event we got clicked on
    // console.log(`Event target ID = ${event.target.id}`);

    // If we got clicked, start the audio engine
    startAudioEngine();

    // Use regular expression to match the numbers
    const matched = event.target.id.match(/^b(\d+)-r(\d+)-c(\d+)$/);

    // If we matched, we clicked on a proper cell
    if (matched) {

        // Get individual addresses components and convert to number
        clickB = Number(matched[1]);
        clickY = Number(matched[2]);
        clickX = Number(matched[3]);

        // Debug
        console.log(`${event.target.id} (B ${clickB}, Y ${clickY}, X ${clickX}) was clicked:`, event);
    }
}

//=========================================
// Helper functions
//=========================================

function assignEntitySafeXY(entity, tryX = -1, tryY = -1) {

    let validLoc = false;

    do {
        // Roll up a random location, check if an entity exists at this y/x
        let x = (tryX >= 0) ? tryX : randX();
        let y = (tryY >= 0) ? tryY : randY();
        let e = getEntityAtCell(y, x);

        // See if there is an entity already at this X/y
        if (e !== false)
            continue;

        entity.X = entity.lastX = x;
        entity.Y = entity.lastY = y;
        console.log(`assigningEntity = ${entity.name}, y = ${entity.Y}, x = ${entity.X}`);
        validLoc = true;

    } while (!validLoc);
}

//=========================================
// initLevel()
//
// Place entities and player on map
//=========================================

function initLevel() {

    let placedStairs = false;

    // Populate the logical map with entities (monsters, treasure)
    // Skip entity #0 because that's the player
    for (let i = 1; i < numEntities; i++) {

        // Roll the dice to the type of entity
        let randomEntityType = randomInt(entityTemplates.length);

        // If it's stairs and we already put one down, re-roll
        if (entityTemplates[randomEntityType].characterClass === `stairs`) {

            // if we already have stairs on the map
            if (placedStairs) {
                i--;  // bump count down
                continue;
            }
            else placedStairs = true;
        }

        // Copy the template we rolled up to entity list
        entityList[i] = Object.assign({}, entityTemplates[randomEntityType]);

        // Give it a random location
        assignEntitySafeXY(entityList[i]);

        // Give it some gold
        entityList[i].gold += randomInt(dungeonLevel * entityList[i].goldMultiplier);

        // Assume it's not visible
        // entityList[i].entityVisible = false;
    }    

    // Keep trying to place the player on the board
    for (let validPlayerXY = false; !validPlayerXY; ) {
    
        // The player starts randomly at the edge of the board.  Randomly choose an edge:
        // 0 = top, 1 = right, 2 = bottom, 3 = right
        switch (randomInt(4)) {

            // Top row
            case 0: assignEntitySafeXY(playerCharacter(), -1, 0);
                console.log(`Player at top row`);
                validPlayerXY = true;
                break;

            // Right column
            case 1:
                assignEntitySafeXY(playerCharacter(), gameWidth - 1, -1);
                console.log(`Player at right column`); 
                validPlayerXY = true;
                break;

            // Bottom row
            case 2:
                assignEntitySafeXY(playerCharacter(), gameHeight - 1, -1);
                console.log(`Player at bottom row`);
                validPlayerXY = true; 
                break;

            // Left column
            case 3:
                assignEntitySafeXY(playerCharacter(), 0, -1)
                console.log(`Player at left column`); 
                validPlayerXY = true;
                break;
        }
    }    
}

//=================================================================
// message()
//
// The game has it's own console.  You output messages to the
// player here.  We use the ('pre') style so that \n works!
//=================================================================


//=================================================================
// messageText
//
// One super-long string that represents *every single thing* sent
// to the message area.
//
// This will eventually run out of memory but it works for this SBA
//=================================================================

let messageText = '';

function message() {

    const messageArea = document.getElementById(`messageArea`);

    // Best way to do it
    // const messageAreaSubDiv = document.getElementById('messageAreaSubDiv');

    // Do it for 5% of the grade
    const messageAreaSubDiv = messageArea.firstChild;

    // Grab all the arguments and convert it to one long string
    let s = '';
    for (i = 0; i < arguments.length; i++) {
        s += String(arguments[i]);
    }

    // Add string to the message area
    messageText += s + `\n`;
    messageAreaSubDiv.innerHTML = messageText;

    // Move the scroll bar to the bottom so we can see the most current message
    messageArea.scrollTop = messageArea.scrollHeight;
}

// Populate the screen by making divs and appending them over and over...
// This is 5% + 5% + 10% of the grade
function createHTMLBoard() {

    // Erase any existing children DIVs and cache node (5% of grade)
    const appDiv = document.querySelector(`#app`);
    appDiv.replaceChildren();

    // Add title bar
    const titleBar = document.createElement('div');
    titleBar.id = 'titleBar';
    titleBar.innerHTML = "ASCII Dungeon v0.01 (click here for about info)";

    // Make a clone of the title bar and append that for 2% of the grade
    // DELETE THESE 7 LINES IF NOT FOR SCHOOL (const clone .... else)
    const clone = titleBar.cloneNode();
    if (clone) {
        clone.id = 'titleBar';
        clone.innerHTML = "ASCII Dungeon v0.01 (click here for about info)";
        appDiv.appendChild(clone);
    }
    else

    appDiv.appendChild(titleBar);
    appDiv.addEventListener("click", aboutClickHandler);

    // Add a grid to hold the game board and the stat sheet
    const gameArea = document.createElement('div');
    gameArea.id = 'appArea';
    appDiv.appendChild(gameArea);

    // create two buffers that we can toggle between
    for (let buffer = 0; buffer < 2; buffer++) {

        // make one div per buffer
        const bufferDiv = document.createElement(`div`);
        bufferDiv.id = "buffer" + buffer;

        // First buffer is visible, second buffer is hidden
        bufferDiv.style.display = (buffer) ? "none" : "visible";
        
        // Make one div per board square
        for (let Y = 0; Y < gameHeight; Y++) {

            // Calulate the name of the Y
            let rowId = "row" + Y;

            // make a div for the cell (5% of grade)
            const rowElement = document.createElement(`div`);
            rowElement.id = rowId;
            rowElement.style.display = "grid";
            // console.log(rowElement.id);
            colString = ``;

            // Debug stuff
            // rowElement.style.backgroundcolor = "red";
            // rowElement.stylecolor = "white";
            // rowElement.innerHTML = rowId;

            // Make the columns
            for (let X = 0; X < gameWidth; X++) {
                colString += '1fr ';

                // 5% of grade
                const colElement = document.createElement(`div`);
                let cellId = "b" + buffer + "-r" + Y + "-c" + X;
                // console.log(cellId);

                colElement.className = 'dungeonCell';
                colElement.id = cellId;

                // Populate it with any entities
                // colElement.innerHTML = terrainMap[Y][X].icon;
                colElement.innerHTML = " "; // blank.icon;

                // console.log(`cellId [${Y}][${X}] = ${colElement.innerHTML}`);
                
                // Add new cell to the row
                rowElement.appendChild(colElement);
            }

            // Append the row to the buffer
            rowElement.id = rowId;
            rowElement.className = 'dungeonRow';
            rowElement.style.gridTemplateColumns = colString;
            bufferDiv.appendChild(rowElement);
        }

        // Append the buffer to the application area (5% of the grade)
        buffer.className = 'buffer';
        gameArea.appendChild(bufferDiv);
    }

    // Create status area
    {
        let statusArea = document.createElement(`pre`);
        statusArea.id = `statusArea`;
        gameArea.appendChild(statusArea);
    }

    // Create the message area
    {
        let messageArea = document.createElement(`div`);
        messageArea.id = 'messageArea';
        gameArea.appendChild(messageArea);
        let messageAreaSubDiv = document.createElement('pre');
        messageAreaSubDiv.id = 'messageAreaSubDiv';
        messageArea.appendChild(messageAreaSubDiv);
    }

    // Add mouse click event for the entire app
    appDiv.addEventListener("click", mainClickHandler);
}

// Get the entity that represents the character
function playerCharacter() {
    return (entityList[0]);
}

// TEMP: Player starts as a fighter
function initPlayerCharacter() {

    // Make player a fighter and visible
    entityList[0] = Object.assign({}, entityTemplates[0]);
    entityList[0].icon = '@';                                   // just like hack and nethack
    entityList[0].name = 'Man With No Name';
    entityList[0].gold = 0;
    entityList[0].goldMultiplier = 0;
    entityList[0].playerCharacter = true;

    // Return player entity
    return (entityList[0]);
}

// Init game state
function initGameState() {

    // Roll up the character
    initPlayerCharacter();

    // Create game board
    createHTMLBoard();

    // For proper audio cues
    lastDistance = 100000000000;

    // Start the music if the user already played a round
    if (musicStarted) {

        // Stop the victory music
        // victoryMusic.pause();
        victoryMusic.volume = 0;
        victoryMusic.currentTime = 0;
        victoryMusic.play();

        // Start the rescule music
        rescueMusic.currentTime = 0;
        rescueMusic.volume = rescueVolume;
        rescueMusic.play();

        // Play man overboard
        cueManOverboard.currentTime = 0;
        cueManOverboard.play();                    
    }

    // console.log(`Player Y/X = ${playerCharacter().Y} / ${playerCharacter().X}`);

    // drawShip();
    // drawSwimmer();
}

// Start audio if if it hasn't been started
function startAudioEngine() {
    if (musicStarted === false) {
        musicStarted = true;

        // Play man overboard
        cueManOverboard.currentTime = 0;
        cueManOverboard.play();            

        // Start the rescue music
        rescueMusic.currentTime = 0;
        rescueMusic.play();

        // Start the victory music at zero volume
        victoryMusic.volume = 0;
        victoryMusic.currentTime = 0;
        victoryMusic.play();
    }
}

// This is the main game loop
let gameLoopCount = 0;
let displayMessageOnGameLoopNum = -1;

function gameLoop() {

    // If player died
    if (playerCharacter().currentHp < 0) {
        window.alert(
            `Dungeon!\n\n` +
            `You were killed!.\n`
        );
    }

    // Check if mouse clicked
    if (clickX > -1 && clickY > -1) {

        // Log it
        // console.log(`user clicked (${clickY},${clickX})`);
        
        // If player clicked on himself, open character sheet
        if (clickX === playerCharacter().X && clickY === playerCharacter().Y) {

            // Open character sheet
            openCharacterSheet();

            // Reset user click buttons
            clickB = clickY = clickX = -1;
        }
        else {
            // if the player clicked on an entity
            let e = getEntityAtCell(clickY, clickX);
            if (e !== false) {
                console.log(`Entity clicked on = ${e.name}`);

                // Check entity types
                switch (e.characterClass) {

                    //====================================================================
                    // Clicked on gold
                    //====================================================================
                    case 'gold': {

                        // If we are in touching distance
                        if (distanceBetween(clickY, clickX, playerCharacter().Y, playerCharacter().X) <= 1.42) {

                            // Move gold to player
                            playerCharacter().gold += e.gold;
                            message(`You picked up ${e.gold} gold. You now have ${playerCharacter().gold}`);

                            // Delete entity
                            destroyEntity(e);

                            // Move player to spot
                            moveEntity(playerCharacter(), clickY, clickX);
                        }
                    }
                    break;

                    case 'treasure chest': {
                    }
                        break;
                    case 'monster':
                    case 'human': {
                        // Calculate attacker
                        // Calculate defender
                        // attacker attacks defender
                    }
                    break;

                    // Objects we haven't coded yet
                    default: {
                        message(`You clicked on a ${e.name} (${e.icon}), but the game doesn't allow interacting with a ${e.name} yet!`);
                    }
                    break;
                }
            }
            
            // If the cell is blank, try to move there
            else {

                // If the distance is < 1.5, try to move there
                if (distanceBetween(clickY, clickX, playerCharacter().Y, playerCharacter().X) <= 1.42) {

                    // Yes it did!
                    console.log(`${gameLoopCount}: player moved from (${playerCharacter().Y},${playerCharacter().X}) to (${clickY},${clickX}).`);

                    // Move there
                    moveEntity(playerCharacter(), clickY, clickX);
                }
            }
        }

        // Draw all entities
        drawBoard();
        updatePossibleTileActions();
        switchBuffer();

        // And reset click
        clickX = -1;
        clickY = -1;
    }

    // // Get the distance between the ship and the swimmer
    // let distance = distanceBetweenShipAndSwimmer();
    
    // // Check if the ship is in the same square as the swimmerwe rescued the swimmer
    // if (distance === 0) {

    //     console.log(`Same square as Goose!`);

    //     // Start a timer
    //     if (displayMessageOnGameLoopNum === -1) {
    //         displayMessageOnGameLoopNum = gameLoopCount + 100;
    //     }

    //     else if (gameLoopCount >= displayMessageOnGameLoopNum) {
    //         // Stop the rescue music
    //         // rescueMusic.pause();
    //         rescueMusic.volume = rescueVolume;
    //         rescueMusic.currentTime = 0;
    //         rescueMusic.play();

    //         // Start the victory music
    //         victoryMusic.currentTime = 0;
    //         victoryMusic.volume = victoryVolume;
    //         victoryMusic.play();

    //         // Play man rescued
    //         cueManRescued.currentTime = 0;
    //         cueManRescued.play();
    
    //         window.alert(`You have rescued aviator ${pilotName}!`);
    //         initGameState();
    //         window.requestAnimationFrame(gameLoop);
    //         displayMessageOnGameLoopNum = -1;
    //     }
    // }

    // else {

    //     // If the ship moved closer to the crash site
    //     if (distance < lastDistance) {
    //         if (musicStarted) {
    //             // we are getting closer
    //             volume = Math.max(1, (gameWidth - distance) / gameWidth) - 0.2;
    //             // console.log(`volume = ${volume}`);
    //             cueMovingCloser.volume = volume;
    //             cueMovingCloser.currentTime = 0;
    //             cueMovingCloser.play();
    //         }
    //         lastDistance = distance;
    //     }

    //     // If the ship moved away from the crash site
    //     else if (distance > lastDistance) {

    //         if (musicStarted) {
    //             // we are getting closer
    //             volume = Math.max(1, (gameWidth - distance) / gameWidth - 0.2);
    //             // console.log(`volume = ${volume}`);
    //             cueMovingAway.volume = volume;
    //             cueMovingAway.currentTime = 0;
    //             cueMovingAway.play();
    //         }
    //         lastDistance = distance;
    //     }
    // }

    // console.log(`Game loop: distance is ${distance}.  Ship (${shipY},${shipX}), swimmer (${swimmerY},${swimmerX})`);
    gameLoopCount++;
    window.requestAnimationFrame(gameLoop);
}

//==============================================
// characterSheet modal dialog box
//==============================================

// Get the modal
var csModal = document.getElementById("characterSheet");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("modalClose")[0];

// Save player character's info here temporarily
let tempCharacterSheet = {};    

//===========================
// HP and SP event listener
//===========================

function hpButtonHandler() {

    const _csMaxHp = document.getElementById(`csMaxHp`);
    const _csCurrentSkillPoints = document.getElementById('csCurrentSkillPoints');

    let cSp = Number(_csCurrentSkillPoints.innerHTML);
    let mHp = Number(_csMaxHp.innerHTML)

    // If we have skill points, drop the SP and bump the HP
    if (cSp > 0) {
        cSp--;
        mHp++;

        _csCurrentSkillPoints.innerHTML = cSp;
        _csMaxHp.innerHTML = mHp;
    }
}

function dmgButtonHandler() {

    const _csAttackDamage = document.getElementById(`csAttackDamage`);
    const _csCurrentSkillPoints = document.getElementById('csCurrentSkillPoints');

    let cSp = Number(_csCurrentSkillPoints.innerHTML);
    let aDmg = Number(_csAttackDamage.innerHTML)

    // If we have skill points, drop the SP and bump the HP
    if (cSp > 0) {
        cSp--;
        aDmg++;

        _csCurrentSkillPoints.innerHTML = cSp;
        _csAttackDamage.innerHTML = aDmg;
    }
}

// Save character sheet
function saveCharacterSheet() {
    entityList[0] = Object.assign({}, tempCharacterSheet);
}

// Check if character sheet changed
function isCharacterSheetChanged() {
    let identical = compareObjects(playerCharacter(), tempCharacterSheet);
    return (!identical);
}

function populateCharacterSheet() {

    // Copy character sheet to temporary one
    tempCharacterSheet = Object.assign({}, playerCharacter());

    // Fill in fields into form
    const _csInputCharacterName = document.getElementById(`csInputCharacterName`);
    _csInputCharacterName.value = tempCharacterSheet.name;
    const _csMaxHp = document.getElementById(`csMaxHp`);
    _csMaxHp.innerHTML = Number(tempCharacterSheet.maxHp);
    const _csAttackDamage = document.getElementById(`csAttackDamage`);
    _csAttackDamage.innerHTML = Number(tempCharacterSheet.attackDamage);

    // Read only
    const _csCurrentLevel = document.getElementById(`csCurrentLevel`);
    _csCurrentLevel.innerHTML = Number(tempCharacterSheet.currentLevel);
    const _csCurrentXp = document.getElementById(`csCurrentXp`);
    _csCurrentXp.innerHTML = Number(tempCharacterSheet.currentXp);
    const _csNextLevelXp = document.getElementById(`csNextLevelXp`);
    _csNextLevelXp.innerHTML = Number(xpToNextLevel(tempCharacterSheet.currentXp));

    // Read only
    const _csCurrentSkillPoints = document.getElementById(`csCurrentSkillPoints`);
    _csCurrentSkillPoints.innerHTML = Number(tempCharacterSheet.currentSkillPoints);
}

function validateCharacterSheet() {

    // DOM validation goes here.  If character name is invalid, return
    const _csInputCharacterName = document.getElementById(`csInputCharacterName`);
    if (_csInputCharacterName.checkValidity() === false)
        return (false);

    // Save fields into temporary character sheet
    tempCharacterSheet.name = _csInputCharacterName.value;

    const _csMaxHp = document.getElementById(`csMaxHp`);
    tempCharacterSheet.maxHp = Number(_csMaxHp.innerHTML);
    const _csAttackDamage = document.getElementById(`csAttackDamage`);
    tempCharacterSheet.attackDamage = Number(_csAttackDamage.innerHTML);

    // Save off skill points
    const _csCurrentSkillPoints = document.getElementById(`csCurrentSkillPoints`);
    tempCharacterSheet.currentSkillPoints = Number(_csCurrentSkillPoints.innerHTML);

    return (true);
}

function openCharacterSheet() {

    // Populate the form with values from the game
    populateCharacterSheet();

    // Open character sheet
    csModal.style.display = "block";
}

//====================================================
// DOM validation goes here
//====================================================

function checkCsForChangesAndSaveAccordingly() {

    // Load temp character sheet from form
    if (validateCharacterSheet() === false) {
        message(`Bad character name, character sheet canceled. (DOM validation failed).`)
        return (false);        
    }

    // If character sheet changed, prompt user
    if (isCharacterSheetChanged()) {
        let result = window.confirm(`Save changes?`);
        if (result) {
            saveCharacterSheet();
            message(`Changes to character sheet saved.`);
        } else {
            message(`Changes to character sheet canceled.`);
        }
    }
    return (true);
}

//========================================================
// Close modal method 1:
//
// When the user clicks on <span> (x), close the modal
//========================================================

span.onclick = function() {
    checkCsForChangesAndSaveAccordingly();
    csModal.style.display = "none";
}

//========================================================
// Close modal method 2:
//
// When the user clicks anywhere outside of the modal, close it
//========================================================

window.onclick = function(event) {
    if (event.target === csModal) {
        checkCsForChangesAndSaveAccordingly();
        csModal.style.display = "none";
    }
}

//========================================================
// initGameState() can be called only once
//========================================================
// Choose character class
initGameState();

// // Show the instructions
window.alert(
    `ASCII Dungeon!\n\n` +
    `An unfinished adventure game.\n\n` +
    `The first step is to look over your character and spend your skill points.\n`
);

// Open character sheet
openCharacterSheet();

// Start game
message(`Welcome to ASCII Dungeon\n`);
message(`Your character, ${playerCharacter().name}, is a ${playerCharacter().characterClass} ${playerCharacter().subClass}.`);
message(`You are level ${playerCharacter().currentLevel}, starting with ${playerCharacter().currentHp} hit points, and gain ${playerCharacter().maxHpPerLevel} hp per level.`);
message(`You currently have ${playerCharacter().currentSkillPoints} skill points to spend, and gain ${playerCharacter().skillPointsPerLevel} skill point(s) per level.`);

message(`The game has generated ${numEntities} entities and placed them randomly in the dungeon.`);
message(`You are represented by the @ symbol on the map. You can move to any green square with your mouse.\n`);
message(`Your torch illuminates ${Math.floor(playerCharacter().currentSightRange, 0)} squares around you, allowing you to see in the darkness around you.`);
message(`The illuminated area is represented by the gray area on the map. Monsters and treasure lurk in the shadows.\n`);

message(`Click on yourself (@) to open your character sheet to change your name and spend skill points.\n`);

//========================================================
// () can be called over and over
//========================================================
initLevel();

// Draw all entities
drawBoard();
updatePossibleTileActions();
switchBuffer();

// Start the game loop
window.requestAnimationFrame(gameLoop);

// We never get here
console.log(`goodbye world from sba316`);

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

const cueManOverboard = new Audio(`./startrescue.mp3`);
const cueManSpotted   = new Audio(`./crashsitespotted.mp3`);
const cueManLost      = new Audio(`./crashsitelost.mp3`);
const cueManRescued   = new Audio(`./gooserescued.mp3`);
const cueMovingAway   = new Audio(`./farsonar.mp3`);
const cueMovingCloser = new Audio(`./closesonar.mp3`);

// force window to be a certain size
let gameHeight = 10;
let gameWidth = 10;
window.resizeTo(gameWidth, gameHeight);

// Map and map symbols
const terrainMap = [gameWidth];
const wave = `\u{A540}`;                    // Turbulent water
const island = `\u{1FAA8}`;                 // Land / rocks
const plane = `\u{2708}`;                   // Crash site
const numIslands = 7;
const numWaves = 10;

// To draw the ship and swimmer
const man = `\u{1f3ca}`;                    // Man
const ship = `\u{1F6A2}`;                   // The ship you drive around
const swimmer = plane + man;                // Crash site
const ring = `\u{1F6DF}`;                   // The life preserver
const rescued = ship + ring + swimmer;      // Combination of all 3

// Random number
const randomInt = (max) => Math.floor(Math.random() * max); 
const randY = () => randomInt(gameHeight);
const randX = () => randomInt(gameWidth);

// Distance from ship to crash site
const distanceOnTop = 0;          // Ship on top of the swimmer
const distanceIsClose = 3;        // <= 3 is close
const distanceIsMedium = 6;       // <= 5 is medium

// Starting coords of ship and swimmer
let shipY = 0;
let shipX = 0;
let swimmerY = gameHeight - 1;
let swimmerX = gameWidth - 1;

// 
function calcCellAddress(Y, X) {
    return (`r${Y}-c${X}`);
}

function getDivByCellAddress(Y, X) {
    return (document.getElementById(calcCellAddress(Y, X)));
}

// Change the text of the div with the specified Y/X
function changeHTMLCellText(Y, X, text) {
    getDivByCellAddress(Y, X).innerHTML = text;
}

// Add style of the div with the specified Y/X
function addStyleToCell(Y, X, style) {
    let cell = getDivByCellAddress(Y, X);
    cell.classList.add(style);
}

// Remove style of the div with the specified Y/X
function removeStyleFromCell(Y, X, style) {
    let cell = getDivByCellAddress(Y, X);
    cell.classList.remove(style);
}

function getEntityAtCell(Y, X) {
    return (terrainMap[Y][X]);
}

function moveEntity(entity, Y, X) {

    console.log(`moving ${entity.name} from (${entity.Y},${entity.X}) to (${Y},${X})`);
    console.log(`lastXY = ${entity.lastX},${entity.lastY}`);

    // Erase old postion in the map
    terrainMap[entity.Y][entity.X] = blank;

    // Move to new position in the map
    terrainMap[Y][X] = entity;

    // Update entity location
    entity.lastX = entity.X;
    entity.lastY = entity.Y;
    entity.X = X;
    entity.Y = Y;
}

// Distance between row/col
function distanceBetween(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    
    return Math.abs(Math.sqrt(deltaX * deltaX + deltaY * deltaY));
}

// Draw staticEntity()
//
// Draw stuff regardless of player view distance
function drawEntityAbsolutely(entity) {

    // If the entity has different coordinates from what we last drew it at...
    if ((entity.lastSeenY !== entity.Y) || (entity.lastSeenX !== entity.X)) {

        // Remove old entity location if the old location is valid (not -1)
        if (entity.lastSeenY >= 0 && entity.lastSeenX >= 0) {
            // console.log(`Erasing old ship location because it was last drawn at ${lastDrawnShipY} ${lastDrawnShipX}`);
            // console.log(`calling change text with lastDrawnShipY = ${lastDrawnShipY} lastDrawnShipX = ${lastDrawnShipX} ${blank}`);
            changeHTMLCellText(entity.lastSeenY, entity.lastSeenX, blank.icon);
            // changeHTMLCellText(lastDrawnShipY, lastDrawnShipX, terrainMap[lastDrawnShipY][lastDrawnShipX] + blank);
        };

        // Drawing the entity at new spot
        // console.log(`Drawing entity ${entity.name} at ${entity.Y} ${entity.X}`);

        changeHTMLCellText(entity.Y, entity.X, entity.icon);
        entity.lastSeenY = entity.Y;
        entity.lastSeenX = entity.X;
    }
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
    name: 'blank',
    icon: '.',
    entityVisible: false
}; // empty spot

const entityTemplates = [

    // Fighter
    {
        name: `fighter`,
        icon: `F`,

        startLevel: 1,
        currentLevel: 1,
        maxLevel: 10,

        startXp: 0,
        currentXp: 0,

        startHp: 10,
        currentHp: 10,
        maxHp: 10000,
        
        startSightRange: 3,
        currentSightRange: 3,
        maxSightRange: 100,
        
        attackType: `sword`,
        attackMessage: `swings a sword`,
        attackRange: 1,
        attackDamage: 10,

        startSkillPoints: 10,
        currentSkillPoints: 10,
        skillPointsPerLevel: 1,

        // Runtime stuff
        entityVisible: false,

        // Where entity is on the map
        X: -1,
        Y: -1,
        lastSeenX: -1,
        lastSeenY: -1,    
        lastX: -1,
        lastY: -1
    },
    
    // Wizard
    {
        name: `wizard`,
        icon: `w`,

        startLevel: 1,
        currentLevel: 1,
        maxLevel: 10,

        startXp: 0,
        currentXp: 0,

        startHp: 6,
        currentHp: 6,
        maxHp: 10000,
        
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
        entityVisible: false,

        // Where entity is on the map
        X: -1,
        Y: -1,
        lastSeenX: -1,
        lastSeenY: -1,    
        lastX: -1,
        lastY: -1
    },

    // Monster
    {
        name: `goblin`,
        icon: `g`,

        startLevel: 1,
        currentLevel: 1,
        maxLevel: 10,

        startXp: 0,
        currentXp: 0,

        startHp: 10,
        currentHp: 10,
        maxHp: 10000,
        
        startSightRange: 3,
        currentSightRange: 3,
        maxSightRange: 100,
        
        attackType: `club`,
        attackMessage: `swings his club`,
        attackRange: 1,
        attackDamage: 5,

        startSkillPoints: 10,
        currentSkillPoints: 10,
        skillPointsPerLevel: 1,

        // Runtime stuff
        entityVisible: false,

        // Where entity is on the map
        X: -1,
        Y: -1,
        lastSeenX: -1,
        lastSeenY: -1,    
        lastX: -1,
        lastY: -1
    },

    // Treasure chest
    {
        name: `treasure chest`,
        icon: `$`,

        startLevel: 1,
        currentLevel: 1,
        maxLevel: 10,

        startXp: 0,
        currentXp: 0,

        startHp: 10,
        currentHp: 10,
        maxHp: 10000,
        
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
        entityVisible: false,

        // Where entity is on the map
        X: -1,
        Y: -1,
        lastSeenX: -1,
        lastSeenY: -1,    
        lastX: -1,
        lastY: -1
    }    
];

//=======================================================
// make a new character from character class
//=======================================================

function newCharacter(character, charClass) {

    // Search through all entity types
    for (let i = 0; i < entityTemplates.length; i++) {

        // If we found the correct class
        if (charClass === entityTemplates.name)

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
    entity.skillPoints += entity.skillPointsPerLevel;
    console.log(`${entity.name} reaches level ${enity.level} and gains ${entity.skillPointsPerLevel}`);
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

        // Subtract attacker's strength from hit points
        defender.hp -= attacker.strength;

        // Let player know who attacks who
        console.log(`${attacker.name} ${attacker.attackMethod} ${defender.name}`);

        // Check for death
        if (defender.hp <= 0) {

            // Defender has died. Attacker gains XP from defeated entitiy
            let xpGained = defender.xpValue;
            gainXp(attacker, xpGained);

            console.log(`${defender.name} has ${defender.deathMessage} ${attacker.name}. ${attacker.name} gained ${xpGained}`); 
        }
}

//=======================================================
// Draw entity
//=======================================================

// Draw the entity on the board, taking distance from the player into account
function drawEntity(entity) {

    // console.log(`drawing ${entity} = ${entity.name}`)

    let sr = playerCharacter().currentSightRange;
    let e1 = playerCharacter();
    let e2 = entity;

    if (distanceBetweenEntities(e1, e2) <= sr) {

        // if the entity was visible the last time we drew him, leave him there 
        if (entity.entityVisible) {
            return;
        }

        // Entit just became visible
        changeHTMLCellText(entity.Y, entity.X, terrainMap[entity.Y][entity.X].icon);

        // console.log(`2. Drawing swimmer at ${lastDrawnSwimmerY} ${lastDrawnSwimmerX}`);
        entity.lastSeenX     = entity.X;
        entity.lastSeenY     = entity.Y;
        entity.entityVisible = true;

        if (musicStarted) {
            // Play man spotted
            cueManSpotted.currentTime = 0;
            cueManSpotted.play();                    
        }
    }

    // Otherwise player is too far away to see the entity
    else {

        // If the entity was last visible, hide him
        if (entity.entityVisible) {
            // console.log(`3. Erasing old entity location because it was last drawn at ${entity.lastSeenY} ${entity.lastSeenX}`);
            // changeHTMLCellText(lastDrawnSwimmerY, lastDrawnSwimmerX, terrainMap[lastDrawnSwimmerY][lastDrawnSwimmerX] + blank);
            changeHTMLCellText(entity.lastSeenY, entity.lastSeenX, blank.icon
            );
            entity.lastSeenY = entity.Y;
            entity.lastSeenX = entity.X;
            entity.entityVisible = false;

            // Play man spotted
            cueManLost.currentTime = 0;
            cueManLost.play();
        }
    }
}

// Redraw the screen
function drawAllEntities() {

    // Draw the player
    drawEntityAbsolutely(playerCharacter());

    // Draw all entities
    for (let i = 1; i < entityList.length; i++) {
        // console.log(`drawing entity[${i}] = ${entityList[i].name}`)
        drawEntity(entityList[i]);
    }
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

function updateHoverMap() {
    for (let y = 0; y < gameHeight; y++)
        for (let x = 0; x < gameWidth; x++) {

            // Remove any hover elements
            removeStyleFromCell(y, x, "canMoveTo");

            // If we can walk there... (one square away)
            if (distanceBetween(x, y, playerCharacter().X, playerCharacter().Y) <= 1.5)
                addStyleToCell(y, x, "canMoveTo");
        }
}

//=================================================
// Event handler
//=================================================
let clickX = -1;
let clickY = -1;

function handleClick(event) {

    // We handle all click events in this application
    event.stopPropagation();
    console.log(`Event target ID = ${event.target.id}`);

    // If we got clicked, start the audio engine
    startAudioEngine();

    // Skip events that are useless to us
    if (event.target.id === `app`)
        return;

    // Skip rows
    if (event.target.id.substring(0, 3) === `row`)
        return;

    // If the target cell without a Y/X, skip it
    // Get the cell Y and Xumn that was clicked
    let indexX = event.target.id.indexOf(`c`);
    clickY = event.target.id.substring(1, indexX-1);
    clickX = event.target.id.substring(indexX+1);

    // debug
    console.log(`${event.target.id} (Y ${clickY}, X ${clickX}) was clicked:`, event);

}

//=========================================
//=========================================

function createLogicalGameBoard() {

    // Helper functions
    function assignEntitySafeXY(entity, tryX = -1, tryY = -1) {

        for (let validLoc = false; !validLoc; ) {

            let x = (tryX >= 0) ? tryX : randX();
            let y = (tryY >= 0) ? tryY : randY();

            // If it's empty...
            if (terrainMap[y][x] === blank) {
                terrainMap[y][x] = entity;
                entity.X = entity.lastX = x;
                entity.Y = entity.lastY = y;
                
                console.log(`assigningEntity = ${entity.name}, y = ${y}, x = ${x}`);
                validLoc = true;
            }
        }
    }
    function makeBlankMap() {
        // Make a blank map
        for (let Y = 0; Y < gameHeight; Y++) {
            terrainMap[Y] = [];
            for (let X = 0; X < gameWidth; X++) {
                terrainMap[Y][X] = blank;
            }
        }
    }

    // Build a map full of blank objects
    makeBlankMap();

    // Create the player character
    initPlayerCharacter();

    // Populate the logical map with entities (monsters, treasure)
    // Skip entity #0 because that's the player
    for (let i = 1; i < numEntities; i++) {

        // Roll the dice to the type of entity
        let randomEntityType = randomInt(entityTemplates.length);

        // Copy the template we rolled up to entity list
        entityList[i] = Object.assign({}, entityTemplates[randomEntityType]);

        // Give it a random location
        assignEntitySafeXY(entityList[i]);

        // Assume it's not visible
        entityList[i].entityVisible = false;
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

// Pouplate the map with rocks and waves
function createHTMLBoard() {

    // Erase any existing children DIVs
    const appDiv = document.getElementById(`app`);
    appDiv.replaceChildren();

    // Make one div per board square
    for (let Y = 0; Y < gameHeight; Y++) {

        // Calulate the name of the Y
        let rowId = "row" + Y;

        // make a div for the Y
        const rowElement = document.createElement(`div`);
        rowElement.id = rowId;
        rowElement.style.display = "grid";
        rowElement.style.height = "5em";
        // console.log(rowElement.id);
        colString = ``;

        // Debug stuff
        // rowElement.style.backgroundcolor = "red";
        // rowElement.stylecolor = "white";
        // rowElement.innerHTML = rowId;

        // Make the columns
        for (let X = 0; X < gameWidth; X++) {
            colString += '1fr ';

            const colElement = document.createElement(`div`);
            let cellId = "r" + Y + "-c" + X;
            // console.log(cellId);

            colElement.className = 'cell';
            colElement.id = cellId;
//            colElement.innerHTML = cellId;

            // Populate it with any entities
            // colElement.innerHTML = terrainMap[Y][X].icon;
            colElement.innerHTML = blank.icon;

            // console.log(`cellId [${Y}][${X}] = ${colElement.innerHTML}`);
            
            // Add new cell to the row
            rowElement.appendChild(colElement);
        }
        
        // Add the Y to the screen
        rowElement.id = rowId;
        rowElement.className = 'row';
        rowElement.style.gridTemplateColumns = colString;
        appDiv.appendChild(rowElement);
    }

    // Add mouse click event for the entire app
    appDiv.addEventListener("click", handleClick);

    const YElement = document.createElement(`div`);
}

let lastDistance = 100000000000;

// Objects in the world
const entityList = [];
const numEntities = (gameHeight * gameHeight) / 10;

function playerCharacter() {
    return (entityList[0]);
}

function movePlayerTo(x, y) {
}

// TEMP: Player starts as a fighter
function initPlayerCharacter() {

    // Make player a fighter and visible
    entityList[0] = Object.assign({}, entityTemplates[0]);
    entityList[0].entityVisible = true;
    entityList[0].icon = '@';                                   // just like hack and nethack
    entityList[0].name = 'Player';

    // Return player entity
    return (entityList[0]);
}

// Init game state
function initGameState() {

    // Roll up the character
    initPlayerCharacter();

    // Create game board
    createLogicalGameBoard();
    createHTMLBoard();
    drawAllEntities();

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
    if (clickX > -1 || clickY > -1) {

        // Log it
        console.log(`user clicked (${clickX},${clickY})`);

        // if the player clicked on an entity
        let e = getEntityAtCell(clickY, clickX);
        console.log(`entity clicked on = ${e.name}`);

        // If the cell is blank, try to move there
        if (e === blank) {

            // If the distance is < 1.5, try to move there
            if (distanceBetween(clickY, clickX, playerCharacter().Y, playerCharacter().X) <= 1.5) {

                // Yes it did!
                console.log(`${gameLoopCount}: player moved from (${playerCharacter().Y},${playerCharacter().X}) to (${clickY},${clickX}).`);

                // Move there
                moveEntity(playerCharacter(), clickY, clickX);
            }
        }

        // User clicked on entity
        else {
            switch (e.name) {
                case 'treasure chest': {

                }
                    break;
                case 'monster': {
                    // Calculate attacker
                    // Calculate defender
                    // attacker attacks defender
                    break;
                }
            }
        }

        // Draw all entities
        drawAllEntities();
        updateHoverMap();

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

//=============================

initGameState();


// Choose character class

// 

// Draw the ship only
// drawShip(shipY, shipX);
// drawSwimmer(swimmerY, swimmerX);

// // Show the instructions
window.alert(
    `Dungeon!\n\n` +
    `.\n\n` +
    `Click a box to move your character ${playerCharacter().icon} through the dangerous lands.\n`
);

window.alert(
    `Dungeon!\n\n` +
    `Note: You can only move one square at a time, and you can't enter rough` +
    `water ${wave} or rocks ${island}. Steer around them.\n\n`
);

// Get character's name
let characterName = null;
while ((characterName === null) || characterName.length <= 0) {
    characterName = prompt("What's your character's name?", "Conan");

    if ((characterName === null) || characterName.length <= 0)
        window.alert("Character name can't be blank!");
}
// Assign character name
playerCharacter().name = characterName;

// Start the game
window.requestAnimationFrame(gameLoop);

console.log(`goodbye world from sba316.2.1`);

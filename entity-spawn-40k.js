// Define symbols for entity types
const ENTITY_TYPE_CHARACTER = Symbol('character');      // Player or non-player character, has a input device 
const ENTITY_TYPE_OBJECT    = Symbol('object');         // Object we can pickup or drop
const ENTITY_TYPE_MONSTER   = Symbol('monster');        // Monster
const ENTITY_TYPE_TERRAIN   = Symbol('terrain');        // Terrain (doors, stairs, walls)
const ENTITY_TYPE_CONTAINER = Symbol('container');      // Container
const ENTITY_TYPE_GOLD      = Symbol('gold');           // Gold

// Tier 1
const ENTITY_MONSTER_SUBTYPE_CULTIST   = Symbol('mCultist');                        // Trash
const ENTITY_MONSTER_SUBTYPE_FOLLOWER  = Symbol('mFollower');                       // Trash
const ENTITY_MONSTER_SUBTYPE_GOBLIN    = Symbols('mBandits');                       // Trash

// Tier 2
const ENTITY_MONSTER_SUBTYPE_GUARDSMAN = Symbol('mGuardsman');
const ENTITY_MONSTER_SUBTYPE_SM_ASPIRANT = Symbol('mSmAspirant');                   // Pre-Scouts

// Tier 3
const ENTITY_MONSTER_SUBTYPE_SPACE_MARINE_SCOUT = Symbol('mSpaceMarineScout');      // Scouts
const ENTITY_MONSTER_SUBTYPE_ELDAR_ = Symbol('mEldarBasic');
const ENTITY_MONSTER_SUBTYPE_ORC = Symbol('mOrc');

// Tier 4
const ENITTY_MONSTER_SUBTYPE_CHAOS_MARINE  = Symbol('mChaosMarine');
const ENTITY_MONSTER_SUBTYPE_SM_TACTICAL   = Symbol('mSmTactical');                 // Battle Brothers
const ENTITY_MONSTER_SUBTYPE_SM_DEVASTATOR = Symbol('mSmDevastator');               // Battle Brothers
const ENTITY_MONSTER_SUBTYPE_SM_ASSAULT    = Symbol('mSmAssault');                  // Battle Brothers
const ENTITY_MONSTER_SUBTYPE_SM_APOTHECARY = Symbol('mSmApothecary');
const ENTITY_MONSTER_SUBTYPE_SM_TECHMARINE = Symbol('mSmTechmarine');

// Tier 5
const ENTITY_MONSTER_SUBTYPE_SM_LIBRARIAN  = Symbol('mSmSergeant');
const ENITIY_MONSTER_SUBTYPE_SM_CHAPLAIN   = Symbol('mSmChaplain');

// Tier 6
const ENITIY_MONSTER_SUBTYPE_SM_LIEUTENANT = Symbol('mSmLieutenant');

// Tier 7
const ENTITY_MONSTER_SUBTYPE_SM_CAPTAIN    = Symbol('mSmCaptain');
const ENTITY_MONSTER_SUBTYPE_SM_TERMINATOR = Symbol('mSmTerminator');

// Tier 8
const ENTITY_MONSTER_SUBTYPE_SM_TERMINATOR_CAPTAIN = Symbol('mSmTerminatorCaptain');

// Tier 9
const ENTITY_MONSTER_SUBTYPE_SM_CHAPTERMASTER = Symbol('mSmChapterMaster');

// Tier 10
const ENTITY_MONSTER_SUBTYPE_SPACE_MARINE_DREADNAUGHT = Symbol('mSmDreadnaught');





spawnTable = [
    {
        level: 1,
        type: ENTITY_TYPE_MONSTER: 
    }
]

entitySpawnType(dungeonLevel, type)
{
}

entitySpawn(dungeonLevel)
{    
}

spawnSquad()
{
}



// information we need:
//
// dungeon level
// what monsters spawn there
//
// when monsters spawn, how dungeon level contributes to the stats and abilities of a monster
//


// Each monster has a 100 item list of what it can drop (many duplicates of course)
// everytime something is dropped, it is removed from the list 
//
// Let's say an orc grunt has 
// 30% / 100% - nothing
// 15% / 100% - weapon
// 15% / 100% - shield
// 10% / 100% - armor 
// 10% / 100% - accessory
// 10% / 100% - magic item
// 10% / 100% - game item
//
// If so, all monsters of that specific type (orc grunt) share one loot table.
//
//

// Loot table for orc grunt
const orcGruntLootTable = [
    { chance: 30, item: ENTITY_NONE },
    { chance: 15, item: ENTITY_WEAPON },
    { chance: 15, item: ENTITY_SHIELD },
    { chance: 10, item: ENTITY_ARMOR },
    { chance: 10, item: ENTITY_ACCESSORY },
    { chance: 10, item: ENTITY_CONSUMEABLE },
    { chance: 10, item: ENTITY_GAMEITEM }
];

// Build shared loot shared for all Orc Grunts
function buildLootPool(lootTable)
{
    let result = [];

    // Go through the loot table
    for (loot in lootTable) {

        // Add each item n times to the loot pool, in this case our pool will be 100 items long
        for (let i = 0; i < loot.chance; i++)
            result.push(loot);
    }

    // Then shuffle the pool
    return (shuffle(result));
}

function generateLoot(lootPool, lootTable)
{
    // If the loot pool is empty, rebuild it
    if (Array.isArray(lootPool) && !lootPool)
        lootPool = buildLootPool(lootTable);

    // Remove the last item from the pool
    let itemToGenerate = lootPool.pop;
}

//
import Uuid from './uuid.js'
import Location from './location.js'

// Template vs instance
const TEMPLATE = Symbol('template')
const INSTANCE = Symbol('instance')
const TBD      = Symbol(`tobedetermined`)

// Define symbols for entity types
const TYPE_ACTOR = Symbol('actor')
const TYPE_OBJECT = Symbol('object')
const TYPE_TERRAIN = Symbol('terrain')
const TYPE_CONTAINER = Symbol('container')
const TYPE_GOLD = Symbol('gold')

// Symbols for size
const SIZE_SMALL = Symbol('small')
const SIZE_MEDIUM = Symbol('medium')
const SIZE_LARGE = Symbol('large')

// List of all entity templates in the game
const entityTemplateList = [];
const entityList = [];

const stats = {
    level: 1,
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0,

    curStr: 0,
    curDex: 0,
    curCon: 0,
    curInt: 0,
    curWis: 0,
    curCha: 0
};

const humanoidSlots = [
    SLOT_ARMOR_HEAD, SLOT_ARMOR_CHEST, SLOT_ARMOR_HANDS, SLOT_ARMOR_LEGS, SLOT_ARMOR_FEET,
    SLOT_NECKLACE, SLOT_RING, SLOT_RING, SLOT_BACK, SLOT_WEAPON, SLOT_WEAPON, SLOT_AMMO
];



// Most primitive data structure of an entity in the game
class Entity {

    //==========================================
    // Variables for status effects
    //==========================================

    // Sleeping:  currentAcdtionPoints = 0 & currentSightRange = 0
    // Poisoned:  currentDeathTimer < maxDeathTimer 
    // Frozen:    currentActionPoints = 0 & currentAcAdjustment = +10
    // Paralyzed: currentActionPoints = 0
    // Dizzy:     randomMovement = true
    // Confused:  randomMovement = true && confusedVisuals = true
    // Burning:   losing hp every turn
    // Blindness: currentSightRange = 0


    #alive;                                             // Used can be not-alive and action points (robots)






    constructor(name, icon, description, type, template = TEMPLATE, location = undefined, abilities = [], size = SIZE_TYPE_SMALL, hp = 1, statusEffects = {}, slots = {}, stats = {} ) {

        // Generate network stuff
        this.#uuid = new Uuid;                          // Includes a date
        this.valid = true;

        // Dont need modify date cause it will change below

        // Use the setters() to set these values
        this.template = template;
        this.name = name;
        this.type = type;
        this.description = description;
        this.icon = icon;
        this.location = new Location();

        this.spotted = false;
        this.alwaysVisible = false;

        this.size = size;
        this.stats = stats;
        this.abilities = abilities;

        // By default, all objects can see what's right around them., even inanimate ones
        this.sightRange = 1;

        // And lastly, add this template to the template list or the live list
        if (template === true)
            entityTemplateList.push(this);
        else
            entityList.push(this);
    }

    // Netork getters
    #uuid;
    get uuid()          { return this.#uuid.uuid }
    get creationTime()  { return this.#uuid.creationTime }

    #valid;
    get valid()         { return this.#valid }
    set valid(bool)     { return this.#valid = Boolean(bool) }

    #modifyTime;
    get modifiedTime()  { return this.#modifyTime }
    set modifiedTime()  { return this.#modifyTime = Date.now() }

    #template;
    get template()      { return this.#template }
    set template(value) { if (value !== TEMPLATE && value !== INSTANCE) { throw new Error('Invalid template type') } this.#template = value; }

    // TODO
    // If entity is dead, return corpose + name 
    #name;
    get name()          { return this.#name }
    set name(s)         { return this.#name = String(s) }
    name(cooked)        { (this.isDead() && cooked) ? `corpse of ${this.#name}` : this.#name }

    #icon;
    get icon()          { return this.#icon }
    set icon(s)         { return this.#icon = String(s)}

    #description;
    get description()   { return this.#description }
    set description(s)  { return this.#description = String(s) }

    // Entity type
    #type;
    get type()          { return this.#type; }
    set type(t)         { if (typeof t !== 'symbol') { throw new Error('Invalid entity type')} else { this.#type = type }}

    // Entity location
    #location;
    get location()      { return this.#location; }
    set location(loc)   { return this.#location = loc }

    #size;
    get size()          { return this.#size; }
    set size(s)         { if (typeof s !== 'symbol') { throw new Error('Invalid entity size')} else { this.#size = s }}

    #maxSize;
    get maxSize()       { return this.#maxSize }
    set maxSize(s)      { if (typeof s !== 'symbol') { throw new Error('Invalid entity maxSize')} else { this.#maxSize = s }}

    // Hitpoints and size
    #hp;
    get hp()            { return this.#hp }
    set hp(n)           { return this.#hp = n }

    #maxHp;
    get maxHp()         { return this.#maxHp }
    set maxHp(n)        { return this.#maxHp = n }

    // If entity is seen
    #spotted;
    get spotted()           { return this.#spotted }
    set spotted(s)          { this.#spotted = ((this.#size === SIZE_LARGE) || (this.#alwaysVisible)) ? true : Boolean(s) }
    #alwaysVisible;
    get alwaysVisible()     { return this.#alwaysVisible } 
    set alwaysVisible(b)    { this.#alwaysVisible = Boolean(b) }

    // What entity can see
    #sightRange;
    get sightRange()        { return this.#sightRange }
    set sightRange(n)       { return this.#sightRange = Number(n) }
    #maxSightRange;
    get maxSightRange()     { return this.#maxSightRange }
    set maxSightRange(n)    { return this.#maxSightRange = Number(n) }

    // Status effect stuff
    #confusedMovement;
    get confusedMovement()  { return this.#confusedMovement }
    set confusedMovement(b) { return this.#confusedMovement = b }

    #confusedVisuals;
    get confusedVisuals()   { return this.#confusedVisuals }
    set confusedVisuals(b)  { return this.#confusedVisuals = b }

    #actionPoints;
    get actionPoints()      { return this.#actionPoints }
    set actionPoints(n)     { return this.#actionPoints = n }

    #maxActionPoints;
    get maxActionPoints()   { return this.#maxActionPoints }
    set maxActionPoints(n)  { return this.#maxActionPoints = n }

    #acAdjustment;
    get acAdjustment()      { return this.#acAdjustment } 
    set acAdjustment()      { return this.#acAdjustment = n} 

    #maxAcAdjustment;
    get maxAcAdjustment()   { return this.#maxAcAdjustment } 
    set maxAcAdjustment()   { return this.#maxAcAdjustment = n } 

    #healHpPerTurn;
    get healHpPerTurn()     { return this.#healHpPerTurn }
    set healHpPerTurn(n)    { return this.#healHpPerTurn = n }

    // Hunger level: 2000 or more Oversatiated[note 1]
    //               1000 to 1999	Satiated
    //                150 to 999    Not hungry[note 2]
    //                 50 to 149    Hungry
    //                  0 to 49     Weak
    //          Below zero          Fainting
    //      Below minimum	        Starved to death [note 3]
    #hungerLevel;
    get hungerLevel()       { return this.#hungerLevel }
    set hungerLevel(n)      { return this.#hungerLevel = n }

    #deathTimer;
    get deathTimer()        { return this.#deathTimer }
    set deathTimer(n)       { return this.#deathTimer = n }

    #maxDeathTimer;
    get maxDeathTimer()     { return this.#maxDeathTimer }
    set maxDeathTimer()     { return this.#maxDeathTimer = n }

    // fresh:   100 = fresh for 5 turns (0 becomes tainted)
    // tainted:  75 = tainted for 5 turns (0 becomes rotten)
    // spoiled:  50 = if eaten will make you very sick
    // rotten:   25 = if eaten will start your death timer
    #rotLevel;
    get rotLevel()      { return this.#rottingLevel }
    set rotLevel(n)     { return this.#rottingLevel = n }

    // Status (str, dex, con, int, wis, cha)
    #stats;
    get stats()             { return this.#stats; }
    set stats(s)            { return this.#stats = stats }

    #abilities;
    get abilities()         { return this.#abilities; }
    set abilities(a)        { this.#abilities = abilities }

    #statusEffects = [];
    get statusEffects()     { return this.#statusEffects }
    set statusEffects(s)    { return this.#statusEffects = s }


    // Additional methods
    interact() {
        console.log(`Interacting with ${this.name}`)
    }

    update() {
        // Implement entity-specific update logic here
    }

    // All entities can lose HP.
    // Entities with 0 hp are considered unconcious.
    // Creatures that are dead have EXACTLY -1 hp.  Not less.
    // All other entity types can have less than -1 hit points.

    loseHp(n) {
        // Subtract HP and die
        this.hp -= n;
        if (this.hp < 0)
            this.die();
        return (this.hp);
    }

    gainHp(n) {
        // Only entities at 0 hp or more can gain HP. Healing a corpse doesn't work
        if (this.hp >= 0)
            // Cap the heaing to maxHp
            this.hp = Math.min(this.hp + n, this.maxHp);
        return (this.hp);
    }

    // =============================================
    // Functions specific to creatures
    // =============================================

    isActor = () => (this.type === TYPE_ACTOR)
    isAlive = () => (this.isActor() && this.hp > 0)
    isDead = () => (this.isActor() && this.hp < 0)
    isUnconcious = () => (this.isActor() && this.hp === 0)

    // Only creatures can die and be resurrected
    // add code to drop all stuff
    die = () => this.isActor() && (this.hp = -1)

    // Resurrect this entity and heal it n hit points (capped at maximum)
    resurrect = (n = 1) => this.isDead() && (this.hp = 0 && this.gainHp(n))
    // when a creature resurrects, put back on all it's gear


    //===================
    inventory() {   
    }

    pickupItem(item) {
    }

    dropItem(item) {
    }

    getItemCount(item) {
    }

    setItemCount(item) {
    }

    equipItem(item, bodypart) {
    }

    unequipItem(item) {
    }

    //=====================
    look() {
    }

    whatEntitiesDoISee() {
    }

    whatEntitiesAmINear() {
    }
}

function createRaceTemplate() {

    // Generic human
    new Entity("human", "@", "more handsome than you", TYPE_ACTOR, TEMPLATE, TBD, TBD, 
        SIZE_TYPE_MEDIUM, "1d6", TBD, 
        humanoidGearSlots,
        { level: 1, str: "3d6", dex: "3d6", con: "3d6", int: "3d6", wis: "3d6", cha: "3d6"} );

    
}

function createItemTemplates() {

    // Make ammo
    new Entity("arrow", ")", "requires a bow to use", ENTITY_TYPE_OBJECT, TEMPLATE);
    new Entity("bolt", ")", "requires a crossbow to use", ENTITY_TYPE_OBJECT, TEMPLATE); 
    new Entity("dart", ")", "requires a blowgun to use", ENTITY_TYPE_OBJECT, TEMPLATE); 
    new Entity("stone", ")", "requires a sling to use", ENTITY_TYPE_OBJECT, TEMPLATE);

    // Disposable thrown weapons
    new Entity("throwing knife", ")", "sharp and dangerous", ENTITY_TYPE_OBJECT, TEMPLATE,
        {   range: 10, chance: 100, name: "throws",
            effect: [{damage: "hpDamage=1d3"}],
            requires: { body: { weaponslot: 1 },
            stat: { dex: 9 }}
        })

    // Melee Weapons
    new Entity("dagger", ")", "shorter than a sword", ENTITY_TYPE_OBJECT, TEMPLATE, [
        { ACTIVE,  range: 1, chance: 70, name: "swings",  effect: [{ chance: 100, damage: "1d4",   affects: "hp" }],  requires: { body: { weaponslots: 1}, stats: { str: 4 }}},
        { ACTIVE,  range: 1, chance: 30, name: "stabs",   effect: [{ chance: 100, damage: "1d4+1", affects: "hp" }],  requires: { body: { weaponslots: 1}, stats: { str: 4 }}},
        { PASSIVE, range: 1, chance: 30, name: "parries", effect: [{ chance: 100, reduces: "1d4+1", affects: "hp" }], requires: { body: { weaponslots: 1}, stats: { str: 4 }}}
    ])

    new Entity("short sword", ")", "longer than you think", ENTITY_TYPE_OBJECT, TEMPLATE, [
        { ACTIVE,  range: 1, chance: 70, name: "swings",  effect: [{ chance: 100, damage: "1d6",    affects: "hp" }], requires: { body: { weaponslots: 1}, stats: { str: 6 }}},
        { ACTIVE,  range: 1, chance: 30, name: "stabs",   effect: [{ chance: 100, damage: "1d6+1",  affects: "hp" }], requires: { body: { weaponslots: 1}, stats: { str: 6 }}}, 
        { PASSIVE, range: 1, chance: 50, name: "parries", effect: [{ chance: 100, reduces: "1d6+2", affects: "hp" }], requires: { body: { weaponslots: 1}, stats : { str: 6 }}}
    ])

    new Entity("long sword", ")", "a knight's weapon", ENTITY_TYPE_OBJECT, TEMPLATE [
        { ACTIVE,  range: 1, chance: 70, action: "swings",  effect: [{ chance: 100, damage: "1d8",    affects: "hp" }], requires: { body: { weaponslots: 1}, stats: { str: 8 }}},
        { ACTIVE,  range: 1, chance: 30, action: "stabs",   effect: [{ chance: 100, damage: "1d8+2",  affects: "hp" }], requires: { body: { weaponslots: 1}, stats: { str: 8 }}},
        { PASSIVE, range: 1, chance: 50, action: "parries", effect: [{ chance: 100, reduces: "1d8+2", affects: "hp" }], requires: { body: { weaponslots: 1}, stats: { str: 8 }}}
    ])

    // Ranged weapons
    new Entity("short bow", ")", "blah blah blah", ENTITY_TYPE_OBJECT, TEMPLATE, [
        { ACTIVE,  range: 1, chance: 100, verb: "swings", effect: [{ chance: 100, damage: "1d2-1",  affects: "hp" }], requires: { body: { weaponslots: 2 }, stats: { str: 4 }}},
        { ACTIVE,  range: 100, chance: 100, verb: "fires an arrow", effect: [{ chance: 100, damage: "1d6", affects: "hp" }], requires: { body: { weaponslots: 2 }, stats: { dex: 6 }, inventory: { arrow: "1" }}}
    ])

    new Entity("long bow", ")", "blah blah blah", ENTITY_TYPE_OBJECT, TEMPLATE, [
        { ACTIVE,  range: 1, chance: 100, verb: "swings", effect: [{ chance: 100, damage: "1d2", affects: "hp" }], requires: { body: { weaponslots: 2 }, str: 3 }},
        { ACTIVE,  range: 100, chance: 100, verb: "fires an arrow", effect: [{ chance: 100, damage: "1d8", affects: "hp" }], requires: { body: { weaponslots: 2 }, stats: { dex: 8 }, inventory: { arrow: "1" }}}
    ])

    new Entity("compound bow", ")", "complexity of levers and pullys", ENTITY_TYPE_OBJECT, TEMPLATE, [
        { ACTIVE,  range: 1, chance: 100, verb: "swings", effect: [{ chance: 100, damage: "1d2", affects: "hp" }], requires: { body: { weaponslots: 2 }, str: 3 }},
        { ACTIVE,  range: 100, chance: 100, verb: "fires an arrow", effect: [{ chance: 100, damage: "1d10", affects: "hp" }], requires: { body: { weaponslots: 2 }, stats: { dex: 10 }, inventory: { arrow: "1" }}}
    ])

    // Armor
    new Entity("leather helmet", "[", "better than nothing", ENTITY_TYPE_OBJECT, TEMPLATE, [
        { PASSIVE, range: 1, chance: 100, verb: "reduces", effect: [{ chance: 100, ac: "1"}], requires: { body: "headslot" }}
    ])

    new Entity("leather armor", "[", "better than nothing", ENTITY_TYPE_OBJECT, TEMPLATE, [
        { PASSIVE, range: 1, chance: 100, verb: "reduces", effect: [{ chance: 100, ac: "3"}], requires: { body: "torsoslot" }}
    ])

    new Entity("leather gloves", "[", "better than nothing", ENTITY_TYPE_OBJECT, TEMPLATE, [
        { PASSIVE, range: 1, chance: 100, verb: "reduces", effect: [{ chance: 100, ac: "2"}], requires: { body: "handslot" }}
    ])

    new Entity("leather pants", "[", "better than nothing", ENTITY_TYPE_OBJECT, TEMPLATE, [
        { PASSIVE, range: 1, chance: 100, verb: "reduces", effect: [{ chance: 100, ac: "3"}], requires: { body: "legslot" }}
    ])

    new Entity("leather boots", "[", "better than nothing", ENTITY_TYPE_OBJECT, TEMPLATE, [
        { PASSIVE, range: 1, chance: 100, verb: "reduces", effect: [{ chance: 100, ac: "2"}], requires: { body: "feetslot" }}
    ])

    new Entity("ring of regeneration", "=", "heals hit points", ENTITY_TYPE_OBJECT, TEMPLATE, [
        { PASSIVE, range: 0, chance: 100, verb: "heals", effect [{ chance: 100, hp:"+2"}], requires: { body: "ringslot" }}
    ])
};


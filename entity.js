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

// Typical body parts
// 
// head/torso/hands/legs/feet are for wearing armor
//
// weaponslots
//
// const bodyParts = { heads: 1, torsos: 1, hands: 2, legs: 2, feet: 2, wings: 0, tail: 0, weaponslots: 2 }





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
    // Future networking stuff
    #uuid;
    #creationTime;
    #modifyTime;
    #valid;

    // Game stuff
    #template;
    #name;
    #type;
    #icon;
    #description;

    // Object stuff
    #location;
    #spotted;
    #alwaysVisible;
    #hp;
    #maxHp;
    #size;
    #stats;
    #abilities;

    #statusEffects = [];

    //===========================================
    // Status effects
    //
    // sleeping, dead, burning, poisoned, frozen, dizzy, hungry, satiated,  
    //   in the form of status: value
    //===========================================

    // Blindness - affects #sightRange
    // isBlind: 2 = blind for 2 turns (0 becomes unblind)
    // isBlindEffect = "#sightRange=0"

    #isBlind;
    #isBlindEffect;

    get isBlind() { return this.#isBlind }
    setBlind = (turns, effect) => { this.#isBlindEffect = effect; return (this.#isBlind = turns > 0) }

    // Frozen - affects #actionPoints
    // isFrozen: 2 = frozen for 2 turns (0 becomes unfrozen)
    // isFrozenEffect: "actionPoints=0"

    #isFrozen;
    #isFrozenEffect;
    get isFrozen() { this.#isFrozen }
    setFrozen = (turns, effect) => { this.#isFrozenEffect = effect; return (this.#isFrozen = turns > 0) }

    // Confusion - affects #movementDirection
    // isConfused: 2 = dizzy for 2 turns (0 becomes undizzy)
    // isConfused: "movementdirection=random()"

    #isConfused;
    #isConfusedEffect;
    get isConfused() { return this.#isConfused }
    setConfused = (turns, effect) => { this.#isConfusedEffect = effect; return (this.#isConfused = turns > 0) }

    // Burning - affects hit points, inventory scrolls
    // burning: 2 = burning for 2 turns (0 becomes not burning)
    // burningeffect: "maxhp=1d2"

    #isBurning;
    #isBurningEffect;
    get isBurning() { return this.#isBurning }
    setBurning = (turns, effect) => { this.#isBurningEffect = effect; return (this.#isBurning = turns > 0) }

    // Sleeping - affects #sightrange and #actionpoints 
    // sleeping: 2 = sleeping for 2 turns (0 becomes not sleeping)
    // sleepingeffect = "actionpoints=0;currentVisibiity=0"

    #isSleeping;
    #isSleepingEffect;
    get isSleeping() { return this.#isSleeping }
    setSleeping = (turns, effect) => { this.#isSleepingEffect = effect; return (this.#isSleeping = turns > 0) }

    // Poisoned - affects #hitpoints
    // poisoned: 2 = poisoned for 2 turns (0 becomes unpoisoned unless killed)
    // poisonedeffect = "hp=1d3"

    #isPoisoned;
    #isPoisonedEffect;
    get isPoisoned() { return this.#isPoisoned }
    setPoisoned = (turns, effect) => { this.#isPoisonedEffect = effect; return (this.#isPoisoned = turns > 0) }

    // Regeneratioon - affects #hitpoints
    // regenerating: 2 = regenerating for 2 turns ()
    #isRegeneratingHp;
    #isRegeneratingHpEffect;
    get isRegeneratingHp() { return this.#isRegeneratingHp }
    setRegeneratingHp = (turns, effect) => { this.#isRegeneratingHpEffect = effect; return (this.#isRegeneratingHp = turns > 0) }

    // Special status:
    //
    // dead is special - value is the turn it was killed.  when a creature is killed, it is 
    // immediately marked fresh for 5 turns.
    #isDead;
    #isDeadEffect;

    // fresh: 5 = fresh for 5 turns (0 becomes tainted)
    // tainted: 5 = tainted for 5 turns (0 becomes rotten)
    // spoiled: 5 = if eaten will make you very sick
    // rotten: 

    #isRotting;
    #isRottingEffect;
    // get isRotting() { }
    // set isRotting(turns,) {}

    // Sight range
    #sightRange;

    constructor(name, icon, description, type, template = TEMPLATE, location = undefined, abilities = [], size = SIZE_TYPE_SMALL, hp = 1, statusEffects = {}, slots = {}, stats = {} ) {

        // Generate network stuff
        this.uuid = generateUniqueUUID();
        this.creationTime = Date.now();
        // Dont need modify date cause it will change below

        // Use the setters() to set these values
        this.template = template;
        this.name = name;
        this.type = type;
        this.description = description;
        this.icon = icon;

        this.location = location;
        this.valid = true;
        this.spotted = false;
        this.alwaysVisible = false;
        this.hp = hp;

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
    get uuid() { return this.#uuid; }
    get creationTime() { return this.#creationTime }
    get modifiedTime() { return this.#modifyTime }
    get valid() { return this.#valid; }

    // Game getters
    get template() { return this.#template }

    // If entity is dead, return corpose + name 
    get name() { return this.#name }
    name(cooked) { (this.isDead() && cooked) ? `corpse of ${this.#name}` : this.#name }

    get type() { return this.#type; }

    get description() { return this.#description; }

    // If entity is dead, return % as icon (food)
    get icon() { return (this.hp < 0) ? "\%" : this.#icon }

    // Object getters
    get location() { return this.#location; }
    get spotted() { return this.#spotted }
    get alwaysVisible() { return this.#alwaysVisible }
    get hp() { return this.#hp; }
    get maxHp() { return this.#maxHp }
    get size() { return this.#size; }
    get sightRange() { return this.#sightRange }
    get stats() { return this.#stats; }
    get abilities() { return this.#abilities; }

    // Network setters
    set valid(bool) { this.#valid = Boolean(bool) }

    // Game setters
    set template(template) {
        this.#template = (template === TEMPLATE || template === INSTANCE) ? template : console.log(`STOP`);
        }
    set name(s) { return this.#name = String(s) }
    set type(type) {
        if (typeof type !== 'symbol') { throw new Error('Invalid entity type') }
        this.#type = type;
    }
    set description(s) { return this.#description = String(s) }
    set icon(s) { return this.#icon = String(s)}

    set location(cc) { 
        this.#location = new CartesianCoordinate;
        this.#location.x = location.x;
        this.#location.y = location.y;
        this.#location.z = location.z;
        this.#location.o = location.o;
    }
    set spotted(s) {
        // Large objects and "always visible" objects have a special feature: Once seen, always seen
        this.#spotted = ((this.#size === SIZE_TYPE_LARGE) || (this.#alwaysVisible)) ? true : Boolean(s)
    }
    set alwaysVisible(b) { this.#alwaysVisible = Boolean(b) }

    set hp(n) { this.#hp = Number(n); }
    set maxHp(n) { this.#maxHp = Number(n)}
    set size(s) {
        if (typeof s !== 'symbol') { throw new Error('Invalid entity size') }
        this.#size = s;
    }
    set stats(s) { this.#stats = stats }
    set abilities(a) { this.#abilities = abilities }
    set sightRange(n) { return this.#sightRange = Number(n) }

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


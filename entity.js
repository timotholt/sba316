// Define symbols for entity types
const ENTITY_TYPE_CHARACTER = Symbol('character');
const ENTITY_TYPE_OBJECT = Symbol('object');
const ENTITY_TYPE_MONSTER = Symbol('monster');
const ENTITY_TYPE_TERRAIN = Symbol('terrain');
const ENTITY_TYPE_CONTAINER = Symbol('container');
const ENTITY_TYPE_GOLD = Symbol('gold');

// Symbols for size
const SIZE_TYPE_SMALL = Symbol('small');
const SIZE_TYPE_MEDIUM = Symbol('medium');
const SIZE_TYPE_LARGE = Symbol('large');

// List of all entity templates in the game
const entityTemplateList = [];
const entityList = [];

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
    #description;

    // Object stuff
    #location;
    #spotted;
    #alwaysVisible;
    #hp;
    #size;
    #stats;
    #abilities;

    // Sight range
    #sightRange

    constructor(name, description, type, template = false, location = undefined, abilities = [], size = SIZE_TYPE_SMALL, hp = 1, stats = {}) {

        // Generate network stuff
        this.uuid = generateUniqueUUID();
        this.creationTime = Date.now();
        // Dont need modify date cause it will change below

        // Use the setters() to set these values
        this.template = template;
        this.name = name;
        this.type = type;
        this.description = description;

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
    get name() { return this.#name; }
    get type() { return this.#type; }
    get description() { return this.#description; }

    // Object getters
    get location() { return this.#location; }
    get spotted() { return this.#spotted }
    get alwaysVisible() { return this.#alwaysVisible; }
    get hp() { return this.#hp; }
    get size() { return this.#size; }
    get sightRange() { return this.#sightRange }
    get stats() { return this.#stats; }
    get abilities() { return this.#abilities; }

    // Netowrk setters
    set valid(bool) { this.#valid = Boolean(bool); }

    // Game setters
    set template(bool) { return this.#template = Boolean(bool) }
    set name(s) { return this.#name = String(s) }
    set type(type) {
        if (typeof type !== 'symbol') { throw new Error('Invalid entity type'); }
        this.#type = type;
    }
    set description(s) { return this.#description = String(s) }

    set location(cc) { 
        this.#location = new CartesianCoordinate;
        this.#location.x = location.x;
        this.#location.y = location.y;
        this.#location.z = location.z;
        this.#location.o = location.o;
    }
    set spotted(s) {
        // Large objects and "always visible" objects have a special feature: Once seen, always seen
        this.#spotted = ((this.#size === SIZE_TYPE_LARGE) || (this.#alwaysVisible)) ? true : Boolean(s);
    }
    set alwaysVisible(b) { this.#alwaysVisible = Boolean(b); }

    set hp(hp) { this.#hp = Number(hp); }
    set size(s) {
        if (typeof s !== 'symbol') { throw new Error('Invalid entity size'); }
        this.#size = s;
    }
    set stats(s) { this.#stats = stats }
    set abilities(a) { this.#abilities = abilities }
    set sightRange(n) { return this.#sightRange = Number(n) }

    // Additional methods
    interact() {
        console.log(`Interacting with ${this.name}`);
    }

    update() {
        // Implement entity-specific update logic here
    }

    takeDamage(type, num) {
    }

    healDamage(type, num) {
    }

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

    unequipBodypart(bodypart) {
    }

    //=====================
    look() {
    }

    whatEntitiesDoISee() {
    }

    whatEntitiesAmINear() {
    }
}


function createItemTemplates() {

    // Make ammo
    new Entity("arrow", "requires a bow to use", ENTITY_TYPE_OBJECT, true);
    new Entity("bolt", "requires a crossbow to use", ENTITY_TYPE_OBJECT, true); 
    new Entity("dart", "requires a blowgun to use", ENTITY_TYPE_OBJECT, true); 
    new Entity("stone", "requires a sling to use", ENTITY_TYPE_OBJECT, true);

    // Disposable thrown weapons
    new Entity("throwing knife", "sharp and dangerous", ENTITY_TYPE_OBJECT, true,
        { range: 10, chance: 100, name: "throws", damage: "1d3", requires: { body: "hand", dex: 9 }})

    // Melee Weapons
    new Entity("dagger", "shorter than a sword", ENTITY_TYPE_OBJECT, true, [
        { ACTIVE,  range: 1, chance: 70, name: "swings",  effect: [{ chance: 100, damage: "1d4",   affects: "hp" }], requires: { body: "hand", str: 4 }},
        { ACTIVE,  range: 1, chance: 30, name: "stabs",   effect: [{ chance: 100, damage: "1d4+1", affects: "hp" }], requires: { body: "hand", str: 4 }},
        { PASSIVE, range: 1, chance: 30, name: "parries", effect: [{ chance: 100, negates: "1d4+1", affects: "hp" }], requires: { body: "hand", str: 4 }}])

    new Entity("short sword", "longer than you think", ENTITY_TYPE_OBJECT, true, [
        { ACTIVE,  range: 1, chance: 70, name: "swings",  effect: [{ chance: 100, damage: "1d6",    affects: "hp" }], requires: { body: "hand", str: 6 }},
        { ACTIVE,  range: 1, chance: 30, name: "stabs",   effect: [{ chance: 100, damage: "1d6+1",  affects: "hp" }], requires: { body: "hand", str: 6 }}, 
        { PASSIVE, range: 1, chance: 50, name: "parries", effect: [{ chance: 100, negates: "1d6+2", affects: "hp" }], requires: { body: "hand", str: 6 }}])

    new Entity("long sword", "a knight's weapon", ENTITY_TYPE_OBJECT, true [
        { ACTIVE,  range: 1, chance: 70, name: "swings",  effect: [{ chance: 100, damage: "1d8",    affects: "hp" }], requires: { body: "hand", str: 8 }},
        { ACTIVE,  range: 1, chance: 30, name: "stabs",   effect: [{ chance: 100, damage: "1d8+2",  affects: "hp" }], requires: { body: "hand", str: 8 }},
        { PASSIVE, range: 1, chance: 50, name: "parries", effect: [{ chance: 100, negates: "1d8+2", affects: "hp" }], requires: { body: "hand", str: 8 }}])

    // Ranged weapons
    new Entity("short bow", "blah blah blah", ENTITY_TYPE_OBJECT, true, [
        { ACTIVE,  range: 1, chance: 100, name: "swings", effect: [{ chance: 100, damage: "1d2-1",  affects: "hp" }], requires: { body: "two-hands", str: 3 }},
        { ACTIVE,  range: 100, chance: 100, name: "fires an arrow", effect: [{ chance: 100, damage: "1d6", affects: "hp" }], requires: { body: "two-hands", str: 6, inventory: "arrow" }}])

    new Entity("long bow", "blah blah blah", ENTITY_TYPE_OBJECT, true, [
        { ACTIVE,  range: 1, chance: 100, name: "swings", effect: [{ chance: 100, damage: "1d2", affects: "hp" }], requires: { body: "two-hands", str: 3 }},
        { ACTIVE,  range: 100, chance: 100, name: "fires an arrow", effect: [{ chance: 100, damage: "1d8", affects: "hp" }], requires: { body: "two-hands", str: 8, inventory: "arrow" }}])

    new Entity("compound bow", "complexity of levers and pullys", ENTITY_TYPE_OBJECT, true, [
        { ACTIVE,  range: 1, chance: 100, name: "swings", effect: [{ chance: 100, damage: "1d2", affects: "hp" }], requires: { body: "two-hands", str: 3 }},
        { ACTIVE,  range: 100, chance: 100, name: "fires an arrow", effect: [{ chance: 100, damage: "1d10", affects: "hp" }], requires: { body: "two-hands", str: 8, inventory: "arrow" }}])
};


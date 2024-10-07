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

// Most primitive data structure of an entity in the game
class Entity {
    // Future networking stuff
    #uuid;
    #creationTime;
    #modifyTime;
    #valid;

    // Game stuff
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
    #actions;

    // Sight range
    #sightRange

    constructor(type, location, name = '', description = '', hp = 1, size = SIZE_TYPE_SMALL, stats = {}, actions = []) {

        // Generate network stuff
        this.uuid = generateUniqueUUID();
        this.creationTime = Date.now();
        // Dont need modify date cause it will change below

        // Use the setters() to set these values
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
        this.actions = actions;

        // By default, all objects can see what's right around them., even inanimate ones
        this.sightRange = 1;
    }

    // Netork getters
    get uuid() { return this.#uuid; }
    get creationTime() { return this.#creationTime }
    get modifiedTime() { return this.#modifyTime }
    get valid() { return this.#valid; }

    // Game getters
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
    get actions() { return this.#actions; }

    // Netowrk setters
    set valid(bool) { this.#valid = bool; }

    // Game setters
    set name(n) { return this.#name = String(n) }
    set type(type) {
        if (typeof type !== 'symbol') { throw new Error('Invalid entity type'); }
        this.#type = type;
    }
    set description(d) { return this.#description = String(d) }

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
    set actions(a) { this.#actions = actions }
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


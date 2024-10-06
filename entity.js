// Define symbols for entity types
const ENTITY_TYPE_CHARACTER = Symbol('character');      // Player or non-player character, has a input device 
const ENTITY_TYPE_OBJECT    = Symbol('object');         // Object we can pickup or drop
const ENTITY_TYPE_MONSTER   = Symbol('monster');        // Monster
const ENTITY_TYPE_TERRAIN   = Symbol('terrain');        // Terrain (doors, stairs, walls)
const ENTITY_TYPE_CONTAINER = Symbol('container');      // Container
const ENTITY_TYPE_GOLD      = Symbol('gold');           // Gold

// Symbols for size
const SIZE_TYPE_SMALL  = Symbol('small');               // Can shared same square with other objects
const SIZE_TYPE_MEDIUM = Symbol('medium');              // Can not shared same square with other medium objects
const SIZE_TYPE_LARGE  = Symbol('large');               // Once seen, always seen. Can't share squares with anything

// Most primative data structure of an entity in the game
class Entity {
    #uuid;
    #type;
    #location;
    #valid;
    #spotted;
    #alwaysVisible;
    #hp;
    #size;
    constructor(type, cc, hp = 1) {
        this.#uuid = generateUniqueUUID();
        this.#type = type;
        this.#location = cc;
        this.#valid = true;

        this.#spotted = false;
        this.#alwaysVisible = false;

        this.#hp = hp;
        this.#size = SIZE_TYPE_SMALL;
    }

    // Getters
    get uuid() { return (this.#uuid) }
    get valid() { return (this.#valid)}
    get type() { return (this.#type) }
    get location() { return (this.#location)}
    get alwaysVisible() { return (this.#alwaysVisible)}
    get hp() { return (this.#hp) }
    get size() { return (this.#size)}
    get spotted() { return (this.#spotted)}

    // Setters
    set valid(bool) { return this.#valid = bool };
    set type(type) {
        // Check if the type is a valid symbol
        if (typeof type !== 'symbol')
            { throw new Error('Invalid entity type') }
        else
            return this.#type = type;
    }
    set location(cc) { return this.#location = cc };
    set hp(hp) { return this.#hp = hp };
    set alwaysVisible(b) { return this.#alwaysVisible = b }
    set size(s) {
        // Check if the type is a valid symbol
        if (typeof s !== 'symbol')
            { throw new Error('Invalid entity size') }
        else
            return this.#type = type;
    }

    // Large objects and "always visible" objects have a special feature: Once seen, always seen
    set spotted(s) {
        this.#spotted = ((this.#size === SIZE_TYPE_LARGE) || (this.#alwaysVisible)) ? true : s;
    }
}

class EntityFactory {

    static #instance;

    #entitiesMap;

    constructor() {
        this.#entitiesMap = new Map();  
    }

    static getInstance() {
        if (!EntityFactory.#instance) {
            EntityFactory.#instance = new EntityFactory();
        }
        return EntityFactory.#instance;
    }

    createEntity(type, cartesianCoordinate) {
        // Type must be a symbol
        if (typeof type !== 'symbol')
            throw new Error('Invalid entity type');

        if (typeof cartesianCoordinate !== 'cartesianCoordinate')
            throw new Error('Invalid cartesian coordinate');

        const newEntity = new Entity(type, cartesianCoordinate);

        this.#entitiesMap.set(newEntity.uuid, newEntity);
        return newEntity;
    }

    destroyEntity(entity) {
        factory.#entitiesMap.delete(entity.uuid);
    }

    copyEntity(entity) {
        const newEntity = new Entity(entity.type, entity.cartesianCoordinate);
        factory.#entitiesMap.set(newEntity.uuid, newEntity);
        return newEntity;
    }

    getEntityByUuid(uuid) {
        return this.#entitiesMap.get(uuid);
    }    

    getEntitiesByType(type) {
        return Array.from(this.#entitiesMap.values()).filter(entity => entity.type === type && entity.valid);
    }
}

//===============================================
// Public functions
//===============================================

function createEntity(type, cartesianCoordinate) {
    return EntityFactory.createEntity(type, cartesianCoordinate);
}

function destroyEntity(entity) {
    return EntityFactory.destroyEntity(entity);
}

function copyEntity(entity) {
    return EntityFactory.copyEntity(entity);
}

function getEntityByUuid(uuid) {
    return EntityFactory.getEntityByUuid(uuid);
}

function getEntitiesByType(type) {
    return EntityFactory.getEntitiesByType(type);
}

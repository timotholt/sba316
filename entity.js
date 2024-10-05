// Most primative data structure of an entity in the game
class Entity {
    #type;
    #cartesianCoordinate;
    #valid;
    constructor(type, cartesianCoordinate) {
        this.#type = type;
        this.#cartesianCoordinate = cartesianCoordinate;
        this.#valid = true;
    }
}

class EntityFactory {

    static #instance;

    #entitiesList;

    constructor() {
        this.#entitiesList = [];
    }

    static getInstance() {
        if (!EntityFactory.#instance) {
            EntityFactory.#instance = new EntityFactory();
        }
        return EntityFactory.#instance;
    }

    createEntity(type, cartesianCoordinate) {
        const factory = EntityFactory.getInstance();
        const newEntity = new Entity(type, cartesianCoordinate);
        this.#entitiesList.push(newEntity);
        return newEntity;
    }

    destroyEntity(entity) {
        const factory = EntityFactory.getInstance();
        entity.valid = false;
        const index = this.#entitiesList.indexOf(entity);
        if (index !== -1) {
            this.#entitiesList.splice(index, 1);
        }
    }

    copyEntity(entity) {
        const newEntity = new Entity(entity.type, { x: entity.cartesianCoordinate.x, y: entity.cartesianCoordinate.y });
        this.#entitiesList.push(newEntity);
        return newEntity;
    }

    getEntitiesByType(type) {
        return this.#entitiesList.filter(entity => entity.type === type && entity.valid);
    }
}

// Public functions
function createEntity(type, cartesianCoordinate) {
    const entityFactory = EntityFactory.getInstance();
    return entityFactory.createEntity(type, cartesianCoordinate);
}

function destroyEntity(entity) {
    const entityFactory = EntityFactory.getInstance();
    return entityFactory.destroyEntity(entity);
}

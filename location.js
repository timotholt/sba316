
//========================================================================
// class Location
//
// A location in the game can be a cell(x,y,z,o) or a link to an entity
//
// This allows entities to be carried by a parent entity (i.e a fighter
// or an entity on the ground.
//========================================================================

class Location {

    // Private members
    #entity;
    #cartesianCoordinate;

    constructor (location) {

        // Check for null pointer references
        if (location === null) {
            throw new Error("Invalid location passed to Location constructor");
        }

        // Set default address as invalid
        this.#cartesianCoordinate = new CartesianCoordinate(-1, -1, -1, -1);

        // If location is an entity, use its location
        if (location instanceof Entity) {

            // Check for null pointer references
            if (location.location === null) {
                throw new Error("Entity passed to Location constructor has null location");
            }

            // Set entityCarriedBy
            this.#entity = location;

        }

        // If location is a cartesian coordinate, use it
        else if (location instanceof CartesianCoordinate) {

            // Set entityCarriedBy
            this.#entity = null;

            // Check for null pointer references
            if (location === null) {
                throw new Error("CartesianCoordinate passed to Location constructor is null");
            }

            // Copy the address
            this.#cartesianCoordinate = location;

        }

        // Otherwise it's invalid
        else {
            throw new Error("Invalid location passed to Location constructor");
        }
    }

    // get x of location
    get x() { return (this.#entity) ? this.#entity.location.x : this.#cartesianCoordinate.x }

    // get y of location
    get y() { return (this.#entity) ? this.#entity.location.y : this.#cartesianCoordinate.y }

    // get z of location
    get z() { return (this.#entity) ? this.#entity.location.z : this.#cartesianCoordinate.z }

    // get o of location
    get o() { return (this.#entity) ? this.#entity.location.o : this.#cartesianCoordinate.o }

    // get Entity
    get entity() { return this.#entity }

    // set entityCarriedBy
    set entity(entity) {
        if (entity === null) {
            throw new Error("entity passed to Location.set entity is null");
        }

        if (!entity) {
            this.#entity = entity;
            this.#cartesianCoordinate.x = -1;
            this.#cartesianCoordinate.y = -1;
            this.#cartesianCoordinate.z = -1;
            this.#cartesianCoordinate.o = -1;
            return (entity); 
        }
    }
    
    // Basically drop at the entity's location
    entityCopyAndForget() {
        if (this.#entity) {
            this.#cartesianCoordinate.x = this.#entity.location.x;
            this.#cartesianCoordinate.y = this.#entity.location.y;
            this.#cartesianCoordinate.z = this.#entity.location.z;
            this.#cartesianCoordinate.o = this.#entity.location.o;
            this.#entity = null;
            return (this.#cartesianCoordinate);
        }
    }

    // set x of location
    set x(x) {
        if (this.#entity) {
            throw new Error("Cannot set x of location when entityCarriedBy is true");
        }
        if (x === null) {
            throw new Error("x passed to Location.set x is null");
        }
        this.#cartesianCoordinate.x = x;
        return x;
    }

    // set y of location
    set y(y) {
        if (this.#entity) {
            throw new Error("Cannot set y of location when entityCarriedBy is true");
        }
        if (y === null) {
            throw new Error("y passed to Location.set y is null");
        }
        this.#cartesianCoordinate.y = y;
        return y;
    }

    // set z of location
    set z(z) {
        if (this.#entity) {
            throw new Error("Cannot set z of location when entityCarriedBy is true");
        }
        if (z === null) {
            throw new Error("z passed to Location.set z is null");
        }
        this.#cartesianCoordinate.z = z;
        return z;
    }

    // set o of location
    set o(o) {
        if (this.#entity) {
            throw new Error("Cannot set o of location when entityCarriedBy is true");
        }
        if (o === null) {
            throw new Error("o passed to Location.set o is null");
        }
        this.#cartesianCoordinate.o = o;
        return o;
    }
}


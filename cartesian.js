// Class for cartesian coordinates
class CartesianCoordinate {

    #x; #y; #z; #o;

    constructor(x, y, z, o) {
        this.#x = x;
        this.#y = y;
        this.#z = z;
        this.#o = o;
    };

    get x() { this.#x; }
    get y() { this.#y; }
    get z() { this.#z; }
    get o() { this.#o; }

    set x(x) { this.#x = Math.floor(Number(x))}
    set y(y) { this.#y = Math.floor(Number(y))}
    set z(z) { this.#z = Math.floor(Number(z))}
    set o(o) { this.#o = Math.floor(Number(o))}

    // Check to see if this has the same cartesian coordinate as the passed object
    sameXYZ(cc) { (this.#x === Number(cc.x)) && (this.#y === Number(cc.y)) && (this.#z === Number(cc.z)) }
    sameXYZO(cc) { (this.sameXYZ(x, y, z) && this.#o === Number(cc.o)) }

    // Distance function, skips z and o
    distanceBetweenXy(cc) {
        if (!isCartesianCoordinate(cc))
            throw error `CC = Not cartesiancoordinate`;
        else
            return distanceBetween(this.#x, this.#y, cc.x, cc.y);
        }

    // Returns list of coordinates this touches (from 3 to 8 squares)
    adjacentTo() {
        let cell;
        let result = [];
        for (let row = -1; row <= 1; row++)
            for (let col = -1; col <= 1; col++) {
                // Skip this square
                if (row === 0 && col === 0) continue;
                cell.x = this.#x + col;
                cell.y = this.#y + row;
                if ((cell.y >= 0) && (cell.y < gameHeight()) &&
                    (cell.x >= 0) && (cell.x < gameWidth()))
                    result.push(cell);
            }
    }
}

// Not using typescript
function isCartesianCoordinate(obj) {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.x === 'number' &&
        typeof obj.y === 'number' &&
        (typeof obj.z === 'undefined' || typeof obj.z === 'number') &&
        (typeof obj.o === 'undefined' || typeof obj.o === 'number')
    );
}


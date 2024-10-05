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

    set x(x) { this.#x = toNumber(x)}
    set y(y) { this.#y = toNumber(y)}
    set z(z) { this.#z = toNumber(z)}
    set o(o) { this.#o = toNumber(o)}

    // Check to see if this has the same cartesian coordinate as the passed object
    sameXYZ(cc) { (this.#x === toNumber(cc.x)) && (this.#y === toNumber(cc.y)) && (this.#z === toNumber(cc.z)) }
    sameXYZO(cc) { (this.sameXYZ(x, y, z) && this.#o === toNumber(cc.o)) }

    // Distance function, skips z and o
    distanceBetweenXy(cc) { distanceBetween(this.#x, this.#y, cc.x, cc.y) }

}


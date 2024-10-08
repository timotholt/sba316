// Game constants
const gameHeight = () => 10;
const gameWidth = () => 40;

// The turn the game is on
class TurnNumber {
    #turnNumber = 1;

    constructor() {
        this.#turnNumber = 1;
    };

    get turnNumber() { return this.#turnNumber } 
    set turnNumber(n) { return (this.#turnNumber = n) }
    bumpTurnNumber(n) { return (this.#turnNumber += n)}
}

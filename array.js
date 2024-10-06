// ES6 / ECMAScript 2015
function shuffleArray(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

var d = [1,2,3,4,5,6,7,8,9,10];

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
// All the other answers are based on Math.random() which is fast but not suitable for cryptgraphic level randomization.
//
// The below code is using the well known Fisher-Yates algorithm while utilizing Web Cryptography API for cryptographic level of randomization.

function shuffle(a) {
	var x, t, r = new Uint32Array(1);
	for (var i = 0, c = a.length - 1, m = a.length; i < c; i++, m--) {
		crypto.getRandomValues(r);
		x = Math.floor(r / 65536 / 65536 * m) + i;
		t = a [i], a [i] = a [x], a [x] = t;
	}

	return a;
}

console.log(shuffle(d));

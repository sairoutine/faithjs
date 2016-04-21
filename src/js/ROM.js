'use strict';

var ROM = function(binary) {

	this.uint8 = new Uint8Array(binary);

	for(var i = 0; i < this.uint8.length; i++) {
		console.log(hex(this.uint8[i]));
	}
};

function hex(num) {
	var str = num.toString(16);
	var prefix = '0x';
	var base = '';

	if(str.length < 2) {
		base = '0';
	}

	return prefix + base + str;
}

module.exports = ROM;

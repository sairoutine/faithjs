'use strict';

var Register16bit = function() {
	var buffer = new ArrayBuffer(this.WORD_SIZE);
	//this.uint8 = new Uint8Array(buffer);

	this.uint16 = new Uint16Array(buffer);
	this.uint16[0] = 0;
};

Register16bit.prototype.WORD_SIZE = 2; // 2 byte

Register16bit.prototype.load = function() {
	return this.uint16[0];
};

Register16bit.prototype.store = function(value) {
	this.uint16[0] = value;
};

Register16bit.prototype.increment = function() {
	this.uint16[0]++;
};

module.exports = Register16bit;

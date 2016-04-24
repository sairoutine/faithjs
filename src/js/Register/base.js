'use strict';

var util = require('../util');

var Register = function() {
	var buffer = new ArrayBuffer(this.WORD_SIZE);
	this.uint8 = new Uint8Array(buffer);
	this.uint8[0] = 0;
};

Register.prototype.WORD_SIZE = 1; // 1 byte


Register.prototype.store = function(value) {
	this.uint8[0] = value;
};



module.exports = Register;

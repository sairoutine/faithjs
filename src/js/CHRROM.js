'use strict';

// キャラクタROM
var CHRROM = function(chrrom_uint8, mapper) {
	this.uint8 = chrrom_uint8;
	this.mapper = mapper;
};

CHRROM.prototype.load = function(address) {
	return this.uint8[this.mapper.mapForCHRROM(address)];
};

CHRROM.prototype.store = function(address, value) {
};

module.exports = CHRROM;

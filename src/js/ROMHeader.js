'use strict';

var util = require('./util');

// NES ROM Header
var ROMHeader = function(rom) {
	this.rom = rom;
};


// NES Signature
ROMHeader.prototype.SIGNATURE = [0x4E,0x45,0x53,0x1A];

// check NES Signature
ROMHeader.prototype.isNES = function() {
	var signature = this.rom.load(0, 4);

	return util.isEqual(signature, this.SIGNATURE);
};

ROMHeader.prototype.getMapperNum = function() {
	var flags6 = this.rom.load(6);
	var lowerBits = util.getPartialBits(flags6, 4, 0xf);
	var flags7 = this.rom.load(6);
	var higherBits = util.getPartialBits(flags7, 4, 0xf);
	return (higherBits << 4) | lowerBits;
};

ROMHeader.prototype.getPartialBits = function(value, bit, mask) {
  return (value >> bit) & mask;
};



module.exports = ROMHeader;

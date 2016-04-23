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


module.exports = ROMHeader;

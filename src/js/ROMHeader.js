'use strict';

var util = require('./util');

// NES ROM Header
var ROMHeader = function(rom) {
	this.rom = rom;
};

// NES Signature
ROMHeader.prototype.SIGNATURE = [0x4E,0x45,0x53,0x1A];

// Header Size
ROMHeader.prototype.SIZE = 16;


// CHR ROMの場所
ROMHeader.prototype.getCHRROMBanksNum = function() {
	// Size of CHR ROM in 8 KB units (Value 0 means the board uses CHR RAM)
	return this.rom.load(5);
};

// RPG ROMの場所
ROMHeader.prototype.getPRGROMBanksNum = function() {
	// Size of PRG ROM in 16 KB units
	return this.rom.load(4);
};

// check NES Signature
ROMHeader.prototype.isNES = function() {
	var signature = this.rom.load(0, 4);

	return util.isEqual(signature, this.SIGNATURE);
};

// Mapper 番号
ROMHeader.prototype.getMapperNum = function() {
	var flags6 = this.rom.load(6);
	var lowerBits = util.getPartialBits(flags6, 4, 0xf);
	var flags7 = this.rom.load(6);
	var higherBits = util.getPartialBits(flags7, 4, 0xf);
	return (higherBits << 4) | lowerBits;
};

// 特定のbitを取得
ROMHeader.prototype.getPartialBits = function(value, bit, mask) {
	return (value >> bit) & mask;
};



module.exports = ROMHeader;

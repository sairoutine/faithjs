'use strict';

var ROMMapper = function(rom) {
	this.rom = rom;
};


ROMMapper.prototype.map = function(address) {
	return address;
};


ROMMapper.prototype.mapForCHRROM = function(address) {
	return address;
};


ROMMapper.prototype.store = function(address, value) {
};

module.exports = ROMMapper;

"use strict";

var MapperProto = require('./Base');
/**** Mapper92 ****/
var Mapper92 = function(nes) {
	MapperProto.apply(this, arguments);
};

Mapper92.prototype = Object.create(MapperProto.prototype);

Mapper92.prototype.Init = function() {

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper92.prototype.Write = function(address, data) {
	var prg = (address & 0x0F) << 1;
	var chr = (address & 0x0F) << 3;
	if(address >= 0x9000) {
		if((address & 0xF0) === 0xD0) {
			this.nes.SetPrgRomPages8K(0, 1, prg, prg + 1);
		} else if((address & 0xF0) === 0xE0) {
			this.nes.SetChrRomPages1K(chr, chr + 1, chr + 2, chr + 3, chr + 4, chr + 5, chr + 6, chr + 7);
		}
	} else {
		if((address & 0xF0) === 0xB0) {
			this.nes.SetPrgRomPages8K(0, 1, prg, prg + 1);
		} else if((address & 0xF0) === 0x70) {
			this.nes.SetChrRomPages1K(chr, chr + 1, chr + 2, chr + 3, chr + 4, chr + 5, chr + 6, chr + 7);
		}
	}
};

module.exports = Mapper92;

"use strict";

var MapperProto = require('./Base');
/**** Mapper86 ****/
var Mapper86 = function(nes) {
	MapperProto.apply(this, arguments);
};

Mapper86.prototype = Object.create(MapperProto.prototype);

Mapper86.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(this.nes.PrgRomPageCount * 2 - 4, this.nes.PrgRomPageCount * 2 - 3, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper86.prototype.WriteSRAM = function(address, data) {
	if(address >= 0x6000 && address < 0x6FFF) {
		var prg = ((data & 0x30) >>> 4) << 2;
		var chr = (((data & 0x40) >>> 4) | (data & 0x03)) << 3;
		this.nes.SetPrgRomPages8K(prg, prg + 1, prg + 2, prg + 3);
		this.nes.SetChrRomPages1K(chr, chr + 1, chr + 2, chr + 3, chr + 4, chr + 5, chr + 6, chr + 7);
	}
};

module.exports = Mapper86;

"use strict";

var MapperProto = require('./Base');

/**** Mapper152 ****/
var Mapper152 = function(nes) {
	MapperProto.apply(this, arguments);
};

Mapper152.prototype = Object.create(MapperProto.prototype);

Mapper152.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper152.prototype.WriteSRAM = function(address, data) {
	this.nes.SetPrgRomPage(0, (data & 0x70) >> 4);
	this.nes.SetChrRomPage(data & 0x0F);

	if((data & 0x80) === 0x80)
		this.nes.SetMirrors(0, 0, 0, 0);
	else
		this.nes.SetMirrors(1, 1, 1, 1);
};

module.exports = Mapper152;

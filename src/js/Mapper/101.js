"use strict";

var MapperProto = require('./Base');
/**** Mapper101 ****/
var Mapper101 = function(nes) {
	MapperProto.apply(this, arguments);
};

Mapper101.prototype = Object.create(MapperProto.prototype);

Mapper101.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper101.prototype.WriteSRAM = function(address, data) {
	this.nes.SetChrRomPage(data & 0x03);
};

module.exports = Mapper101;

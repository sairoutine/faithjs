"use strict";

var MapperProto = require('./Base');
/**** Mapper3 ****/
var Mapper3 = function(nes) {
	MapperProto.apply(this, arguments);
};

Mapper3.prototype = Object.create(MapperProto.prototype);

Mapper3.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper3.prototype.Write = function(address, data) {
	this.nes.SetChrRomPage(data & 0x0F);
};

module.exports = Mapper3;

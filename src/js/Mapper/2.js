"use strict";

var MapperProto = require('./Base');
/**** Mapper2 ****/
var Mapper2 = function(nes) {
	MapperProto.apply(this, arguments);
};

Mapper2.prototype = Object.create(MapperProto.prototype);

Mapper2.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper2.prototype.Write = function(address, data) {
	this.nes.SetPrgRomPage(0, data);
};

module.exports = Mapper2;

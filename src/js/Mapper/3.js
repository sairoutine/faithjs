"use strict";

var Base = require('./Base');
/**** Mapper3 ****/
var Mapper3 = function(nes) {
	Base.apply(this, arguments);
};

Mapper3.prototype = Object.create(Base.prototype);

Mapper3.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper3.prototype.Write = function(address, data) {
	this.nes.SetChrRomPage(data & 0x0F);
};

module.exports = Mapper3;

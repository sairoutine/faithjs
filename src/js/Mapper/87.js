"use strict";

var Base = require('./Base');
/**** Mapper87 ****/
var Mapper87 = function(nes) {
	Base.apply(this, arguments);
};

Mapper87.prototype = Object.create(Base.prototype);

Mapper87.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper87.prototype.WriteSRAM = function(address, data) {
	var chr = ((data & 0x02) >>> 1) | ((data & 0x01) << 1);
	this.nes.SetChrRomPage(chr);
};

module.exports = Mapper87;

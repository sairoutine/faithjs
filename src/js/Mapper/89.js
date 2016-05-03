"use strict";

var Base = require('./Base');
/**** Mapper89 ****/
var Mapper89 = function(nes) {
	Base.apply(this, arguments);
};

Mapper89.prototype = Object.create(Base.prototype);

Mapper89.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);

	this.nes.SetChrRomPage(0);
};

Mapper89.prototype.Write = function(address, data) {
	this.nes.SetPrgRomPage(0, (data & 0x70) >> 4);
	this.nes.SetChrRomPage(((data & 0x80) >> 4) | (data & 0x07));

	if((data & 0x08) === 0x00)
		this.nes.SetMirrors(0, 0, 0, 0);
	else
		this.nes.SetMirrors(1, 1, 1, 1);
};

module.exports = Mapper89;

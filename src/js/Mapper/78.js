"use strict";

var Base = require('./Base');
/**** Mapper78 ****/
var Mapper78 = function(nes) {
	Base.apply(this, arguments);
};

Mapper78.prototype = Object.create(Base.prototype);

Mapper78.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);

	this.nes.SetChrRomPage(0);
};

Mapper78.prototype.Write = function(address, data) {
	this.nes.SetPrgRomPage(0, data & 0x07);
	this.nes.SetChrRomPage(data >> 4);

	if((data & 0x08) === 0x08)
		this.nes.SetMirror(false);
	else
		this.nes.SetMirror(true);
};

module.exports = Mapper78;

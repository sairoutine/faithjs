"use strict";

var Base = require('./Base');
/**** Mapper70 ****/
var Mapper70 = function(nes) {
	Base.apply(this, arguments);
};

Mapper70.prototype = Object.create(Base.prototype);

Mapper70.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, this.nes.PrgRomPageCount - 1);
	this.nes.SetChrRomPage(0);
};

Mapper70.prototype.Write = function(address, data) {
	this.nes.SetPrgRomPage(0, (data & 0x70)>> 4);
	this.nes.SetChrRomPage(data & 0x0F);

	if((data & 0x80) === 0x00)
		this.nes.SetMirrors(0,0,0,0);
	else
		this.nes.SetMirrors(1,1,1,1);
};

module.exports = Mapper70;

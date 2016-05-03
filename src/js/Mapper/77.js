"use strict";

var Base = require('./Base');
/**** Mapper77 ****/
var Mapper77 = function(nes) {
	Base.apply(this, arguments);
};

Mapper77.prototype = Object.create(Base.prototype);

Mapper77.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, 1);

	this.nes.SetChrRomPage1K(0, 0);
	this.nes.SetChrRomPage1K(1, 1);
	this.nes.SetChrRomPage1K(2, 2 + 0x0100);
	this.nes.SetChrRomPage1K(3, 3 + 0x0100);
	this.nes.SetChrRomPage1K(4, 4 + 0x0100);
	this.nes.SetChrRomPage1K(5, 5 + 0x0100);
	this.nes.SetChrRomPage1K(6, 6 + 0x0100);
	this.nes.SetChrRomPage1K(7, 7 + 0x0100);
};

Mapper77.prototype.Write = function(address, data) {
	var tmp = (data & 0x0F) << 1;
	this.nes.SetPrgRomPage(0, tmp);
	this.nes.SetPrgRomPage(1, tmp + 1);

	tmp = (data & 0xF0) >> 3;
	this.nes.SetChrRomPage1K(0, tmp);
	this.nes.SetChrRomPage1K(1, tmp + 1);
};

module.exports = Mapper77;

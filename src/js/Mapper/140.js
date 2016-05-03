"use strict";

var Base = require('./Base');

/**** Mapper140 ****/
var Mapper140 = function(nes) {
	Base.apply(this, arguments);
};

Mapper140.prototype = Object.create(Base.prototype);

Mapper140.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, 1);
	this.nes.SetChrRomPage(0);
};

Mapper140.prototype.WriteSRAM = function(address, data) {
	var tmp = (data & 0x30) >> 3;
	this.nes.SetPrgRomPage(0, tmp);
	this.nes.SetPrgRomPage(1, tmp + 1);
	this.nes.SetChrRomPage(data & 0x0F);
};

module.exports = Mapper140;

"use strict";

var Base = require('./Base');
/**** Mapper34 ****/
var Mapper34 = function(nes) {
	Base.apply(this, arguments);
};

Mapper34.prototype = Object.create(Base.prototype);

Mapper34.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, 1);
	this.nes.SetChrRomPage(0);
};

Mapper34.prototype.Write = function(address, data) {
	var tmp = (data & 0x03) << 1;

	this.nes.SetPrgRomPage(0, tmp);
	this.nes.SetPrgRomPage(1, tmp + 1);
};

module.exports = Mapper34;

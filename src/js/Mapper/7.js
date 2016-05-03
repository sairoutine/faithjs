"use strict";

var Base = require('./Base');
/**** Mapper7 ****/
var Mapper7 = function(nes) {
	Base.apply(this, arguments);
};

Mapper7.prototype = Object.create(Base.prototype);

Mapper7.prototype.Init = function() {
	this.nes.SetPrgRomPage(0, 0);
	this.nes.SetPrgRomPage(1, 1);
	this.nes.SetChrRomPage(0);
};

Mapper7.prototype.Write = function(address, data) {
	var tmp = (data & 0x07) << 1;
	this.nes.SetPrgRomPage(0, tmp);
	this.nes.SetPrgRomPage(1, tmp + 1);

	if((data & 0x10) === 0x00)
		this.nes.SetMirrors(0,0,0,0);
	else
		this.nes.SetMirrors(1,1,1,1);
};

module.exports = Mapper7;

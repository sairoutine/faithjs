"use strict";

var Base = require('./Base');
/**** Mapper93 ****/
var Mapper93 = function(nes) {
	Base.apply(this, arguments);
};

Mapper93.prototype = Object.create(Base.prototype);

Mapper93.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper93.prototype.WriteSRAM = function(address, data) {
	if(address === 0x6000) {
		this.nes.SetPrgRomPage8K(0, data * 2);
		this.nes.SetPrgRomPage8K(1, data * 2 + 1);
	}
};

module.exports = Mapper93;

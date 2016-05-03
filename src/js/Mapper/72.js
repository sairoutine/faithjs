"use strict";

var Base = require('./Base');
/**** Mapper72 ****/
var Mapper72 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
};

Mapper72.prototype = Object.create(Base.prototype);

Mapper72.prototype.Init = function() {
	this.MAPPER_REG[0] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper72.prototype.Write = function(address, data) {
	var tmp;
	if((this.MAPPER_REG[0] & 0xC0) === 0x00) {
		if((data & 0x80) === 0x80) {
			tmp = (data & 0x07) * 2;
			this.nes.SetPrgRomPage8K(0, tmp);
			this.nes.SetPrgRomPage8K(1, tmp + 1);
		}
		if((data & 0x40) === 0x40) {
			tmp = (data & 0x0F) * 8;
			this.nes.SetChrRomPages1K(tmp, tmp + 1, tmp + 2, tmp + 3, tmp + 4, tmp + 5, tmp + 6, tmp + 7);
		}
	}
	this.MAPPER_REG[0] = data;
};

module.exports = Mapper72;

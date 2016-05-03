"use strict";

var Base = require('./Base');
/**** Mapper75 ****/
var Mapper75 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
};

Mapper75.prototype = Object.create(Base.prototype);

Mapper75.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, 0, 0, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
};

Mapper75.prototype.Write = function(address, data) {
	var tmp;
	switch (address) {
		case 0x8000:
			this.nes.SetPrgRomPage8K(0, data & 0x0F);
			break;

		case 0x9000:
			this.MAPPER_REG[0] = data;
			if((data & 0x01) === 0x00)
				this.nes.SetMirror(false);
			else
				this.nes.SetMirror(true);
			break;

		case 0xA000:
			this.nes.SetPrgRomPage8K(1, data & 0x0F);
			break;

		case 0xC000:
			this.nes.SetPrgRomPage8K(2, data & 0x0F);
			break;

		case 0xE000:
			tmp = (((this.MAPPER_REG[0] & 0x02) << 3) | (data & 0x0F)) << 2;
			this.nes.SetChrRomPage1K(0, tmp);
			this.nes.SetChrRomPage1K(1, tmp + 1);
			this.nes.SetChrRomPage1K(2, tmp + 2);
			this.nes.SetChrRomPage1K(3, tmp + 3);
			break;

		case 0xF000:
			tmp = (((this.MAPPER_REG[0] & 0x04) << 2) | (data & 0x0F)) << 2;
			this.nes.SetChrRomPage1K(4, tmp);
			this.nes.SetChrRomPage1K(5, tmp + 1);
			this.nes.SetChrRomPage1K(6, tmp + 2);
			this.nes.SetChrRomPage1K(7, tmp + 3);
			break;
	}
};

module.exports = Mapper75;

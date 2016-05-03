"use strict";

var Base = require('./Base');
/**** Mapper76 ****/
var Mapper76 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(1);
};

Mapper76.prototype = Object.create(Base.prototype);

Mapper76.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, 0, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 0, 0, 0, 0, 0, 0, 0);
	this.MAPPER_REG[0] = 0x00;
};

Mapper76.prototype.Write = function(address, data) {
	if(address === 0x8000)
		this.MAPPER_REG[0] = data & 0x07;

	if(address === 0x8001) {
		switch(this.MAPPER_REG[0]) {
			case 0x02:
				this.nes.SetChrRomPage1K(0, (data & 0x3F) * 2);
				this.nes.SetChrRomPage1K(1, (data & 0x3F) * 2 + 1);
				break;
			case 0x03:
				this.nes.SetChrRomPage1K(2, (data & 0x3F) * 2);
				this.nes.SetChrRomPage1K(3, (data & 0x3F) * 2 + 1);
				break;
			case 0x04:
				this.nes.SetChrRomPage1K(4, (data & 0x3F) * 2);
				this.nes.SetChrRomPage1K(5, (data & 0x3F) * 2 + 1);
				break;
			case 0x05:
				this.nes.SetChrRomPage1K(6, (data & 0x3F) * 2);
				this.nes.SetChrRomPage1K(7, (data & 0x3F) * 2 + 1);
				break;
			case 0x06:
				this.nes.SetPrgRomPage8K(0, data & 0x0F);
				break;
			case 0x07:
				this.nes.SetPrgRomPage8K(1, data & 0x0F);
				break;
		}
	}
};

module.exports = Mapper76;

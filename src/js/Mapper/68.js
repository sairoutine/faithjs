"use strict";

var Base = require('./Base');
/**** Mapper68 ****/
var Mapper68 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(8);
};

Mapper68.prototype = Object.create(Base.prototype);

Mapper68.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper68.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			this.nes.SetChrRomPage1K(0, data << 1);
			this.nes.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x9000:
			this.MAPPER_REG[1] = data;
			this.nes.SetChrRomPage1K(2, data << 1);
			this.nes.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA000:
			this.MAPPER_REG[2] = data;
			this.nes.SetChrRomPage1K(4, data << 1);
			this.nes.SetChrRomPage1K(5, (data << 1) + 1);
			break;
		case 0xB000:
			this.MAPPER_REG[3] = data;
			this.nes.SetChrRomPage1K(6, data << 1);
			this.nes.SetChrRomPage1K(7, (data << 1) + 1);
			break;
		case 0xC000:
			this.MAPPER_REG[4] = data;
			this.SetMirror();
			break;
		case 0xD000:
			this.MAPPER_REG[5] = data;
			this.SetMirror();
			break;
		case 0xE000:
			this.MAPPER_REG[6] = data;
			this.SetMirror();
			break;
		case 0xF000:
			this.MAPPER_REG[7] = data;
			this.nes.SetPrgRomPage8K(0, data << 1);
			this.nes.SetPrgRomPage8K(1, (data << 1) + 1);
			break;
	}
};

Mapper68.prototype.SetMirror = function() {
	switch (this.MAPPER_REG[6] & 0x11) {
		case 0x00:
			this.nes.SetMirror(false);
			break;
		case 0x01:
			this.nes.SetMirror(true);
			break;
		case 0x10:
			this.nes.SetChrRomPage1K(8, this.MAPPER_REG[4] | 0x80);
			this.nes.SetChrRomPage1K(9, this.MAPPER_REG[5] | 0x80);
			this.nes.SetChrRomPage1K(10, this.MAPPER_REG[4] | 0x80);
			this.nes.SetChrRomPage1K(11, this.MAPPER_REG[5] | 0x80);
			break;
		case 0x11:
			this.nes.SetChrRomPage1K(8, this.MAPPER_REG[4] | 0x80);
			this.nes.SetChrRomPage1K(9, this.MAPPER_REG[4] | 0x80);
			this.nes.SetChrRomPage1K(10, this.MAPPER_REG[5] | 0x80);
			this.nes.SetChrRomPage1K(11, this.MAPPER_REG[5] | 0x80);
			break;
	}
};

module.exports = Mapper68;

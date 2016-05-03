"use strict";

var Base = require('./Base');
/**** Mapper185 ****/
var Mapper185 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = 0;
	this.EX_ChrRom = new Array(0x0400);
};

Mapper185.prototype = Object.create(Base.prototype);

Mapper185.prototype.Init = function() {
	for(var i=0; i<this.EX_ChrRom.length; i++)
		this.EX_ChrRom[i] = 0xFF;
	this.MAPPER_REG = 0;

	this.nes.SetPrgRomPages8K(0, 1, 2, 3);
	this.nes.VRAM[0] = this.EX_ChrRom;
	this.nes.VRAM[1] = this.EX_ChrRom;
	this.nes.VRAM[2] = this.EX_ChrRom;
	this.nes.VRAM[3] = this.EX_ChrRom;
	this.nes.VRAM[4] = this.EX_ChrRom;
	this.nes.VRAM[5] = this.EX_ChrRom;
	this.nes.VRAM[6] = this.EX_ChrRom;
	this.nes.VRAM[7] = this.EX_ChrRom;
};

Mapper185.prototype.Write = function(address, data) {
	this.MAPPER_REG = data;

	if((data & 0x03) !== 0x00) {
		this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	} else {
		this.nes.VRAM[0] = this.EX_ChrRom;
		this.nes.VRAM[1] = this.EX_ChrRom;
		this.nes.VRAM[2] = this.EX_ChrRom;
		this.nes.VRAM[3] = this.EX_ChrRom;
		this.nes.VRAM[4] = this.EX_ChrRom;
		this.nes.VRAM[5] = this.EX_ChrRom;
		this.nes.VRAM[6] = this.EX_ChrRom;
		this.nes.VRAM[7] = this.EX_ChrRom;
	}
};

module.exports = Mapper185;

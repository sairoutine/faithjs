"use strict";

var Base = require('./Base');
/**** Mapper82 ****/
var Mapper82 = function(nes) {
	Base.apply(this, arguments);
	this.MAPPER_REG = new Array(13);
	this.EX_RAM = new Array(0x1400);
};

Mapper82.prototype = Object.create(Base.prototype);

Mapper82.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(i=0; i<this.EX_RAM.length; i++) {
		this.EX_RAM[i] = 0x00;
	}

	this.nes.SetPrgRomPages8K(0, 1, 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper82.prototype.ReadSRAM = function(address) {
	if(address >= 0x6000 && address <= 0x73FF)
		return this.EX_RAM[address - 0x6000];

	if(address >= 0x7EF0 && address <= 0x7EFC)
		return this.MAPPER_REG[address - 0x7EF0];
};

Mapper82.prototype.WriteSRAM = function(address, data) {
	if(address >= 0x6000 && address <= 0x73FF) {
		this.EX_RAM[address - 0x6000] = data;
		return;
	}

	switch(address) {
		case 0x7EF0:
			this.MAPPER_REG[0] = data;
			this.SetChr();
			break;
		case 0x7EF1:
			this.MAPPER_REG[1] = data;
			this.SetChr();
			break;
		case 0x7EF2:
			this.MAPPER_REG[2] = data;
			this.SetChr();
			break;
		case 0x7EF3:
			this.MAPPER_REG[3] = data;
			this.SetChr();
			break;
		case 0x7EF4:
			this.MAPPER_REG[4] = data;
			this.SetChr();
			break;
		case 0x7EF5:
			this.MAPPER_REG[5] = data;
			this.SetChr();
			break;
		case 0x7EF6:
			this.MAPPER_REG[6] = data;
			this.SetChr();
			if((data & 0x01) === 0x01)
				this.nes.SetMirror(false);
			else
				this.nes.SetMirror(true);
			break;
		case 0x7EF7:
			this.MAPPER_REG[7] = data;
			break;
		case 0x7EF8:
			this.MAPPER_REG[8] = data;
			break;
		case 0x7EF9:
			this.MAPPER_REG[9] = data;
			break;
		case 0x7EFA:
			this.MAPPER_REG[10] = data;
			this.nes.SetPrgRomPage8K(0, data >>> 2);
			break;
		case 0x7EFB:
			this.MAPPER_REG[11] = data;
			this.nes.SetPrgRomPage8K(1, data >>> 2);
			break;
		case 0x7EFC:
			this.MAPPER_REG[12] = data;
			this.nes.SetPrgRomPage8K(2, data >>> 2);
			break;
	}
};

Mapper82.prototype.SetChr = function() {
	if((this.MAPPER_REG[6] & 0x02) === 0x00) {
		this.nes.SetChrRomPage1K(0, this.MAPPER_REG[0] & 0xFE);
		this.nes.SetChrRomPage1K(1, (this.MAPPER_REG[0] & 0xFE) + 1);
		this.nes.SetChrRomPage1K(2, this.MAPPER_REG[1] & 0xFE);
		this.nes.SetChrRomPage1K(3, (this.MAPPER_REG[1] & 0xFE) + 1);
		this.nes.SetChrRomPage1K(4, this.MAPPER_REG[2]);
		this.nes.SetChrRomPage1K(5, this.MAPPER_REG[3]);
		this.nes.SetChrRomPage1K(6, this.MAPPER_REG[4]);
		this.nes.SetChrRomPage1K(7, this.MAPPER_REG[5]);
	} else {
		this.nes.SetChrRomPage1K(4, this.MAPPER_REG[0] & 0xFE);
		this.nes.SetChrRomPage1K(5, (this.MAPPER_REG[0] & 0xFE) + 1);
		this.nes.SetChrRomPage1K(6, this.MAPPER_REG[1] & 0xFE);
		this.nes.SetChrRomPage1K(7, (this.MAPPER_REG[1] & 0xFE) + 1);
		this.nes.SetChrRomPage1K(0, this.MAPPER_REG[2]);
		this.nes.SetChrRomPage1K(1, this.MAPPER_REG[3]);
		this.nes.SetChrRomPage1K(2, this.MAPPER_REG[4]);
		this.nes.SetChrRomPage1K(3, this.MAPPER_REG[5]);
	}
};

module.exports = Mapper82;

"use strict";

var MapperProto = require('./Base');
/**** Mapper67 ****/
var Mapper67 = function(nes) {
	MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(8);
	this.IRQ_Toggle = 0x00;
};

Mapper67.prototype = Object.create(MapperProto.prototype);

Mapper67.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, this.nes.ChrRomPageCount * 8 - 4, this.nes.ChrRomPageCount * 8 - 3, this.nes.ChrRomPageCount * 8 - 2, this.nes.ChrRomPageCount * 8 - 1);

	this.IRQ_Toggle = 0x00;
};

Mapper67.prototype.Write = function(address, data) {
	switch (address & 0xF800) {
		case 0x8800:
			this.MAPPER_REG[0] = data;
			this.nes.SetChrRomPage1K(0, data << 1);
			this.nes.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x9800:
			this.MAPPER_REG[1] = data;
			this.nes.SetChrRomPage1K(2, data << 1);
			this.nes.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA800:
			this.MAPPER_REG[2] = data;
			this.nes.SetChrRomPage1K(4, data << 1);
			this.nes.SetChrRomPage1K(5, (data << 1) + 1);
			break;
		case 0xB800:
			this.MAPPER_REG[3] = data;
			this.nes.SetChrRomPage1K(6, data << 1);
			this.nes.SetChrRomPage1K(7, (data << 1) + 1);
			break;
		case 0xC800:
			if(this.IRQ_Toggle === 0x00)
				this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x00FF) | (data << 8);
			else
				this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xFF00) | data;
			this.IRQ_Toggle ^= 0x01;
			break;
		case 0xD800:
			this.MAPPER_REG[5] = data;
			this.IRQ_Toggle = 0x00;
			this.ClearIRQ();
			break;
		case 0xE800:
			this.MAPPER_REG[6] = data;
			data &= 0x03;
			if(data === 0) {
				this.nes.SetMirror(false);
			} else if(data === 1) {
				this.nes.SetMirror(true);
			} else if(data === 2) {
				this.nes.SetMirrors(0, 0, 0, 0);
			} else {
				this.nes.SetMirrors(1, 1, 1, 1);
			}
			break;
		case 0xF800:
			this.MAPPER_REG[7] = data;
			this.nes.SetPrgRomPage8K(0, data << 1);
			this.nes.SetPrgRomPage8K(1, (data << 1) + 1);
			break;
	}
};

Mapper67.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[5] & 0x10) === 0x10) {
		this.MAPPER_REG[4] -= clock;
		if(this.MAPPER_REG[4] < 0) {
			this.MAPPER_REG[4] = 0xFFFF;
			this.MAPPER_REG[5] &= 0xEF;
			this.SetIRQ();
		}
	}
};

module.exports = Mapper67;

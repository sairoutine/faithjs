"use strict";

var MapperProto = require('./Base');
/**** Mapper22 ****/
var Mapper22 = function(nes) {
	MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(16);
};

Mapper22.prototype = Object.create(MapperProto.prototype);

Mapper22.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);

	if(this.nes.ChrRomPageCount !== 0) {
		this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
	}
};

Mapper22.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			if((this.MAPPER_REG[10] & 0x02) !== 0)
				this.nes.SetPrgRomPage8K(2, data);
			else
				this.nes.SetPrgRomPage8K(0, data);
			break;

		case 0xA000:
			this.nes.SetPrgRomPage8K(1, data);
			break;
	}

	switch (address & 0xF00F) {
		case 0x9000:
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

		case 0x9008:
			this.MAPPER_REG[10] = data;
			break;

		case 0xB000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(0, this.MAPPER_REG[0] >> 1);
			break;

		case 0xB002:
		case 0xB008:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(0, this.MAPPER_REG[0] >> 1);
			break;

		case 0xB001:
		case 0xB004:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(1, this.MAPPER_REG[1] >> 1);
			break;

		case 0xB003:
		case 0xB00C:
			this.MAPPER_REG[1] = (this.MAPPER_REG[1] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(1, this.MAPPER_REG[1] >> 1);
			break;

		case 0xC000:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(2, this.MAPPER_REG[2] >> 1);
			break;

		case 0xC002:
		case 0xC008:
			this.MAPPER_REG[2] = (this.MAPPER_REG[2] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(2, this.MAPPER_REG[2] >> 1);
			break;

		case 0xC001:
		case 0xC004:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(3, this.MAPPER_REG[3] >> 1);
			break;

		case 0xC003:
		case 0xC00C:
			this.MAPPER_REG[3] = (this.MAPPER_REG[3] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(3, this.MAPPER_REG[3] >> 1);
			break;

		case 0xD000:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(4, this.MAPPER_REG[4] >> 1);
			break;

		case 0xD002:
		case 0xD008:
			this.MAPPER_REG[4] = (this.MAPPER_REG[4] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(4, this.MAPPER_REG[4] >> 1);
			break;

		case 0xD001:
		case 0xD004:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(5, this.MAPPER_REG[5] >> 1);
			break;

		case 0xD003:
		case 0xD00C:
			this.MAPPER_REG[5] = (this.MAPPER_REG[5] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(5, this.MAPPER_REG[5] >> 1);
			break;

		case 0xE000:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(6, this.MAPPER_REG[6] >> 1);
			break;

		case 0xE002:
		case 0xE008:
			this.MAPPER_REG[6] = (this.MAPPER_REG[6] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(6, this.MAPPER_REG[6] >> 1);
			break;

		case 0xE001:
		case 0xE004:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0xF0) | (data & 0x0F);
			this.nes.SetChrRomPage1K(7, this.MAPPER_REG[7] >> 1);
			break;

		case 0xE003:
		case 0xE00C:
			this.MAPPER_REG[7] = (this.MAPPER_REG[7] & 0x0F) | ((data & 0x0F) << 4);
			this.nes.SetChrRomPage1K(7, this.MAPPER_REG[7] >> 1);
			break;
	}
};

module.exports = Mapper22;

"use strict";

var MapperProto = require('./Base');
/**** Mapper24 ****/
var Mapper24 = function(nes) {
	MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
};

Mapper24.prototype = Object.create(MapperProto.prototype);

Mapper24.prototype.Init = function() {
	this.MAPPER_REG[0] = 0x00;
	this.MAPPER_REG[1] = 0x00;
	this.MAPPER_REG[2] = 0x00;
	this.nes.SetPrgRomPages8K(0, 1, 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper24.prototype.Write = function(address, data) {
	switch(address & 0xF003) {
		case 0x8000:
		case 0x8001:
		case 0x8002:
		case 0x8003:
			this.nes.SetPrgRomPage8K(0, data * 2);
			this.nes.SetPrgRomPage8K(1, data * 2 + 1);
			break;


		case 0x9000:
		case 0x9001:
		case 0x9002:
			this.nes.Write_VRC6_REG(address & 0x03, data);
			break;


		case 0xA000:
		case 0xA001:
		case 0xA002:
			this.nes.Write_VRC6_REG((address & 0x03) + 4, data);
			break;


		case 0xB000:
		case 0xB001:
		case 0xB002:
			this.nes.Write_VRC6_REG((address & 0x03) + 8, data);
			break;


		case 0xB003:
			data &= 0x0C;
			if(data === 0x00) {
				this.nes.SetMirror(false);
			} else if(data === 0x04) {
				this.nes.SetMirror(true);
			} else if(data === 0x08) {
				this.nes.SetMirrors(0, 0, 0, 0);
			} else {
				this.nes.SetMirrors(1, 1, 1, 1);
			}
			break;

		case 0xC000:
		case 0xC001:
		case 0xC002:
		case 0xC003:
			this.nes.SetPrgRomPage8K(2, data);
			break;

		case 0xD000:
		case 0xD001:
		case 0xD002:
		case 0xD003:
			this.nes.SetChrRomPage1K(address & 0x03, data);
			break;

		case 0xE000:
		case 0xE001:
		case 0xE002:
		case 0xE003:
			this.nes.SetChrRomPage1K((address & 0x03) + 4, data);
			break;

		case 0xF000:
			this.MAPPER_REG[0] = data;
			break;

		case 0xF001:
			this.MAPPER_REG[1] = data & 0x07;
			if((this.MAPPER_REG[1] & 0x02) !== 0) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
			}
			break;

		case 0xF002:
			if((this.MAPPER_REG[1] & 0x01) !== 0) {
				this.MAPPER_REG[1] |= 0x02;
			} else {
				this.MAPPER_REG[1] &= 0x01;
			}
			this.ClearIRQ();
			break;
	}
};

Mapper24.prototype.HSync = function(y) {
	if((this.MAPPER_REG[1] & 0x06) === 0x02) {
		if(this.MAPPER_REG[2] === 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2]++;
	}
};

Mapper24.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[1] & 0x06) === 0x06) {
		if(this.MAPPER_REG[2] >= 0xFF) {
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			this.SetIRQ();
		} else
			this.MAPPER_REG[2] += clock;
	}
};

Mapper24.prototype.OutEXSound = function(soundin) {
	return (soundin >> 1) + (this.nes.Out_VRC6() >> 1);
};

Mapper24.prototype.EXSoundSync = function(clock) {
	this.nes.Count_VRC6(clock);
};

module.exports = Mapper24;

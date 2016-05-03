"use strict";

var MapperProto = require('./Base');
/**** Mapper85 ****/
var Mapper85 = function(nes) {
	MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(15);
	this.MAPPER_EXVRAM = new Array(8);
};

Mapper85.prototype = Object.create(MapperProto.prototype);

Mapper85.prototype.Init = function() {
	var i;
	for(i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	for(i=0; i<this.MAPPER_EXVRAM.length; i++) {
		this.MAPPER_EXVRAM[i] = new Array(1024);
		for(var j=0; j<this.MAPPER_EXVRAM[i].length; j++)
			this.MAPPER_EXVRAM[i][j] = 0x00;
	}

	this.nes.SetPrgRomPages8K(0, 1, 2, this.nes.PrgRomPageCount * 2 - 1);

	if(this.nes.ChrRomPageCount === 0) {
		this.nes.VRAM[0] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[1] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[2] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[3] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[4] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[5] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[6] = this.MAPPER_EXVRAM[0];
		this.nes.VRAM[7] = this.MAPPER_EXVRAM[0];
	} else
		this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);

};

Mapper85.prototype.Write = function(address, data) {
	switch(address & 0xF038) {
		case 0x8000:
			this.MAPPER_REG[0] = data;
			this.nes.SetPrgRomPage8K(0, data);
			break;
		case 0x8008:
		case 0x8010:
			this.MAPPER_REG[1] = data;
			this.nes.SetPrgRomPage8K(1, data);
			break;
		case 0x9000:
			this.MAPPER_REG[2] = data;
			this.nes.SetPrgRomPage8K(2, data);
			break;

		case 0xA000:
			this.MAPPER_REG[3] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[0] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(0, data);
			break;
		case 0xA008:
		case 0xA010:
			this.MAPPER_REG[4] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[1] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(1, data);
			break;
		case 0xB000:
			this.MAPPER_REG[5] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[2] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(2, data);
			break;
		case 0xB008:
		case 0xB010:
			this.MAPPER_REG[6] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[3] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(3, data);
			break;
		case 0xC000:
			this.MAPPER_REG[7] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[4] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(4, data);
			break;
		case 0xC008:
		case 0xC010:
			this.MAPPER_REG[8] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[5] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(5, data);
			break;
		case 0xD000:
			this.MAPPER_REG[9] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[6] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(6, data);
			break;
		case 0xD008:
		case 0xD010:
			this.MAPPER_REG[10] = data;
			if(this.nes.ChrRomPageCount === 0)
				this.nes.VRAM[7] = this.MAPPER_EXVRAM[data];// & 0x07];
			else
				this.nes.SetChrRomPage1K(7, data);
			break;

		case 0xE000:
			this.MAPPER_REG[14] = data;
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

		case 0xE008:
		case 0xE010:
			this.MAPPER_REG[13] = data;
			break;

		case 0xF000:
			this.MAPPER_REG[11] = data & 0x07;
			if((this.MAPPER_REG[11] & 0x02) !== 0) {
				this.MAPPER_REG[12] = this.MAPPER_REG[13];
			}
			break;
		case 0xF008:
		case 0xF010:
			if((this.MAPPER_REG[11] & 0x01) !== 0) {
				this.MAPPER_REG[11] |= 0x02;
			} else {
				this.MAPPER_REG[11] &= 0x01;
			}
			this.ClearIRQ();
			break;
	}
};

Mapper85.prototype.HSync = function(y) {
	if((this.MAPPER_REG[11] & 0x06) === 0x02) {
		if(this.MAPPER_REG[12] === 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12]++;
	}
};

Mapper85.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[11] & 0x06) === 0x06) {
		if(this.MAPPER_REG[12] >= 0xFF) {
			this.MAPPER_REG[12] = this.MAPPER_REG[13];
			this.SetIRQ();
		} else
			this.MAPPER_REG[12] += clock;
	}
};

module.exports = Mapper85;

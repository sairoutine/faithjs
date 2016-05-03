"use strict";

var MapperProto = require('./Base');
/**** Mapper48 ****/
var Mapper48 = function(nes) {
	MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
};

Mapper48.prototype = Object.create(MapperProto.prototype);

Mapper48.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper48.prototype.Write = function(address, data) {
	switch (address & 0xE003) {
		case 0x8000:
			this.nes.SetPrgRomPage8K(0, data);
			break;
		case 0x8001:
			this.nes.SetPrgRomPage8K(1, data);
			break;
		case 0x8002:
			this.nes.SetChrRomPage1K(0, data << 1);
			this.nes.SetChrRomPage1K(1, (data << 1) + 1);
			break;
		case 0x8003:
			this.nes.SetChrRomPage1K(2, data << 1);
			this.nes.SetChrRomPage1K(3, (data << 1) + 1);
			break;
		case 0xA000:
			this.nes.SetChrRomPage1K(4, data);
			break;
		case 0xA001:
			this.nes.SetChrRomPage1K(5, data);
			break;
		case 0xA002:
			this.nes.SetChrRomPage1K(6, data);
			break;
		case 0xA003:
			this.nes.SetChrRomPage1K(7, data);
			break;

		case 0xC000:
			this.MAPPER_REG[1] = data;
			this.MAPPER_REG[0] = 0;
			this.ClearIRQ();
			break;
		case 0xC001:
			this.MAPPER_REG[1] = data;
			this.MAPPER_REG[0] = 1;
			break;

		case 0xE000:
			if((data & 0x40) === 0x00)
				this.nes.SetMirror(false);
			else
				this.nes.SetMirror(true);
			break;
	}
};

Mapper48.prototype.HSync = function(y) {
	if(this.MAPPER_REG[0] === 1 && y < 240 && (this.nes.IO1[0x01] & 0x08) === 0x08) {
		if(this.MAPPER_REG[1] === 0xFF) {
			this.SetIRQ();
			this.MAPPER_REG[0] = 0;
		}
		this.MAPPER_REG[1]++;
	}
};

module.exports = Mapper48;

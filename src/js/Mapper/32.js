"use strict";

var MapperProto = require('./Base');
/**** Mapper32 ****/
var Mapper32 = function(nes) {
	MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(11);
};

Mapper32.prototype = Object.create(MapperProto.prototype);

Mapper32.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;

	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper32.prototype.Write = function(address, data) {
	switch (address & 0xF000) {
		case 0x8000:
			this.MAPPER_REG[8] = data;
			if((this.MAPPER_REG[10] & 0x02) === 0x00)
				this.nes.SetPrgRomPage8K(0, data);
			else
				this.nes.SetPrgRomPage8K(2, data);
			break;
		case 0x9000:
			this.MAPPER_REG[10] = data;
			if((data & 0x01) === 0x00)
				this.nes.SetMirror(false);
			else
				this.nes.SetMirror(true);

			if((data & 0x02) === 0x00) {
				this.nes.SetPrgRomPage8K(0, this.MAPPER_REG[8]);
				this.nes.SetPrgRomPage8K(2, (this.nes.PrgRomPageCount - 1) * 2);
			} else {
				this.nes.SetPrgRomPage8K(0, 0);
				this.nes.SetPrgRomPage8K(2, this.MAPPER_REG[8]);
			}
			break;
		case 0xA000:
			this.MAPPER_REG[9] = data;
			this.nes.SetPrgRomPage8K(1, data);
			break;
		case 0xB000:
			var tmp = address & 0x0007;
			this.MAPPER_REG[tmp] = data;
			this.nes.SetChrRomPage1K(tmp, data);
			break;
	}
};

module.exports = Mapper32;

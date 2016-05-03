"use strict";

var MapperProto = require('./Base');
/**** Mapper73 ****/
var Mapper73 = function(nes) {
	MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(3);
};

Mapper73.prototype = Object.create(MapperProto.prototype);

Mapper73.prototype.Init = function() {
	this.nes.SetPrgRomPages8K(0, 1, this.nes.PrgRomPageCount * 2 - 2, this.nes.PrgRomPageCount * 2 - 1);
	this.MAPPER_REG[0] = 0;
	this.MAPPER_REG[1] = 0;
	this.MAPPER_REG[2] = 0;
};

Mapper73.prototype.Write = function(address, data) {
	switch (address) {
		case 0x8000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xFFF0) | (data & 0x0F);
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			break;

		case 0x9000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xFF0F) | ((data & 0x0F) << 4);
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			break;

		case 0xA000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0xF0FF) | ((data & 0x0F) << 8);
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			break;

		case 0xB000:
			this.MAPPER_REG[0] = (this.MAPPER_REG[0] & 0x0FFF) | ((data & 0x0F) << 12);
			this.MAPPER_REG[2] = this.MAPPER_REG[0];
			break;

		case 0xC000:
			this.MAPPER_REG[1] = data & 0x07;
			if((this.MAPPER_REG[1] & 0x02) !== 0) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
			}
			break;

		case 0xD000:
			if((this.MAPPER_REG[1] & 0x01) !== 0) {
				this.MAPPER_REG[1] |= 0x02;
			} else {
				this.MAPPER_REG[1] &= 0x01;
			}
			this.ClearIRQ();
			break;

		case 0xF000:
			this.nes.SetPrgRomPage8K(0, data * 2);
			this.nes.SetPrgRomPage8K(1, data * 2 + 1);
			break;
	}
};

Mapper73.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[1] & 0x02) !== 0) {
		if((this.MAPPER_REG[1] & 0x04) !== 0) {
			this.MAPPER_REG[2] += clock;
			if(this.MAPPER_REG[2] > 0xFF) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
				this.SetIRQ();
			}
		} else {
			this.MAPPER_REG[2] += clock;
			if(this.MAPPER_REG[2] > 0xFFFF) {
				this.MAPPER_REG[2] = this.MAPPER_REG[0];
				this.SetIRQ();
			}
		}
	}
};

module.exports = Mapper73;

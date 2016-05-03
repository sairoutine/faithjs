"use strict";

var MapperProto = require('./Base');

/**** Mapper18 ****/
var Mapper18 = function(nes) {
	MapperProto.apply(this, arguments);
	this.MAPPER_REG = new Array(15);
	this.IRQ_Counter = 0;
};

Mapper18.prototype = Object.create(MapperProto.prototype);

Mapper18.prototype.Init = function() {
	for(var i=0; i<this.MAPPER_REG.length; i++)
		this.MAPPER_REG[i] = 0;
	this.IRQ_Counter = 0;

	this.nes.SetPrgRomPages8K(0, 1, 2, this.nes.PrgRomPageCount * 2 - 1);
	this.nes.SetChrRomPages1K(0, 1, 2, 3, 4, 5, 6, 7);
};

Mapper18.prototype.Write = function(address, data) {
	if(address >= 0x8000 && address < 0xE000) {
		var i = ((address & 0x7000) >>> 11) | ((address & 0x0002) >>> 1);
		if((address & 0x0001) === 0x0000)
			this.MAPPER_REG[i] = (this.MAPPER_REG[i] & 0xF0) | (data & 0x0F);
		else
			this.MAPPER_REG[i] = (this.MAPPER_REG[i] & 0x0F) | ((data & 0x0F) << 4);
		if(i < 3)
			this.nes.SetPrgRomPage8K(i, this.MAPPER_REG[i]);
		if(i >= 4)
			this.nes.SetChrRomPage1K(i - 4, this.MAPPER_REG[i]);
		return;
	}

	switch (address & 0xF003) {
		case 0xE000:
		case 0xE001:
		case 0xE002:
		case 0xE003:
			var tmp = (address & 0x0003) * 4;
			this.MAPPER_REG[12] = (this.MAPPER_REG[12] & ~(0x000F << tmp)) | ((data & 0x0F) << tmp);
			break;
		case 0xF000:
			this.IRQ_Counter = this.MAPPER_REG[12];
			this.ClearIRQ();
			break;
		case 0xF001:
			this.MAPPER_REG[13] = data;
			this.ClearIRQ();
			break;
		case 0xF002:
			this.MAPPER_REG[14] = data;
			data &= 0x03;
			if(data === 0) {
				this.nes.SetMirror(true);
			} else if(data === 1) {
				this.nes.SetMirror(false);
			} else if(data === 2) {
				this.nes.SetMirrors(0, 0, 0, 0);
			} else {
				this.nes.SetMirrors(1, 1, 1, 1);
			}
			break;
	}
};

Mapper18.prototype.CPUSync = function(clock) {
	if((this.MAPPER_REG[13] & 0x01) === 0x01) {
		var mask;
		switch(this.MAPPER_REG[13] & 0x0E) {
			case 0x00:
				mask = 0xFFFF;
				break;
			case 0x02:
				mask = 0x0FFF;
				break;
			case 0x04:
			case 0x06:
				mask = 0x00FF;
				break;
			case 0x08:
			case 0x0A:
			case 0x0C:
			case 0x0E:
				mask = 0x000F;
				break;
		}

		var tmp = (this.IRQ_Counter & mask) - clock;

		if(tmp < 0)
			this.SetIRQ();

		this.IRQ_Counter = (this.IRQ_Counter & ~mask) | (tmp & mask);
	}
};

module.exports = Mapper18;
